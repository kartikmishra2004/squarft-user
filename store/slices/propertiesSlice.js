import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { properties, projectsInFocus, missedProperties, highGrowthLocalities } from '../../data/properties';
import { propertyApi } from '../../services/propertyApi';

// Fetch saved properties from API
export const fetchSavedPropertiesThunk = createAsyncThunk(
    'properties/fetchSaved',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) return [];
            const response = await propertyApi.getSavedProperties(token);
            return response?.data || response || [];
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// Save an item to API (property or project)
export const savePropertyThunk = createAsyncThunk(
    'properties/save',
    async ({ itemType, itemId }, { getState, rejectWithValue }) => {
        try {
            const { token, isLoggedIn } = getState().auth;
            if (!isLoggedIn || !token || !itemId) return null;
            
            console.log('📤 Dispatching Save API Call for:', { itemType, itemId });
            await propertyApi.saveItem(token, itemType, itemId);
            return { itemType, itemId };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// Unsave an item from API (property or project)
export const unsavePropertyThunk = createAsyncThunk(
    'properties/unsave',
    async ({ itemType, itemId }, { getState, rejectWithValue }) => {
        try {
            const { token, isLoggedIn } = getState().auth;
            if (!isLoggedIn || !token || !itemId) return null;

            console.log('🗑️ Dispatching Unsave API Call for:', { itemType, itemId });
            await propertyApi.unsaveItem(token, itemType, itemId);
            return { itemType, itemId };
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchContactedPropertiesThunk = createAsyncThunk(
    'properties/fetchContacted',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) return [];
            return await propertyApi.getContactedProperties(token);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

export const fetchRecommendedPropertiesThunk = createAsyncThunk(
    'properties/fetchRecommended',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) return [];
            return await propertyApi.getRecommendedProperties(token, { limit: 6 });
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

const formatPrice = (value) => {
    const num = Number(value);
    if (!num || Number.isNaN(num)) return null;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(0)} L`;
    return `₹${num.toLocaleString('en-IN')}`;
};

const normalizeRecommendedProperties = (payload) => {
    const list = Array.isArray(payload) ? payload : (payload?.data || []);
    return list.map((property) => {
        const minPrice = property.min_price ?? property.price_from ?? property.priceFrom;
        const maxPrice = property.max_price ?? property.price_to ?? property.priceTo;
        const priceFrom = formatPrice(minPrice);
        const priceTo = formatPrice(maxPrice);

        return {
            ...property,
            id: property.id ?? property.property_id ?? property.slug,
            title: property.title ?? property.name ?? property.project_name ?? property.property_name,
            type: property.type ?? property.property_type ?? property.category ?? 'Property',
            price: priceFrom && priceTo && minPrice !== maxPrice
                ? `${priceFrom} – ${priceTo}`
                : (priceFrom || priceTo || property.priceINR || property.price || property.avgPricePerSqft || ''),
            area: property.area ?? property.size ?? property.area_sqft ?? property.cover_area ?? '',
            beds: property.bedrooms ?? property.bhk ?? property.bedroom_count ?? '',
            baths: property.bathrooms ?? property.bathroom_count ?? '',
            image: property.image ?? property.cover_image ?? property.image_url ?? property.imageMain,
            location: property.location ?? [property.area, property.city].filter(Boolean).join(', '),
            isFavourite: Boolean(property.isFavourite),
        };
    });
};

const propertiesSlice = createSlice({
    name: 'properties',
    initialState: {
        properties: properties.map((p) => ({ ...p })),
        projectsInFocus: projectsInFocus.map((p) => ({ ...p })),
        missed: missedProperties.map((p) => ({ ...p })),
        highGrowthLocalities: highGrowthLocalities.map((p) => ({ ...p })),
        favouriteProjects: [],
        savedProperties: [], 
        contactedProperties: [], 
        recommended: [],
        recommendedLoading: false,
        bookedSiteVisits: [],
        upcomingSiteVisits: [],
        selectedCategory: 'all',
        searchQuery: '',
        loading: false,
        error: null,
    },
    reducers: {
        toggleFavourite: (state, action) => {
            const item = state.properties.find((p) => p.id === action.payload);
            if (item) item.isFavourite = !item.isFavourite;

            const missed = state.missed.find((p) => p.id === action.payload);
            if (missed) missed.isFavourite = !missed.isFavourite;

            const idx = state.favouriteProjects.indexOf(action.payload);
            if (idx === -1) state.favouriteProjects.push(action.payload);
            else state.favouriteProjects.splice(idx, 1);
        },
        toggleSeen: (state, action) => {
            const item = state.properties.find((p) => p.id === action.payload);
            if (item) item.isSeen = !item.isSeen;
        },
        toggleContacted: (state, action) => {
            const item = state.properties.find((p) => p.id === action.payload);
            if (item) item.isContacted = !item.isContacted;
        },
        toggleRecent: (state, action) => {
            const item = state.properties.find((p) => p.id === action.payload);
            if (item) item.isRecent = !item.isRecent;
        },
        setSelectedCategory: (state, action) => {
            state.selectedCategory = action.payload;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
        },
        addSiteVisit: (state, action) => {
            const exists = state.bookedSiteVisits.some((v) => v.id === action.payload.id);
            if (!exists) {
                state.bookedSiteVisits.push({
                    ...action.payload,
                    propertyIds: action.payload.propertyIds || [], 
                });
            }
        },
        removeSiteVisit: (state, action) => {
            state.bookedSiteVisits = state.bookedSiteVisits.filter((v) => v.id !== action.payload);
        },
        confirmVisits: (state, action) => {
            const newVisits = action.payload; 
            const newProjectIds = newVisits.map(v => v.projectId);
            state.upcomingSiteVisits = state.upcomingSiteVisits.filter(v => !newProjectIds.includes(v.projectId));
            state.upcomingSiteVisits.push(...newVisits);
            state.bookedSiteVisits = state.bookedSiteVisits.filter(v => {
                const targetId = v.projectId || v.id.replace(/_reschedule_.*/, "");
                return !newProjectIds.includes(targetId);
            });
        },
        cancelUpcomingVisit: (state, action) => {
            state.upcomingSiteVisits = state.upcomingSiteVisits.filter(v => v.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSavedPropertiesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSavedPropertiesThunk.fulfilled, (state, action) => {
                state.loading = false;
                const items = action.payload || [];
                state.savedProperties = items;
                state.favouriteProjects = items.map(item => item.item_id || item.id || item.data?.id);
            })
            .addCase(fetchSavedPropertiesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(savePropertyThunk.fulfilled, (state, action) => {
                if (!action.payload) return;
                const { itemId, itemType } = action.payload;
                if (!state.favouriteProjects.includes(itemId)) {
                    state.favouriteProjects.push(itemId);
                }
                const alreadyExists = state.savedProperties.some(p => p.id === itemId);
                if (!alreadyExists) {
                    state.savedProperties.push({
                        id: itemId,
                        item_id: itemId,
                        item_type: itemType,
                        data: { id: itemId, title: "Saved Item" }
                    });
                }
            })
            .addCase(unsavePropertyThunk.fulfilled, (state, action) => {
                if (!action.payload) return;
                const { itemId } = action.payload;
                state.favouriteProjects = state.favouriteProjects.filter(id => id !== itemId);
                state.savedProperties = state.savedProperties.filter(p => p.id !== itemId && p.item_id !== itemId);
            })
            .addCase(fetchContactedPropertiesThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchContactedPropertiesThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.contactedProperties = action.payload.data || [];
            })
            .addCase(fetchContactedPropertiesThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchRecommendedPropertiesThunk.pending, (state) => {
                state.recommendedLoading = true;
                state.error = null;
            })
            .addCase(fetchRecommendedPropertiesThunk.fulfilled, (state, action) => {
                state.recommendedLoading = false;
                state.recommended = normalizeRecommendedProperties(action.payload);
            })
            .addCase(fetchRecommendedPropertiesThunk.rejected, (state, action) => {
                state.recommendedLoading = false;
                state.error = action.payload;
            });
    },
});

export const { toggleFavourite, toggleSeen, toggleContacted, toggleRecent, setSelectedCategory, setSearchQuery, addSiteVisit, removeSiteVisit, confirmVisits, cancelUpcomingVisit } = propertiesSlice.actions;
export default propertiesSlice.reducer;
