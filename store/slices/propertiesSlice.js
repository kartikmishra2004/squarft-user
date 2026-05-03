import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { properties, projectsInFocus, missedProperties, highGrowthLocalities } from '../../data/properties';
import { propertyApi } from '../../services/propertyApi';

// Fetch saved properties from API
export const fetchSavedPropertiesThunk = createAsyncThunk(
    'properties/fetchSaved',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) {
                
                return [];
            }
            
            return await propertyApi.getSavedProperties(token);
        } catch (e) {
            
            return rejectWithValue(e.message);
        }
    }
);

// Save property to API
export const savePropertyThunk = createAsyncThunk(
    'properties/save',
    async (propertyId, { getState, rejectWithValue }) => {
        try {
            const { token, isLoggedIn } = getState().auth;
            console.log('💾 savePropertyThunk called:', { propertyId, isLoggedIn, hasToken: !!token });
            
            if (!isLoggedIn || !token) {
                console.log('⚠️ User not logged in, skipping API save');
                return null;
            }
            
            console.log('📤 Calling API to save property:', propertyId);
            const result = await propertyApi.saveProperty(token, propertyId);
            console.log('✅ Property saved successfully:', result);
            return propertyId;
        } catch (e) {
            console.log('❌ Error saving property:', e.message);
            return rejectWithValue(e.message);
        }
    }
);

// Unsave property from API
export const unsavePropertyThunk = createAsyncThunk(
    'properties/unsave',
    async (propertyId, { getState, rejectWithValue }) => {
        try {
            const { token, isLoggedIn } = getState().auth;
            if (!isLoggedIn || !token) {
                console.log('⚠️ User not logged in, skipping API unsave');
                return null;
            }
            console.log('🗑️ Unsaving property from API:', propertyId);
            const result = await propertyApi.unsaveProperty(token, propertyId);
            console.log('✅ Property unsaved successfully:', result);
            return propertyId;
        } catch (e) {
            console.log('❌ Error unsaving property:', e.message);
            return rejectWithValue(e.message);
        }
    }
);

const propertiesSlice = createSlice({
    name: 'properties',
    initialState: {
        properties: properties.map((p) => ({ ...p })),
        projectsInFocus: projectsInFocus.map((p) => ({ ...p })),
        missed: missedProperties.map((p) => ({ ...p })),
        highGrowthLocalities: highGrowthLocalities.map((p) => ({ ...p })),
        favouriteProjects: [],
        savedProperties: [], // API saved properties
        bookedSiteVisits: [],
        upcomingSiteVisits: [],
        selectedCategory: 'all',
        searchQuery: '',
        loading: false,
        error: null,
    },
    reducers: {
        toggleFavourite: (state, action) => {
            const item = state.properties.find((p) => p.id === action.payload);
            if (item) item.isFavourite = !item.isFavourite;

            const missed = state.missed.find((p) => p.id === action.payload);
            if (missed) missed.isFavourite = !missed.isFavourite;

            // also toggle for projects
            const idx = state.favouriteProjects.indexOf(action.payload);
            if (idx === -1) state.favouriteProjects.push(action.payload);
            else state.favouriteProjects.splice(idx, 1);
        },
        toggleSeen: (state, action) => {
            const item = state.properties.find((p) => p.id === action.payload);
            if (item) item.isSeen = !item.isSeen;
        },
        toggleContacted: (state, action) => {
            const item = state.properties.find((p) => p.id === action.payload);
            if (item) item.isContacted = !item.isContacted;
        },
        toggleRecent: (state, action) => {
            const item = state.properties.find((p) => p.id === action.payload);
            if (item) item.isRecent = !item.isRecent;
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        addSiteVisit: (state, action) => {
            const exists = state.bookedSiteVisits.some((v) => v.id === action.payload.id);
            if (!exists) {
                state.bookedSiteVisits.push(action.payload);
            }
        },
        removeSiteVisit: (state, action) => {
            state.bookedSiteVisits = state.bookedSiteVisits.filter((v) => v.id !== action.payload);
        },
        confirmVisits: (state, action) => {
            const newVisits = action.payload; 
            const newProjectIds = newVisits.map(v => v.projectId);
            
            // Deduplicate the upcoming visits (this effectively 'updates' the rescheduled visit)
            state.upcomingSiteVisits = state.upcomingSiteVisits.filter(v => !newProjectIds.includes(v.projectId));
            state.upcomingSiteVisits.push(...newVisits);
            
            // Clear items from the cart matching the booked projectIds
            state.bookedSiteVisits = state.bookedSiteVisits.filter(v => {
                const targetId = v.projectId || v.id.replace(/_reschedule_.*/, "");
                return !newProjectIds.includes(targetId);
            });
        },
        cancelUpcomingVisit: (state, action) => {
            state.upcomingSiteVisits = state.upcomingSiteVisits.filter(v => v.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch saved properties
            .addCase(fetchSavedPropertiesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSavedPropertiesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.savedProperties = action.payload.data || [];
            })
            .addCase(fetchSavedPropertiesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Save property
            .addCase(savePropertyThunk.fulfilled, (state, action) => {
                // Optimistically add to favouriteProjects
                if (!state.favouriteProjects.includes(action.payload)) {
                    state.favouriteProjects.push(action.payload);
                }
            })
            // Unsave property
            .addCase(unsavePropertyThunk.fulfilled, (state, action) => {
                // Optimistically remove from favouriteProjects
                state.favouriteProjects = state.favouriteProjects.filter(id => id !== action.payload);
                // Remove from savedProperties
                state.savedProperties = state.savedProperties.filter(p => p.id !== action.payload);
            });
    },
});

export const { toggleFavourite, toggleSeen, toggleContacted, toggleRecent, setSelectedCategory, setSearchQuery, addSiteVisit, removeSiteVisit, confirmVisits, cancelUpcomingVisit } = propertiesSlice.actions;
export default propertiesSlice.reducer;
