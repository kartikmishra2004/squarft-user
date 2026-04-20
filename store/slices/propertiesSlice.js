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
            const newVisits = action.payload; // array of visits
            const newVisitIds = newVisits.map(v => v.id);
            state.upcomingSiteVisits.push(...newVisits);
            // also remove them from the "cart"
            state.bookedSiteVisits = state.bookedSiteVisits.filter(v => !newVisitIds.includes(v.id));
        },
    },
});

export const { toggleFavourite, toggleSeen, toggleContacted, toggleRecent, setSelectedCategory, setSearchQuery, addSiteVisit, removeSiteVisit, confirmVisits } = propertiesSlice.actions;
export default propertiesSlice.reducer;
