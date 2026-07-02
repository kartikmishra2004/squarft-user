import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectApi } from '../../services/projectApi';
import { normalizeProject, normalizeProjectList } from '../../services/projectDisplay';

export const fetchProjectListThunk = createAsyncThunk(
    'project/fetchList',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) return [];
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
    async (params = {}, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) return [];
            console.log('🔥 [fetchFeaturedProjectsThunk] Calling API with params:', params);
            const response = await projectApi.getFeaturedProjects(params, token);
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

export const fetchNearbyProjectsThunk = createAsyncThunk(
    'project/fetchNearby',
    async (coords, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (coords?.latitude === undefined || coords?.longitude === undefined) {
                throw new Error('Current location coordinates are required');
            }
            return await projectApi.getNearbyProjects(coords, token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const normalizeFeaturedProjects = (payload) => {
    const list = normalizeProjectList(payload, 'featured');
    
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
        nearby: [],
        mapProjects: [],
        nearbyMeta: null,
        featuredLoading: false,
        nearbyLoading: false,
        loading: false,
        currentDetailSlug: null,
        currentRelatedSlug: null,
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
            state.currentDetailSlug = null;
            state.currentRelatedSlug = null;
            state.error = null;
        },
        setMapProjects: (state, action) => {
            state.mapProjects = normalizeProjectList(action.payload || [], 'map');
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjectListThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProjectListThunk.fulfilled, (state, action) => {
                state.loading = false;
                // Handle both { data: [...] } and direct array responses
                const payload = action.payload;
                state.list = normalizeProjectList(payload, 'list');
                
                if (state.list.length > 0) {
                    
                }
            })
            .addCase(fetchProjectListThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                console.log('❌ fetchProjectList failed:', action.payload);
            })
            .addCase(fetchProjectDetailsThunk.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                state.currentDetailSlug = action.meta.arg;
                state.details = null;
                state.floorPlans = null;
                state.resale = [];
                state.landmarks = [];
                state.amenities = [];
                state.similarProperties = [];
            })
            .addCase(fetchProjectDetailsThunk.fulfilled, (state, action) => {
                if (state.currentDetailSlug !== action.meta.arg) return;
                state.loading = false;
                state.details = action.payload.data ? normalizeProject(action.payload.data, 0, 'detail') : null;
            })
            .addCase(fetchProjectDetailsThunk.rejected, (state, action) => {
                if (state.currentDetailSlug !== action.meta.arg) return;
                state.loading = false;
                state.error = action.payload;
                console.log('❌ fetchProjectDetails failed:', action.payload);
            })
            .addCase(fetchFloorPlansThunk.pending, (state, action) => {
                state.currentRelatedSlug = action.meta.arg;
            })
            .addCase(fetchFloorPlansThunk.fulfilled, (state, action) => {
                if (state.currentRelatedSlug !== action.meta.arg) return;
                state.floorPlans = action.payload.data;
            })
            .addCase(fetchFloorPlansThunk.rejected, (state, action) => {
                if (state.currentRelatedSlug !== action.meta.arg) return;
                state.floorPlans = { summary: {}, floor_plans: [] };
                console.log('âŒ fetchFloorPlans failed:', action.payload);
            })
            .addCase(fetchResaleThunk.fulfilled, (state, action) => {
                if (state.currentRelatedSlug !== action.meta.arg) return;
                state.resale = action.payload.data || [];
            })
            .addCase(fetchResaleThunk.rejected, (state, action) => {
                if (state.currentRelatedSlug !== action.meta.arg) return;
                state.resale = [];
            })
            .addCase(fetchLandmarksThunk.fulfilled, (state, action) => {
                if (state.currentRelatedSlug !== action.meta.arg) return;
                state.landmarks = action.payload.data || [];
            })
            .addCase(fetchLandmarksThunk.rejected, (state, action) => {
                if (state.currentRelatedSlug !== action.meta.arg) return;
                state.landmarks = [];
            })
            .addCase(fetchAmenitiesThunk.fulfilled, (state, action) => {
                if (state.currentRelatedSlug !== action.meta.arg) return;
                state.amenities = action.payload.data || [];
            })
            .addCase(fetchAmenitiesThunk.rejected, (state, action) => {
                if (state.currentRelatedSlug !== action.meta.arg) return;
                state.amenities = [];
            })
            .addCase(fetchSimilarPropertiesThunk.fulfilled, (state, action) => {
                if (state.currentRelatedSlug !== action.meta.arg) return;
                state.similarProperties = action.payload.data || [];
            })
            .addCase(fetchSimilarPropertiesThunk.rejected, (state, action) => {
                if (state.currentRelatedSlug !== action.meta.arg) return;
                state.similarProperties = [];
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
            })
            .addCase(fetchNearbyProjectsThunk.pending, (state) => {
                state.nearbyLoading = true;
                state.error = null;
            })
            .addCase(fetchNearbyProjectsThunk.fulfilled, (state, action) => {
                state.nearbyLoading = false;
                const payload = action.payload?.data;
                state.nearby = normalizeProjectList(payload?.projects || [], 'nearby');
                state.nearbyMeta = {
                    count: payload?.count ?? state.nearby.length,
                    coordinates: action.meta.arg,
                };
            })
            .addCase(fetchNearbyProjectsThunk.rejected, (state, action) => {
                state.nearbyLoading = false;
                state.error = action.payload;
                state.nearby = [];
                state.nearbyMeta = null;
                console.log('âŒ fetchNearbyProjects failed:', action.payload);
            });
    },
});

export const { clearProject, setMapProjects } = projectSlice.actions;
export default projectSlice.reducer;
