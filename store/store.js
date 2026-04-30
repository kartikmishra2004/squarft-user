import { configureStore } from '@reduxjs/toolkit';
import appSlice from './slices/appSlice';
import authSlice from './slices/authSlice';
import propertiesSlice from './slices/propertiesSlice';
import filterSlice from './slices/filterSlice';
import searchSlice from './slices/searchSlice';
import projectSlice from './slices/projectSlice';
import dealsSlice from './slices/dealsSlice';

export const store = configureStore({
    reducer: {
        app: appSlice,
        auth: authSlice,
        properties: propertiesSlice,
        filter: filterSlice,
        search: searchSlice,
        project: projectSlice,
        deals: dealsSlice,
    },
});