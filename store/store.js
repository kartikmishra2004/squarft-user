import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import filterSlice from './slices/filterSlice';

export const store = configureStore({
    reducer: {
        app: appSlice,
        auth: authSlice,
        filter: filterSlice,
    },
});