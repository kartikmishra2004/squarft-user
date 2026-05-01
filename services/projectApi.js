import { BASE_URL } from './config';

async function request(path, token = null) {
    try {
        const url = `${BASE_URL}${path}`;
        
        
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch(url, { headers });
        
        
        
        const text = await res.text();
        
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.log(' Failed to parse JSON. Full response:', text);
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

export const projectApi = {
    // Get all projects (for search suggestions)
    listProjects: () =>
        request('/api/v1/projects/list'),

    // Get project details by slug
    getProjectDetails: (slug) =>
        request(`/api/v1/overview/${slug}`),

   
    getProjectFloorPlans: (slug, token) =>
        request(`/api/v1/overview/${slug}/floor-plans`, token),

    // Get resale properties in a project
    getProjectResale: (slug) =>
        request(`/api/v1/projects/${slug}/resale`),

    // Get project landmarks
    getProjectLandmarks: (slug) =>
        request(`/api/v1/highlights/${slug}/landmarks`),

    // Get project amenities
    getProjectAmenities: (slug) =>
        request(`/api/v1/highlights/${slug}/amenities`),

    // Get similar properties
    getSimilarProperties: (slug) =>
        request(`/api/v1/projects/${slug}/similar`),

    // Get featured projects
    getFeaturedProjects: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/v1/projects/featured${query ? `?${query}` : ''}`);
    },
};
