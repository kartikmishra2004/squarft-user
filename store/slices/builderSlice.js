import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { builderApi } from '../../services/builderApi';

// Fetch builder details and projects
export const fetchBuilderDetailsThunk = createAsyncThunk(
    'builder/fetchDetails',
    async (builderId, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            return await builderApi.getBuilderDetails(builderId, token);
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
        loading: false,
        error: null,
    },
    reducers: {
        clearBuilder: (state) => {
            state.currentBuilder = null;
            state.builderProjects = [];
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
