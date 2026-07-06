import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { visitApi } from '../../services/visitApi';
import { addNotification } from './notificationSlice';
import { NOTIFICATION_EVENTS } from '../../constants/notificationTypes';

// Fetch visits by status
export const fetchVisitListThunk = createAsyncThunk(
    'visit/fetchList',
    async (status, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) throw new Error('Not authenticated');
            const statuses = Array.isArray(status) ? status : [status];
            const responses = await Promise.all(
                statuses.filter(Boolean).map((item) => visitApi.getVisitList(token, item))
            );
            const data = responses.flatMap((response) => response?.data || []);
            return { success: true, data };
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

// Fetch available sales officers for a selected slot
export const fetchAvailableOfficersThunk = createAsyncThunk(
    'visit/fetchOfficers',
    async ({ property_id, slot_start, branch_id }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) throw new Error('Not authenticated');
            return await visitApi.getAvailableOfficers(token, property_id, slot_start, branch_id);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// Create site visit
export const createSiteVisitThunk = createAsyncThunk(
    'visit/create',
    async (visitData, { getState, rejectWithValue, dispatch }) => {
        try {
            const { token } = getState().auth;
            if (!token) throw new Error('Not authenticated');
            const response = await visitApi.createSiteVisit(token, visitData);
            
            // Dispatch notification after successful visit creation
            const propertyName = visitData.property_name || visitData.project_name || 'the property';
            const visitId = response?.data?.id || response?.id;
            
            dispatch(addNotification({
                eventKey: NOTIFICATION_EVENTS.VISIT_REQUEST_SUBMITTED,
                title: 'Your Visit Request Has Been Received',
                description: `We received your request to visit ${propertyName}. Our team will confirm the slot shortly.`,
                deepLink: visitId ? `/visits/${visitId}` : '/visits',
                data: {
                    visit_id: visitId,
                    property_id: visitData.property_id,
                    property_name: propertyName,
                },
            }));
            
            return response;
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
        availableOfficers: [],
        officerMeta: null,
        loading: false,
        branchesLoading: false,
        slotsLoading: false,
        officersLoading: false,
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
        clearAvailableOfficers: (state) => {
            state.availableOfficers = [];
            state.officerMeta = null;
            state.officersLoading = false;
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
            // Fetch available officers
            .addCase(fetchAvailableOfficersThunk.pending, (state) => {
                state.officersLoading = true;
                state.availableOfficers = [];
                state.officerMeta = null;
                state.error = null;
            })
            .addCase(fetchAvailableOfficersThunk.fulfilled, (state, action) => {
                state.officersLoading = false;
                state.availableOfficers = action.payload.data || [];
                state.officerMeta = action.payload.meta || null;
            })
            .addCase(fetchAvailableOfficersThunk.rejected, (state, action) => {
                state.officersLoading = false;
                state.availableOfficers = [];
                state.officerMeta = null;
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

export const { clearVisitError, clearAvailableSlots, clearAvailableOfficers } = visitSlice.actions;
export default visitSlice.reducer;
