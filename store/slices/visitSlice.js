import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { visitApi } from '../../services/visitApi';

// Fetch visits by status
export const fetchVisitListThunk = createAsyncThunk(
    'visit/fetchList',
    async (status, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) throw new Error('Not authenticated');
            return await visitApi.getVisitList(token, status);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// Fetch branches by city
export const fetchBranchListThunk = createAsyncThunk(
    'visit/fetchBranches',
    async (city, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) throw new Error('Not authenticated');
            return await visitApi.getBranchList(token, city);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// Fetch available slots
export const fetchAvailableSlotsThunk = createAsyncThunk(
    'visit/fetchSlots',
    async ({ property_id, date, branch_id }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) throw new Error('Not authenticated');
            return await visitApi.getAvailableSlots(token, property_id, date, branch_id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// Create site visit
export const createSiteVisitThunk = createAsyncThunk(
    'visit/create',
    async (visitData, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) throw new Error('Not authenticated');
            return await visitApi.createSiteVisit(token, visitData);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// Update site visit
export const updateSiteVisitThunk = createAsyncThunk(
    'visit/update',
    async ({ visitId, updateData }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) throw new Error('Not authenticated');
            return await visitApi.updateSiteVisit(token, visitId, updateData);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const visitSlice = createSlice({
    name: 'visit',
    initialState: {
        visits: [],
        branches: [],
        availableSlots: [],
        loading: false,
        branchesLoading: false,
        slotsLoading: false,
        creating: false,
        updating: false,
        error: null,
    },
    reducers: {
        clearVisitError: (state) => {
            state.error = null;
        },
        clearAvailableSlots: (state) => {
            state.availableSlots = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch visit list
            .addCase(fetchVisitListThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVisitListThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.visits = action.payload.data || [];
            })
            .addCase(fetchVisitListThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Fetch branches
            .addCase(fetchBranchListThunk.pending, (state) => {
                state.branchesLoading = true;
                state.error = null;
            })
            .addCase(fetchBranchListThunk.fulfilled, (state, action) => {
                state.branchesLoading = false;
                state.branches = action.payload.data || [];
            })
            .addCase(fetchBranchListThunk.rejected, (state, action) => {
                state.branchesLoading = false;
                state.error = action.payload;
            })
            // Fetch available slots
            .addCase(fetchAvailableSlotsThunk.pending, (state) => {
                state.slotsLoading = true;
                state.error = null;
            })
            .addCase(fetchAvailableSlotsThunk.fulfilled, (state, action) => {
                state.slotsLoading = false;
                state.availableSlots = action.payload.data || [];
            })
            .addCase(fetchAvailableSlotsThunk.rejected, (state, action) => {
                state.slotsLoading = false;
                state.error = action.payload;
            })
            // Create site visit
            .addCase(createSiteVisitThunk.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createSiteVisitThunk.fulfilled, (state, action) => {
                state.creating = false;
                // Add the new visit to the list
                if (action.payload.data) {
                    state.visits.unshift(action.payload.data);
                }
            })
            .addCase(createSiteVisitThunk.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload;
            })
            // Update site visit
            .addCase(updateSiteVisitThunk.pending, (state) => {
                state.updating = true;
                state.error = null;
            })
            .addCase(updateSiteVisitThunk.fulfilled, (state, action) => {
                state.updating = false;
                // Update the visit in the list
                if (action.payload.data) {
                    const index = state.visits.findIndex(v => v.id === action.payload.data.id);
                    if (index !== -1) {
                        state.visits[index] = action.payload.data;
                    }
                }
            })
            .addCase(updateSiteVisitThunk.rejected, (state, action) => {
                state.updating = false;
                state.error = action.payload;
            });
    },
});

export const { clearVisitError, clearAvailableSlots } = visitSlice.actions;
export default visitSlice.reducer;
