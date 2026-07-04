import { BASE_URL } from './config';

export const builderApi = {
    /**
     * Get builder details and their projects
     * @param {string} builderId - Builder UUID
     * @param {string} token - Optional auth token
     * @param {object} params - Optional query parameters (possession, page, limit)
     * @returns {Promise} Builder details with projects
     */
    getBuilderDetails: async (builderId, token = null, params = {}) => {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Build query string from params
            const queryParams = new URLSearchParams();
            if (params.possession) {
                // Map frontend filter to backend format
                const possessionMap = {
                    'All': 'ALL',
                    'In 3 yrs': 'IN_3_YEARS',
                    'Ready To Move': 'READY_TO_MOVE',
                    'Under Construction': 'UNDER_CONSTRUCTION',
                };
                const backendPossession = possessionMap[params.possession] || params.possession || 'ALL';
                queryParams.append('possession', backendPossession);
            }
            if (params.page) queryParams.append('page', params.page);
            if (params.limit) queryParams.append('limit', params.limit);

            const queryString = queryParams.toString();
            const url = `${BASE_URL}/api/builders/${builderId}${queryString ? `?${queryString}` : ''}`;
            console.log(`📡 Fetching builder details from: ${url}`);
            console.log(`📡 Builder ID: ${builderId}`, params ? `with params: ${JSON.stringify(params)}` : '');
            
            const response = await fetch(url, {
                method: 'GET',
                headers,
            });

            console.log(`📊 Response status: ${response.status}`);
            console.log(`📊 Response content-type: ${response.headers.get('content-type')}`);

            // Check if response is JSON before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('❌ Non-JSON response received:', text.substring(0, 200));
                throw new Error('Server returned non-JSON response. Check if builder ID is valid.');
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch builder details');
            }

            console.log('✅ Builder details fetched:', {
                builder: data.data.builder.name,
                projectCount: data.data.projects?.length || 0,
                totalProjects: data.data.totalProjects,
                possession: data.data.possession,
            });
            return data;
        } catch (error) {
            console.log('⚠️ Builder API error (will use local data):', error.message || error);
            throw error.message || 'Failed to fetch builder details';
        }
    },
};
