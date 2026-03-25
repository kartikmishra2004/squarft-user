import { createSlice } from '@reduxjs/toolkit';
import {
    recommendedProperties,
    featuredProperties,
    projectsInFocus,
    missedProperties,
    highGrowthLocalities,
} from '../../data/properties';

// helper - toggle isFavourite by id in any array
function toggleInList(list, id) {
    const item = list.find((p) => p.id === id);
    if (item) item.isFavourite = !item.isFavourite;
}

const propertiesSlice = createSlice({
    name: 'properties',
    initialState: {
        recommended: recommendedProperties,
        featured: featuredProperties,
        projectsInFocus,
        missed: missedProperties,
        highGrowthLocalities,
        selectedCategory: 'all',
        searchQuery: '',
    },
    reducers: {
        toggleFavourite: (state, action) => {
            const id = action.payload;
            toggleInList(state.recommended, id);
            toggleInList(state.featured, id);
            toggleInList(state.missed, id);
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
