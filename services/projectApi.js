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
    listProjects: async (token) => {
        const res = await request('/api/v1/projects/list', token);
        
        return res;
    },

    // Get project details by slug
    getProjectDetails: async (slug,token) => {
        const res = await request(`/api/v1/overview/${slug}`, token);
        
        return res;
    },

    // Get project floor plans by slug
    getProjectFloorPlans: async (slug, token) => {
        const res = await request(`/api/v1/overview/${slug}/floor-plans`, token);
        
        return res;
    },

    
    // Get resale properties in a project
    getProjectResale: (slug, token) =>
        request(`/api/v1/overview/${slug}/resale`, token),

    // Get project landmarks
    getProjectLandmarks: (slug, token) =>
        request(`/api/v1/highlights/${slug}/landmarks`, token),

    // Get project amenities
    getProjectAmenities: (slug, token) =>
        request(`/api/v1/highlights/${slug}/amenities`, token),

    // Get similar properties
    getSimilarProperties: (slug, token) =>
        request(`/api/v1/overview/${slug}/similar`, token),

    // Get featured projects
    getFeaturedProjects: (params = {}, token) => {
        const query = new URLSearchParams(params).toString();
        return request(`/api/v1/projects/featured${query ? `?${query}` : ''}`, token);
    },
};
