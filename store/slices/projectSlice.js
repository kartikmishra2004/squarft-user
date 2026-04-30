import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectApi } from '../../services/projectApi';

export const fetchProjectListThunk = createAsyncThunk(
    'project/fetchList',
    async (_, { rejectWithValue }) => {
        try {
            return await projectApi.listProjects();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchProjectDetailsThunk = createAsyncThunk(
    'project/fetchDetails',
    async (slug, { rejectWithValue }) => {
        try {
            return await projectApi.getProjectDetails(slug);
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
    async (slug, { rejectWithValue }) => {
        try {
            return await projectApi.getProjectResale(slug);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchLandmarksThunk = createAsyncThunk(
    'project/fetchLandmarks',
    async (slug, { rejectWithValue }) => {
        try {
            return await projectApi.getProjectLandmarks(slug);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchAmenitiesThunk = createAsyncThunk(
    'project/fetchAmenities',
    async (slug, { rejectWithValue }) => {
        try {
            return await projectApi.getProjectAmenities(slug);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchSimilarPropertiesThunk = createAsyncThunk(
    'project/fetchSimilarProperties',
    async (slug, { rejectWithValue }) => {
        try {
            return await projectApi.getSimilarProperties(slug);
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
            .addCase(fetchProjectListThunk.fulfilled, (state, action) => {
                state.list = action.payload.data || [];
            })
            .addCase(fetchProjectDetailsThunk.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchProjectDetailsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.details = action.payload.data;
            })
            .addCase(fetchProjectDetailsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
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
            });
    },
});

export const { clearProject } = projectSlice.actions;
export default projectSlice.reducer;
