import { BASE_URL } from './config';

async function request(path, options = {}) {
    try {
        const url = `${BASE_URL}${path}`;
        console.log('🌐 Property API Request:', { url, method: options.method || 'GET' });

        const { headers: optHeaders, ...restOptions } = options;
        
        const res = await fetch(url, {
            ...restOptions,
            headers: { 
                'Content-Type': 'application/json',
                ...optHeaders,
            },
        });
        
        console.log('📡 Property API Response Status:', res.status);
        
        const text = await res.text();
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.log('❌ Failed to parse JSON:', text.substring(0, 200));
            throw new Error(`Invalid JSON response: ${e.message}`);
        }
        
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
    } catch (error) {
        if (error.message === 'Network request failed') {
            throw new Error('Cannot connect to server.');
        }
        throw error;
    }
}

export const propertyApi = {
    // Get saved properties
    getSavedProperties: (token) =>
        request('/api/v1/properties/saved', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }),

    // Save a property
    saveProperty: (token, propertyId) =>
        request(`/api/v1/properties/save/${propertyId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }),

    // Unsave a property
    unsaveProperty: (token, propertyId) =>
        request(`/api/v1/properties/save/${propertyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }),
};
