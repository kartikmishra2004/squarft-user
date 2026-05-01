import { BASE_URL } from './config';

async function request(path, token, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: options.method ?? 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...(options.body && { body: options.body }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
}

export const dealsApi = {
    getMyDeals: (token) =>
        request('/api/v1/deals', token),

    getDealById: (dealId, token) =>
        request(`/api/v1/deals/${dealId}`, token),

    submitPaymentProof: (dealId, paymentId, transaction_id, token) =>
        request(`/api/v1/deals/${dealId}/payments/${paymentId}/submit`, token, {
            method: 'POST',
            body: JSON.stringify({ transaction_id }),
        }),

    uploadDocument: (dealId, name, token) =>
        request(`/api/v1/deals/${dealId}/documents`, token, {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),
};
