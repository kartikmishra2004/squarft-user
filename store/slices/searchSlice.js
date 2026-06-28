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
    async (_, { rejectWithValue }) => {
        try {
            return await searchApi.getTrendingSearches();
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
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
        searchHistory: [],
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
