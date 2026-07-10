import { BASE_URL } from './config';

async function request(path, options = {}) {
    try {
        const url = `${BASE_URL}${path}`;
        

        const { headers: optHeaders, ...restOptions } = options;
        
        const res = await fetch(url, {
            ...restOptions,
            headers: { 
                'Content-Type': 'application/json',
                ...optHeaders,
            },
        });
        
     
        
        const text = await res.text();
        
        
        let data;
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            const message = res.ok
                ? `Invalid JSON response: ${e.message}`
                : `Server returned ${res.status} ${res.statusText || 'error'} instead of JSON`;
            throw new Error(message);
        }
        
        if (!res.ok) throw new Error(data.message || 'Request failed');
        return data;
    } catch (error) {
        if (error.message === 'Network request failed') {
            throw new Error('Cannot connect to server. Make sure your phone and computer are on the same Wi-Fi network.');
        }
        throw error;
    }
}

export const searchApi = {
    searchPropertiesAndProjects: ({ query, latitude, longitude, limit = 20, token } = {}) => {
        const params = new URLSearchParams({ q: String(query || '').trim(), limit: String(limit) });
        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            params.set('latitude', String(latitude));
            params.set('longitude', String(longitude));
        }
        return request(`/api/v1/search?${params.toString()}`, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
    },

    // Get trending searches (no auth required)
    getTrendingSearches: ({ latitude, longitude, city, token } = {}) => {
        const params = new URLSearchParams();
        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            params.set('latitude', String(latitude));
            params.set('longitude', String(longitude));
        } else if (city) {
            params.set('city', String(city).trim());
        }
        const query = params.toString();
        return request(`/api/v1/search/trending${query ? `?${query}` : ''}`, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
    },

    // Get popular project locations (no auth required)
    getTrendingLocations: () =>
        request('/api/v1/search/trending-locations', {
            method: 'GET',
        }),

    // Get user's search history (auth required)
    getSearchHistory: (token) =>
        request('/api/v1/search/history', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }),

    // Save search to history (auth required)
    saveSearchHistory: (token, query_text, filters, result_count) =>
        request('/api/v1/search/history', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ query_text, filters, result_count }),
        }),

    // Delete one search history item (auth required)
    deleteSearchHistory: (token, id) => {
        if (!id) throw new Error('Search history id is missing');

        return request(`/api/v1/search/history/single/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
    },

    // Clear all search history (auth required)
    clearAllSearchHistory: (token) =>
        request('/api/v1/search/history/all', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }),
};
