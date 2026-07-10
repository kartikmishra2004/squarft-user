import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchApi } from '../../services/searchApi';

const getSearchHistoryId = (itemOrId) => {
    if (!itemOrId) return null;
    if (typeof itemOrId === 'string') return itemOrId;
    return itemOrId.id || itemOrId.search_id || itemOrId.history_id || null;
};

// Get trending searches
export const getTrendingSearchesThunk = createAsyncThunk(
    'search/getTrending',
    async (location = {}, { getState, rejectWithValue }) => {
        try {
            return await searchApi.getTrendingSearches({ ...location, token: getState().auth.token });
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const getTrendingLocationsThunk = createAsyncThunk(
    'search/getTrendingLocations',
    async (_, { rejectWithValue }) => {
        try {
            return await searchApi.getTrendingLocations();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const searchPropertiesAndProjectsThunk = createAsyncThunk(
    'search/searchPropertiesAndProjects',
    async ({ query, latitude, longitude, limit = 20 }, { getState, rejectWithValue }) => {
        try {
            return await searchApi.searchPropertiesAndProjects({ query, latitude, longitude, limit, token: getState().auth.token });
        } catch (error) {
            return rejectWithValue(error.message || 'Unable to load search suggestions');
        }
    },
);

// Get search history
export const getSearchHistoryThunk = createAsyncThunk(
    'search/getHistory',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) {
                
                throw new Error('Not authenticated');
            }
            
            return await searchApi.getSearchHistory(token);
        } catch (e) {
            
            return rejectWithValue(e.message);
        }
    }
);

// Save search history
export const saveSearchHistoryThunk = createAsyncThunk(
    'search/saveHistory',
    async ({ query_text, filters, result_count }, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) {
                
                throw new Error('Not authenticated');
            }
            
            return await searchApi.saveSearchHistory(token, query_text, filters, result_count);
        } catch (e) {
           
            return rejectWithValue(e.message);
        }
    }
);

// Delete search history
export const deleteSearchHistoryThunk = createAsyncThunk(
    'search/deleteHistory',
    async (itemOrId, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) {
                
                throw new Error('Not authenticated');
            }

            const id = getSearchHistoryId(itemOrId);
            if (!id) {
                throw new Error('Search history id is missing');
            }

            await searchApi.deleteSearchHistory(token, id);
            return id; // Return the id to remove from state
        } catch (e) {
            
            return rejectWithValue(e.message);
        }
    }
);

// Clear all search history
export const clearAllSearchHistoryThunk = createAsyncThunk(
    'search/clearAllHistory',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) {
                console.log('❌ No token available for clearing search history');
                throw new Error('Not authenticated');
            }
            console.log('🗑️ Clearing all search history');
            await searchApi.clearAllSearchHistory(token);
            return true;
        } catch (e) {
            console.log('❌ Error clearing search history:', e.message);
            return rejectWithValue(e.message);
        }
    }
);

const searchSlice = createSlice({
    name: 'search',
    initialState: {
        trendingSearches: [],
        trendingLocations: [],
        trendingLocationsLoading: false,
        trendingLocationsError: null,
        searchHistory: [],
        suggestions: [],
        suggestionResultCount: 0,
        suggestionsLoading: false,
        suggestionsError: null,
        suggestionsRequestId: null,
        loading: false,
        error: null,
    },
    reducers: {
        clearSearchError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchPropertiesAndProjectsThunk.pending, (state, action) => {
                state.suggestionsLoading = true;
                state.suggestionsError = null;
                state.suggestions = [];
                state.suggestionResultCount = 0;
                state.suggestionsRequestId = action.meta.requestId;
            })
            .addCase(searchPropertiesAndProjectsThunk.fulfilled, (state, action) => {
                if (state.suggestionsRequestId !== action.meta.requestId) return;
                state.suggestionsLoading = false;
                state.suggestions = Array.isArray(action.payload?.data?.results) ? action.payload.data.results : [];
                state.suggestionResultCount = Number(
                    action.payload?.data?.count
                    ?? action.payload?.data?.total
                    ?? action.payload?.data?.pagination?.total
                    ?? action.payload?.pagination?.total
                    ?? state.suggestions.length
                ) || state.suggestions.length;
                state.suggestionsRequestId = null;
            })
            .addCase(searchPropertiesAndProjectsThunk.rejected, (state, action) => {
                if (state.suggestionsRequestId !== action.meta.requestId) return;
                state.suggestionsLoading = false;
                state.suggestionsError = action.payload || 'Unable to load search suggestions';
                state.suggestions = [];
                state.suggestionResultCount = 0;
                state.suggestionsRequestId = null;
            })
            // Get trending searches
            .addCase(getTrendingSearchesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTrendingSearchesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.trendingSearches = action.payload.data || [];
            })
            .addCase(getTrendingSearchesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getTrendingLocationsThunk.pending, (state) => {
                state.trendingLocationsLoading = true;
                state.trendingLocationsError = null;
            })
            .addCase(getTrendingLocationsThunk.fulfilled, (state, action) => {
                state.trendingLocationsLoading = false;
                state.trendingLocations = Array.isArray(action.payload?.data) ? action.payload.data : [];
            })
            .addCase(getTrendingLocationsThunk.rejected, (state, action) => {
                state.trendingLocationsLoading = false;
                state.trendingLocationsError = action.payload;
                state.trendingLocations = [];
            })
            // Get search history
            .addCase(getSearchHistoryThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSearchHistoryThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.searchHistory = action.payload.data || [];
            })
            .addCase(getSearchHistoryThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Save search history
            .addCase(saveSearchHistoryThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(saveSearchHistoryThunk.fulfilled, (state, action) => {
                state.loading = false;
                // Add the new search to the beginning of history
                if (action.payload.data) {
                    state.searchHistory.unshift(action.payload.data);
                    // Keep only last 5
                    if (state.searchHistory.length > 5) {
                        state.searchHistory = state.searchHistory.slice(0, 5);
                    }
                }
            })
            .addCase(saveSearchHistoryThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete search history
            .addCase(deleteSearchHistoryThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteSearchHistoryThunk.fulfilled, (state, action) => {
                state.loading = false;
                // Remove the deleted item from history
                state.searchHistory = state.searchHistory.filter(item => getSearchHistoryId(item) !== action.payload);
            })
            .addCase(deleteSearchHistoryThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Clear all search history
            .addCase(clearAllSearchHistoryThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clearAllSearchHistoryThunk.fulfilled, (state) => {
                state.loading = false;
                // Clear all history
                state.searchHistory = [];
            })
            .addCase(clearAllSearchHistoryThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSearchError } = searchSlice.actions;
export default searchSlice.reducer;
