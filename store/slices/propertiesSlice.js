import { createSlice } from '@reduxjs/toolkit';
import { properties, projectsInFocus, missedProperties, highGrowthLocalities } from '../../data/properties';

const propertiesSlice = createSlice({
    name: 'properties',
    initialState: {
        properties: properties.map((p) => ({ ...p })),
        projectsInFocus: projectsInFocus.map((p) => ({ ...p })),
        missed: missedProperties.map((p) => ({ ...p })),
        highGrowthLocalities: highGrowthLocalities.map((p) => ({ ...p })),
        favouriteProjects: [],
        bookedSiteVisits: [],
        upcomingSiteVisits: [],
        selectedCategory: 'all',
        searchQuery: '',
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
});

export const { toggleFavourite, toggleSeen, toggleContacted, toggleRecent, setSelectedCategory, setSearchQuery, addSiteVisit, removeSiteVisit, confirmVisits, cancelUpcomingVisit } = propertiesSlice.actions;
export default propertiesSlice.reducer;
