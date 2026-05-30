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

export const visitApi = {
    // Get list of visits by status
    getVisitList: (token, status) =>
        request(`/api/v1/visit/list?status=${status}`, token),

    // Get branches by city
    getBranchList: (token, city) =>
        request(`/api/v1/visit/branches?city=${city}`, token),

    // Get available time slots
    getAvailableSlots: (token, property_id, date, branch_id) =>
        request(`/api/v1/visit/slots?property_id=${property_id}&date=${date}&branch_id=${branch_id}`, token),

    // Create site visit
    createSiteVisit: (token, visitData) =>
        request('/api/v1/visit/confirm', token, {
            method: 'POST',
            body: JSON.stringify(visitData),
        }),

    // Update site visit
    updateSiteVisit: (token, visitId, updateData) =>
        request(`/api/v1/visit/update/${visitId}`, token, {
            method: 'POST',
            body: JSON.stringify(updateData),
        }),
};
