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
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
    },
});

export const { toggleFavourite, setSelectedCategory, setSearchQuery } = propertiesSlice.actions;
export default propertiesSlice.reducer;
