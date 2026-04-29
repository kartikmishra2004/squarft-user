import { BASE_URL } from './config';

async function request(path, token = null) {
    try {
        const url = `${BASE_URL}${path}`;
        console.log('🌐 API Request:', { url, hasToken: !!token });
        
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch(url, { headers });
        
        console.log('📡 API Response Status:', res.status, res.statusText);
        
        const text = await res.text();
        console.log('📄 API Response Text (first 200 chars):', text.substring(0, 200));
        
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
        request(`/api/v1/projects/${slug}`),

    // Get floor plans for a project (auth required)
    getProjectFloorPlans: (slug, token) =>
        request(`/api/v1/projects/${slug}/floor-plans`, token),

    // Get resale properties in a project
    getProjectResale: (slug) =>
        request(`/api/v1/projects/${slug}/resale`),

    // Get project landmarks
    getProjectLandmarks: (slug) =>
        request(`/api/v1/projects/${slug}/landmarks`),

    // Get project amenities
    getProjectAmenities: (slug) =>
        request(`/api/v1/projects/${slug}/amenities`),
};
