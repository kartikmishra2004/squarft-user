import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
    name: 'app',
    initialState: {
        searchActive: false,
    },
    reducers: {
        setSearchActive: (state, action) => { state.searchActive = action.payload; },
    },
});

export const { setSearchActive } = appSlice.actions;
export default appSlice.reducer;