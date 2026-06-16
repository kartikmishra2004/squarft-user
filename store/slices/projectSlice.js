import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectApi } from '../../services/projectApi';

export const fetchProjectListThunk = createAsyncThunk(
    'project/fetchList',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            return await projectApi.listProjects(token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchProjectDetailsThunk = createAsyncThunk(
    'project/fetchDetails',
    async (slug, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            return await projectApi.getProjectDetails(slug, token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchFloorPlansThunk = createAsyncThunk(
    'project/fetchFloorPlans',
    async (slug, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            return await projectApi.getProjectFloorPlans(slug, token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchResaleThunk = createAsyncThunk(
    'project/fetchResale',
    async (slug, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            return await projectApi.getProjectResale(slug, token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchLandmarksThunk = createAsyncThunk(
    'project/fetchLandmarks',
    async (slug, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            return await projectApi.getProjectLandmarks(slug, token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchAmenitiesThunk = createAsyncThunk(
    'project/fetchAmenities',
    async (slug, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            return await projectApi.getProjectAmenities(slug, token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchSimilarPropertiesThunk = createAsyncThunk(
    'project/fetchSimilarProperties',
    async (slug, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            return await projectApi.getSimilarProperties(slug, token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchFeaturedProjectsThunk = createAsyncThunk(
    'project/fetchFeatured',
    async (params = {}, { rejectWithValue }) => {
        try {
            console.log('🔥 [fetchFeaturedProjectsThunk] Calling API with params:', params);
            const response = await projectApi.getFeaturedProjects(params);
            console.log('🔥 [fetchFeaturedProjectsThunk] API Response:', {
                isArray: Array.isArray(response),
                hasData: !!response?.data,
                dataLength: Array.isArray(response) ? response.length : response?.data?.length,
                sample: Array.isArray(response) ? response[0] : response?.data?.[0]
            });
            return response;
        } catch (e) {
            console.log('❌ [fetchFeaturedProjectsThunk] Error:', e.message);
            return rejectWithValue(e.message);
        }
    }
);

const normalizeFeaturedProjects = (payload) => {
    const list = Array.isArray(payload) ? payload : (payload?.data || []);
    
    console.log('🔄 [normalizeFeaturedProjects] Input:', {
        isArray: Array.isArray(payload),
        hasData: !!payload?.data,
        listLength: list.length,
        firstItem: list[0]
    });

    const normalized = list.map((project, index) => ({
        ...project,
        // ID mapping
        id: project.id ?? project.project_id ?? project.slug ?? `featured-${index}`,
        
        // Name/Title mapping
        title: project.name ?? project.title ?? project.project_name ?? project.projectTitle,
        name: project.name ?? project.title ?? project.project_name ?? project.projectTitle,
        
        // Location mapping
        location: project.location ?? [project.area, project.city].filter(Boolean).join(', '),
        
        // Image mapping - backend returns cover_image_url
        image: project.cover_image_url ?? project.image_url ?? project.cover_image ?? project.image ?? project.imageMain,
        image_url: project.cover_image_url ?? project.image_url ?? project.cover_image ?? project.image,
        
        // Price mapping - backend returns price_from and price_to
        price_from: project.price_from ?? project.min_price ?? project.priceFrom,
        price_to: project.price_to ?? project.max_price ?? project.priceTo,
        
        // Legacy price fields for backward compatibility
        priceINR: project.priceINR ?? project.price ?? project.price_range ?? project.priceRange,
    }));
    
    console.log('✅ [normalizeFeaturedProjects] Output:', {
        count: normalized.length,
        sample: normalized[0]
    });
    
    return normalized;
};

const projectSlice = createSlice({
    name: 'project',
    initialState: {
        list: [],
        details: null,
        floorPlans: null,
        resale: [],
        landmarks: [],
        amenities: [],
        similarProperties: [],
        featured: [],
        featuredLoading: false,
        loading: false,
        error: null,
    },
    reducers: {
        clearProject: (state) => {
            state.details = null;
            state.floorPlans = null;
            state.resale = [];
            state.landmarks = [];
            state.amenities = [];
            state.similarProperties = [];
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectListThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProjectListThunk.fulfilled, (state, action) => {
                state.loading = false;
                // Handle both { data: [...] } and direct array responses
                const payload = action.payload;
                state.list = Array.isArray(payload) ? payload : (payload?.data || []);
                
                if (state.list.length > 0) {
                    
                }
            })
            .addCase(fetchProjectListThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.log('❌ fetchProjectList failed:', action.payload);
            })
            .addCase(fetchProjectDetailsThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProjectDetailsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.details = action.payload.data;
            })
            .addCase(fetchProjectDetailsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.log('❌ fetchProjectDetails failed:', action.payload);
            })
            .addCase(fetchFloorPlansThunk.fulfilled, (state, action) => {
                state.floorPlans = action.payload.data;
            })
            .addCase(fetchResaleThunk.fulfilled, (state, action) => {
                state.resale = action.payload.data || [];
            })
            .addCase(fetchLandmarksThunk.fulfilled, (state, action) => {
                state.landmarks = action.payload.data || [];
            })
            .addCase(fetchAmenitiesThunk.fulfilled, (state, action) => {
                state.amenities = action.payload.data || [];
            })
            .addCase(fetchSimilarPropertiesThunk.fulfilled, (state, action) => {
                state.similarProperties = action.payload.data || [];
            })
            .addCase(fetchFeaturedProjectsThunk.pending, (state) => { 
                console.log('⏳ [fetchFeaturedProjectsThunk] Pending...');
                state.featuredLoading = true; 
            })
            .addCase(fetchFeaturedProjectsThunk.fulfilled, (state, action) => {
                console.log('✅ [fetchFeaturedProjectsThunk] Fulfilled:', {
                    payloadType: typeof action.payload,
                    isArray: Array.isArray(action.payload),
                    hasData: !!action.payload?.data
                });
                state.featuredLoading = false;
                state.featured = normalizeFeaturedProjects(action.payload);
                console.log('📦 [fetchFeaturedProjectsThunk] State updated:', {
                    count: state.featured.length,
                    items: state.featured.map(p => ({ id: p.id, name: p.name }))
                });
            })
            .addCase(fetchFeaturedProjectsThunk.rejected, (state, action) => { 
                console.log('❌ [fetchFeaturedProjectsThunk] Rejected:', action.error);
                state.featuredLoading = false; 
            });
    },
});

export const { clearProject } = projectSlice.actions;
export default projectSlice.reducer;
