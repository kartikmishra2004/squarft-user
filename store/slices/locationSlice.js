import { createSlice } from '@reduxjs/toolkit';

const locationSlice = createSlice({
    name: 'location',
    initialState: { coordinates: null, permission: 'undetermined' },
    reducers: {
        setCoordinates: (state, action) => { state.coordinates = action.payload; },
        setLocationPermission: (state, action) => { state.permission = action.payload; },
    },
});

export const { setCoordinates, setLocationPermission } = locationSlice.actions;
export default locationSlice.reducer;
