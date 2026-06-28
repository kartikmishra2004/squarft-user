import { BASE_URL } from './config';

async function request(path, token, options = {}) {
    const isMultipart = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const res = await fetch(`${BASE_URL}${path}`, {
        method: options.method ?? 'GET',
        headers: {
            ...(!isMultipart && { 'Content-Type': 'application/json' }),
            ...(token && { Authorization: `Bearer ${token}` }),
            ...(options.headers || {}),
        },
        ...(options.body && { body: options.body }),
    });
    const text = await res.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch (error) {
        throw new Error(
            res.ok
                ? `Invalid JSON response: ${error.message}`
                : `Server returned ${res.status} ${res.statusText || 'error'} instead of JSON`
        );
    }
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

const getList = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
};

const isUsefulText = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized && !['tbd', 'n/a', 'na', 'null', 'undefined', '-'].includes(normalized);
};

const normalizeTextKey = (value) => String(value || '').trim().toLowerCase();

const requestOptional = async (path, token) => {
    try {
        return await request(path, token);
    } catch (error) {
        console.log('Deal enrichment skipped:', error?.message || error);
        return null;
    }
};

const findProjectForProperty = (property, projects) => {
    const projectId = property?.project_id || property?.projectId;
    return projects.find((project) => projectId && String(project?.id) === String(projectId)) || null;
};

const enrichDealLocation = (deal, properties, projects) => {
    const property = properties.find((item) =>
        (deal.property_id && String(item?.id) === String(deal.property_id)) ||
        (deal.property_title && normalizeTextKey(item?.title) === normalizeTextKey(deal.property_title))
    );
    const project = findProjectForProperty(property, projects);

    return {
        ...deal,
        property_id: deal.property_id || property?.id,
        project_id: deal.project_id || property?.project_id || project?.id,
        city: isUsefulText(deal.city)
            ? deal.city
            : (isUsefulText(property?.city) ? property.city : (isUsefulText(project?.city) ? project.city : deal.city)),
        area: isUsefulText(deal.area)
            ? deal.area
            : (isUsefulText(property?.area) ? property.area : (isUsefulText(project?.area) ? project.area : deal.area)),
    };
};

const enrichDealsPayload = async (payload, token) => {
    const data = payload?.data || {};
    const rawDeals = Array.isArray(data.deals)
        ? data.deals
        : Array.isArray(data.items)
            ? data.items
            : Array.isArray(data)
                ? data
                : [];

    if (!rawDeals.length) return payload;
    const needsLocation = rawDeals.some((deal) => !isUsefulText(deal.city) || !isUsefulText(deal.area));
    if (!needsLocation) return payload;

    const [propertyResponse, projectResponse] = await Promise.all([
        requestOptional('/api/v1/properties/list?limit=500', token),
        requestOptional('/api/v1/projects/list', token),
    ]);
    const properties = getList(propertyResponse);
    const projects = getList(projectResponse);

    if (!properties.length && !projects.length) return payload;

    const enrichedDeals = rawDeals.map((deal) => enrichDealLocation(deal, properties, projects));
    if (Array.isArray(data)) {
        return {
            ...payload,
            data: enrichedDeals,
        };
    }

    return {
        ...payload,
        data: {
            ...data,
            deals: Array.isArray(data.deals) ? enrichedDeals : data.deals,
            items: Array.isArray(data.items) ? enrichedDeals : data.items,
        },
    };
};

const enrichSingleDealPayload = async (payload, token) => {
    const deal = payload?.data;
    if (!deal) return payload;

    const [propertyResponse, projectResponse, scheduleResponse] = await Promise.all([
        requestOptional('/api/v1/properties/list?limit=500', token),
        requestOptional('/api/v1/projects/list', token),
        Array.isArray(deal.payments) && deal.payments.length > 0
            ? Promise.resolve(null)
            : requestOptional(`/api/v1/deals/inventory/${deal.id}/payment-schedule`, token),
    ]);
    const properties = getList(propertyResponse);
    const projects = getList(projectResponse);
    const scheduleMilestones = getList(scheduleResponse?.data?.milestones ?? scheduleResponse?.milestones);
    const scheduleSummary = scheduleResponse?.data?.summary || scheduleResponse?.summary || {};
    const enrichedDeal = {
        ...enrichDealLocation(deal, properties, projects),
        total_value: deal.total_value ?? scheduleSummary.total_value,
        paid_so_far: deal.paid_so_far ?? scheduleSummary.collected_amount,
        payments: Array.isArray(deal.payments) && deal.payments.length > 0
            ? deal.payments
            : scheduleMilestones.map((milestone) => ({
                ...milestone,
                title: milestone.title || milestone.milestone || milestone.name || milestone.label,
                amount: milestone.amount,
                due_date: milestone.due_date,
                status: milestone.status,
            })),
    };

    return {
        ...payload,
        data: enrichedDeal,
    };
};

export const dealsApi = {
    getMyDeals: async (token) => {
        const payload = await request('/api/v1/deals', token);
        return enrichDealsPayload(payload, token);
    },

    getDealById: async (dealId, token) => {
        const payload = await request(`/api/v1/deals/${dealId}`, token);
        return enrichSingleDealPayload(payload, token);
    },

    submitPaymentProof: (dealId, paymentId, transaction_id, token) =>
        request(`/api/v1/deals/${dealId}/payments/${paymentId}/submit`, token, {
            method: 'POST',
            body: JSON.stringify({ transaction_id }),
        }),

    uploadDocument: (dealId, { name, type = 'kyc', file }, token) => {
        const formData = new FormData();
        formData.append('name', name);
        formData.append('type', type);
        formData.append('file', file);

        return request(`/api/v1/deals/${encodeURIComponent(dealId)}/documents`, token, {
            method: 'POST',
            body: formData,
        });
    },
};
