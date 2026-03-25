import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import propertiesSlice from './slices/propertiesSlice';

export const store = configureStore({
    reducer: {
        app: appSlice,
        auth: authSlice,
        properties: propertiesSlice,
    },
});