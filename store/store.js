import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import propertiesSlice from './slices/propertiesSlice';
import filterSlice from './slices/filterSlice';

export const store = configureStore({
    reducer: {
        app: appSlice,
        auth: authSlice,
        properties: propertiesSlice,
        filter: filterSlice,
    },
});