import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dealsApi } from '../../services/dealsApi';

const normalizeStatus = (status, fallback = 'pending') => {
    const normalized = String(status || fallback).trim().toLowerCase().replace(/\s+/g, '_');
    if (['deal_in_process', 'payment_schedule', 'confirmed'].includes(normalized)) return 'active';
    if (['pending_confirmation', 'pending_verification'].includes(normalized)) return 'pending';
    if (['completed', 'deal_completed'].includes(normalized)) return 'completed';
    return normalized;
};

const normalizePaymentStatus = (status) => {
    const normalized = normalizeStatus(status, 'upcoming');
    if (normalized === 'pending') return 'upcoming';
    if (normalized === 'completed') return 'paid';
    return normalized;
};

const toNumber = (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

// Deal identifiers come from the API and are UUID-shaped, but legacy/test
// records are not guaranteed to use RFC 4122 version/variant bits (for example
// `11111111-1111-1111-1111-111111111111`). Validate the transport shape here
// instead of rejecting an identifier that the deals API itself returned.
const UUID_REGEX = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export const isDealApiId = (value) => UUID_REGEX.test(String(value || '').trim());

const normalizeDealKey = (value) => String(value || '').trim().replace(/^#/, '');

const logDealUploadDebug = (...args) => {
    if (globalThis.__DEV__ === false) return;
    console.log('[DealDocumentUpload]', ...args);
};

const summarizeDealForDebug = (deal = {}) => ({
    id: deal.id,
    deal_id: deal.deal_id,
    dealId: deal.dealId,
    deal_code: deal.deal_code,
    dealCode: deal.dealCode,
    apiDealId: deal.apiDealId,
    uuid: deal.uuid,
    deal_uuid: deal.deal_uuid,
    dealUuid: deal.dealUuid,
    property_title: deal.property_title,
    title: deal.title,
    keys: Object.keys(deal).sort(),
});

const getDealApiId = (deal = {}) => {
    const candidates = [
        deal.apiDealId,
        deal.api_deal_id,
        deal.uuid,
        deal.deal_uuid,
        deal.dealUuid,
        deal.deal_id,
        deal.dealId,
        deal.id,
    ];

    return candidates.find(isDealApiId) || null;
};

const cleanText = (value) => {
    const text = String(value || '').trim();
    return text && !['tbd', 'n/a', 'na', 'null', 'undefined', '-'].includes(text.toLowerCase())
        ? text
        : '';
};

const addDays = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

const normalizePayment = (payment = {}) => ({
    ...payment,
    status: normalizePaymentStatus(payment.status),
    title: payment.title || payment.milestone || 'Payment Milestone',
    amount: toNumber(payment.amount),
    due_date: payment.due_date || payment.dueDate || payment.date || null,
});

const buildFallbackPayments = (deal = {}) => {
    const totalValue = toNumber(deal.total_value ?? deal.negotiation_price ?? deal.deal_value);
    if (!totalValue) return [];

    const paidSoFar = toNumber(deal.paid_so_far ?? deal.paid_amount ?? deal.received_amount);
    let paidRemaining = paidSoFar;
    const schedule = [
        { key: 'booking', title: 'Booking Amount', percent: 10, dueInDays: 0 },
        { key: 'agreement', title: 'Agreement Payment', percent: 40, dueInDays: 30 },
        { key: 'registration', title: 'Registration Payment', percent: 30, dueInDays: 60 },
        { key: 'handover', title: 'Final Handover Payment', percent: 20, dueInDays: 90 },
    ];

    return schedule.map((milestone) => {
        const amount = Math.round((totalValue * milestone.percent) / 100);
        const isPaid = paidRemaining >= amount;
        paidRemaining = Math.max(0, paidRemaining - amount);

        return normalizePayment({
            id: `${deal.id || 'deal'}-${milestone.key}`,
            title: milestone.title,
            amount,
            due_date: addDays(milestone.dueInDays),
            status: isPaid ? 'paid' : milestone.dueInDays === 0 ? 'due_soon' : 'upcoming',
            is_generated: true,
        });
    });
};

const normalizeDocument = (document = {}) => ({
    ...document,
    status: normalizeStatus(document.status, document.file_url || document.url ? 'verified' : 'required'),
    title: document.title || document.name || 'Document',
    name: document.name || document.title || 'Document',
    file_url: document.file_url || document.url || null,
    category: document.category || document.type || 'DOCUMENTS',
});

const normalizeTimelineItem = (item = {}, index = 0) => ({
    ...item,
    id: item.id ?? `${item.deal_id || 'timeline'}-${index}`,
    status: item.status ? normalizeStatus(item.status) : null,
    title: item.stage_name || item.title || item.milestone || 'Deal update',
    details: item.details || item.description || '',
    created_at: item.created_at || item.completed_at || null,
});

const normalizeDeal = (deal = {}) => {
    const payments = Array.isArray(deal.payments) ? deal.payments.map(normalizePayment) : [];
    const apiDealId = getDealApiId(deal);

    return {
        ...deal,
        apiDealId,
        status: normalizeStatus(deal.status),
        total_value: toNumber(deal.total_value ?? deal.negotiation_price ?? deal.deal_value),
        paid_so_far: toNumber(deal.paid_so_far ?? deal.paid_amount ?? deal.received_amount),
        current_stage_index: toNumber(deal.current_stage_index ?? deal.currentStageIndex ?? deal.stage_index, 0),
        property_title: deal.property_title || deal.property_name || deal.title || 'Property',
        city: cleanText(deal.city),
        area: cleanText(deal.area) || cleanText(deal.pref_location),
        payments: payments.length > 0 ? payments : buildFallbackPayments(deal),
        documents: Array.isArray(deal.documents) ? deal.documents.map(normalizeDocument) : [],
        timeline: Array.isArray(deal.timeline) ? deal.timeline.map(normalizeTimelineItem) : [],
    };
};

const findDealApiId = (dealId, state) => {
    if (isDealApiId(dealId)) {
        const apiDealId = String(dealId).trim();
        logDealUploadDebug('route id is already a UUID', { dealId: apiDealId });
        return apiDealId;
    }

    const dealsState = state.deals || {};
    const candidates = [
        dealsState.currentDeal,
        ...(Array.isArray(dealsState.deals) ? dealsState.deals : []),
    ].filter(Boolean);
    const requested = normalizeDealKey(dealId);
    const matchedDeals = candidates.filter((deal) => [
        deal.id,
        deal.deal_id,
        deal.dealId,
        deal.deal_code,
        deal.dealCode,
        deal.displayId,
        deal.display_id,
    ].some((value) => normalizeDealKey(value) === requested));
    const apiDealId = matchedDeals.map(getDealApiId).find(Boolean) || null;

    logDealUploadDebug('resolved upload id', {
        incomingDealId: dealId,
        normalizedIncomingDealId: requested,
        resolvedApiDealId: apiDealId,
        currentDeal: summarizeDealForDebug(dealsState.currentDeal || {}),
        matchedDeals: matchedDeals.map(summarizeDealForDebug),
        firstFiveDeals: candidates.slice(0, 5).map(summarizeDealForDebug),
    });

    return apiDealId;
};

const normalizeMyDealsResponse = (payload = {}) => {
    const data = payload.data || {};
    const rawDeals = Array.isArray(data.deals)
        ? data.deals
        : Array.isArray(data.items)
            ? data.items
            : Array.isArray(data)
                ? data
                : [];
    const deals = rawDeals.map(normalizeDeal);
    const derivedStats = deals.reduce((acc, deal) => {
        if (deal.status === 'active') acc.active += 1;
        if (deal.status === 'pending') acc.pending += 1;
        acc.totalValue += deal.total_value;
        return acc;
    }, { active: 0, pending: 0, totalValue: 0 });
    const stats = data.stats || {};

    return {
        deals,
        stats: {
            active: toNumber(stats.active, derivedStats.active),
            pending: toNumber(stats.pending, derivedStats.pending),
            totalValue: toNumber(stats.totalValue ?? stats.total_value, derivedStats.totalValue),
        },
    };
};

export const fetchMyDeals = createAsyncThunk(
    'deals/fetchMyDeals',
    async (_, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            return await dealsApi.getMyDeals(token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchDealById = createAsyncThunk(
    'deals/fetchDealById',
    async (dealId, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            return await dealsApi.getDealById(dealId, token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const submitPaymentProof = createAsyncThunk(
    'deals/submitPaymentProof',
    async ({ dealId, paymentId, transaction_id }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            return await dealsApi.submitPaymentProof(dealId, paymentId, transaction_id, token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const uploadDocument = createAsyncThunk(
    'deals/uploadDocument',
    async ({ dealId, name, type, file }, { getState, rejectWithValue }) => {
        try {
            const state = getState();
            const token = state.auth.token;
            const apiDealId = findDealApiId(dealId, state);

            logDealUploadDebug('upload thunk input', {
                dealId,
                apiDealId,
                name,
                type,
                fileName: file?.name,
                fileType: file?.type,
            });

            if (!apiDealId) {
                return rejectWithValue('Unable to upload: deal UUID is missing.');
            }

            return await dealsApi.uploadDocument(apiDealId, { name, type, file }, token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const dealsSlice = createSlice({
    name: 'deals',
    initialState: {
        deals: [],
        stats: { active: 0, pending: 0, totalValue: 0 },
        loading: false,
        error: null,
        currentDeal: null,
        currentDealLoading: false,
        currentDealError: null,
        submitting: false,
        submitError: null,
        uploading: false,
        uploadError: null,
    },
    reducers: {
        clearCurrentDeal: (state) => {
            state.currentDeal = null;
            state.currentDealError = null;
        },
        clearSubmitError: (state) => {
            state.submitError = null;
        },
        clearUploadError: (state) => {
            state.uploadError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchMyDeals
            .addCase(fetchMyDeals.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchMyDeals.fulfilled, (state, action) => {
                state.loading = false;
                const { deals, stats } = normalizeMyDealsResponse(action.payload);
                state.deals = deals;
                state.stats = stats;
            })
            .addCase(fetchMyDeals.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // fetchDealById
            .addCase(fetchDealById.pending, (state) => { state.currentDealLoading = true; state.currentDealError = null; })
            .addCase(fetchDealById.fulfilled, (state, action) => {
                state.currentDealLoading = false;
                state.currentDeal = normalizeDeal(action.payload.data || {});
            })
            .addCase(fetchDealById.rejected, (state, action) => { state.currentDealLoading = false; state.currentDealError = action.payload; })

            // submitPaymentProof
            .addCase(submitPaymentProof.pending, (state) => { state.submitting = true; state.submitError = null; })
            .addCase(submitPaymentProof.fulfilled, (state, action) => {
                state.submitting = false;
                if (state.currentDeal?.payments) {
                    const payment = normalizePayment(action.payload.data);
                    const idx = state.currentDeal.payments.findIndex(p => p.id === payment.id);
                    if (idx !== -1) state.currentDeal.payments[idx] = payment;
                }
            })
            .addCase(submitPaymentProof.rejected, (state, action) => { state.submitting = false; state.submitError = action.payload; })

            // uploadDocument
            .addCase(uploadDocument.pending, (state) => { state.uploading = true; state.uploadError = null; })
            .addCase(uploadDocument.fulfilled, (state, action) => {
                state.uploading = false;
                const document = action.payload.data?.document || action.payload.data;
                if (state.currentDeal) {
                    state.currentDeal.documents = [
                        ...(state.currentDeal.documents ?? []),
                        normalizeDocument(document),
                    ];
                }
            })
            .addCase(uploadDocument.rejected, (state, action) => { state.uploading = false; state.uploadError = action.payload; });
    },
});

export const { clearCurrentDeal, clearSubmitError, clearUploadError } = dealsSlice.actions;
export default dealsSlice.reducer;
