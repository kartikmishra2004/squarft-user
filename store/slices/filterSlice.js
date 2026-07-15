import { createSlice } from '@reduxjs/toolkit';

const filterSlice = createSlice({
    name: 'filter',
    initialState: {
        isOpen: false,
        budgetFilterOpen: false,
        address: '',
        locationCoordinates: null,
        searchQuery: '',
        tags: [],
        propertyTypes: [],       
        propertySubTypes: [],    
        budgetRange: [2000000, 50000000], 
        areaRange: [0, 5000],
        possessionStatus: [],    
        reraOnly: false,
    },
    reducers: {
        openFilter: (state) => { state.isOpen = true; },
        closeFilter: (state) => { state.isOpen = false; },
        openBudgetFilter: (state) => { state.budgetFilterOpen = true; },
        closeBudgetFilter: (state) => { state.budgetFilterOpen = false; },
        setAddress: (state, action) => {
            state.address = action.payload;
            state.locationCoordinates = null;
        },
        setFilterLocation: (state, action) => {
            state.address = action.payload.address;
            state.locationCoordinates = action.payload.coordinates;
        },
        setSearchQuery: (state, action) => { state.searchQuery = action.payload; },
        removeTag: (state, action) => {
            state.tags = state.tags.filter((t) => t !== action.payload);
        },
        togglePropertyType: (state, action) => {
            const val = action.payload;
            state.propertyTypes = state.propertyTypes.includes(val)
                ? state.propertyTypes.filter((t) => t !== val)
                : [...state.propertyTypes, val];
        },
        toggleSubType: (state, action) => {
            const val = action.payload;
            state.propertySubTypes = state.propertySubTypes.includes(val)
                ? state.propertySubTypes.filter((t) => t !== val)
                : [...state.propertySubTypes, val];
        },
        setBudgetRange: (state, action) => { state.budgetRange = action.payload; },
        setAreaRange: (state, action) => { state.areaRange = action.payload; },
        togglePossession: (state, action) => {
            const val = action.payload;
            state.possessionStatus = state.possessionStatus.includes(val)
                ? state.possessionStatus.filter((t) => t !== val)
                : [...state.possessionStatus, val];
        },
        toggleReraOnly: (state) => { state.reraOnly = !state.reraOnly; },
        clearFilters: (state) => {
            state.address = '';
            state.locationCoordinates = null;
            state.searchQuery = '';
            state.tags = [];
            state.propertyTypes = [];
            state.propertySubTypes = [];
            state.budgetRange = [2000000, 50000000];
            state.areaRange = [0, 5000];
            state.possessionStatus = [];
            state.reraOnly = false;
        },
        clearNonTypeFilters: (state) => {
            state.address = '';
            state.locationCoordinates = null;
            state.searchQuery = '';
            state.tags = [];
            state.propertySubTypes = [];
            state.budgetRange = [2000000, 50000000];
            state.areaRange = [0, 5000];
            state.possessionStatus = [];
            state.reraOnly = false;
        },
        clearPropertyTypes: (state) => { state.propertyTypes = []; },
        clearSubTypes: (state) => { state.propertySubTypes = []; },
    },
});

export const {
    openFilter, closeFilter, openBudgetFilter, closeBudgetFilter,
    setAddress, setFilterLocation, setSearchQuery, removeTag,
    togglePropertyType, toggleSubType, setBudgetRange,
    setAreaRange, togglePossession, toggleReraOnly, clearFilters, clearNonTypeFilters, clearPropertyTypes, clearSubTypes,
} = filterSlice.actions;
export default filterSlice.reducer;
