import { BASE_URL } from './config';

async function request(path, options = {}) {
    try {
        const url = `${BASE_URL}${path}`;
        const hasAuth = !!options.headers?.Authorization;
        

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
            data = JSON.parse(text);
        } catch (e) {
            console.log('❌ Failed to parse JSON. Full response:', text);
            throw new Error(`Invalid JSON response: ${e.message}`);
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
    // Get trending searches (no auth required)
    getTrendingSearches: () =>
        request('/api/v1/search/trending', {
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

    // Delete search history item (auth required)
    deleteSearchHistory: (token, id) =>
        request(`/api/v1/search/history/single/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }),

    // Clear all search history (auth required) - using dummy id since backend expects :id param
    clearAllSearchHistory: (token) =>
        request('/api/v1/search/history/all', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        }),
};
