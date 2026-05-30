import { BASE_URL } from './config';

export const builderApi = {
    /**
     * Get builder details and their projects
     * @param {string} builderId - Builder UUID
     * @param {string} token - Optional auth token
     * @returns {Promise} Builder details with projects
     */
    getBuilderDetails: async (builderId, token = null) => {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const url = `${BASE_URL}/api/builders/${builderId}`;
            console.log(`📡 Fetching builder details from: ${url}`);
            console.log(`📡 Builder ID: ${builderId}`);
            
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

            console.log('✅ Builder details fetched:', data.data);
            return data;
        } catch (error) {
            console.log('⚠️ Builder API error (will use local data):', error.message || error);
            throw error.message || 'Failed to fetch builder details';
        }
    },
};
