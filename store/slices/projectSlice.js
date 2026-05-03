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
            return await projectApi.getFeaturedProjects(params);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

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
            .addCase(fetchFeaturedProjectsThunk.pending, (state) => { state.featuredLoading = true; })
            .addCase(fetchFeaturedProjectsThunk.fulfilled, (state, action) => {
                state.featuredLoading = false;
                state.featured = action.payload.data || [];
            })
            .addCase(fetchFeaturedProjectsThunk.rejected, (state) => { state.featuredLoading = false; });
    },
});

export const { clearProject } = projectSlice.actions;
export default projectSlice.reducer;
