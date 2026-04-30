import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dealsApi } from '../../services/dealsApi';

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
    async ({ dealId, name }, { getState, rejectWithValue }) => {
        try {
            const token = getState().auth.token;
            return await dealsApi.uploadDocument(dealId, name, token);
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
                state.deals = action.payload.data.deals;
                state.stats = action.payload.data.stats;
            })
            .addCase(fetchMyDeals.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

            // fetchDealById
            .addCase(fetchDealById.pending, (state) => { state.currentDealLoading = true; state.currentDealError = null; })
            .addCase(fetchDealById.fulfilled, (state, action) => {
                state.currentDealLoading = false;
                state.currentDeal = action.payload.data;
            })
            .addCase(fetchDealById.rejected, (state, action) => { state.currentDealLoading = false; state.currentDealError = action.payload; })

            // submitPaymentProof
            .addCase(submitPaymentProof.pending, (state) => { state.submitting = true; state.submitError = null; })
            .addCase(submitPaymentProof.fulfilled, (state, action) => {
                state.submitting = false;
                if (state.currentDeal?.payments) {
                    const idx = state.currentDeal.payments.findIndex(p => p.id === action.payload.data.id);
                    if (idx !== -1) state.currentDeal.payments[idx] = action.payload.data;
                }
            })
            .addCase(submitPaymentProof.rejected, (state, action) => { state.submitting = false; state.submitError = action.payload; })

            // uploadDocument
            .addCase(uploadDocument.pending, (state) => { state.uploading = true; state.uploadError = null; })
            .addCase(uploadDocument.fulfilled, (state, action) => {
                state.uploading = false;
                if (state.currentDeal) {
                    state.currentDeal.documents = [
                        ...(state.currentDeal.documents ?? []),
                        action.payload.data,
                    ];
                }
            })
            .addCase(uploadDocument.rejected, (state, action) => { state.uploading = false; state.uploadError = action.payload; });
    },
});

export const { clearCurrentDeal, clearSubmitError, clearUploadError } = dealsSlice.actions;
export default dealsSlice.reducer;
