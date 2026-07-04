import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { builderApi } from '../../services/builderApi';

// Fetch builder details and projects
export const fetchBuilderDetailsThunk = createAsyncThunk(
    'builder/fetchDetails',
    async ({ builderId, possession = 'All' }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            return await builderApi.getBuilderDetails(builderId, token, { possession });
        } catch (e) {
            return rejectWithValue(e.message || e);
        }
    }
);

const builderSlice = createSlice({
    name: 'builder',
    initialState: {
        currentBuilder: null,
        builderProjects: [],
        totalProjects: 0,
        pagination: null,
        currentPossession: 'All',
        loading: false,
        error: null,
    },
    reducers: {
        clearBuilder: (state) => {
            state.currentBuilder = null;
            state.builderProjects = [];
            state.totalProjects = 0;
            state.pagination = null;
            state.currentPossession = 'All';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBuilderDetailsThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBuilderDetailsThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.currentBuilder = action.payload.data.builder;
                state.builderProjects = action.payload.data.projects || [];
                state.totalProjects = action.payload.data.totalProjects || 0;
                state.pagination = action.payload.data.pagination || null;
                state.currentPossession = action.payload.data.possession || 'All';
            })
            .addCase(fetchBuilderDetailsThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                // Silently fall back to local data - no need to log error
                console.log('ℹ️ Using local builder data (API unavailable)');
            });
    },
});

export const { clearBuilder } = builderSlice.actions;
export default builderSlice.reducer;
