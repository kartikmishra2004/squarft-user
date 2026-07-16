import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { propertyApi } from '../../services/propertyApi';
import { addNotification } from './notificationSlice';
import { NOTIFICATION_EVENTS } from '../../constants/notificationTypes';
import { buildProjectAddress, buildProjectPrice, normalizeProject } from '../../services/projectDisplay';

const prioritizeByDistance = (payload, coordinates) => {
    if (!coordinates) return payload;
    const list = Array.isArray(payload) ? payload : payload?.data;
    if (!Array.isArray(list)) return payload;
    const toRadians = (value) => value * Math.PI / 180;
    const distance = (item) => {
        const latitude = Number(item.latitude ?? item.project_latitude);
        const longitude = Number(item.longitude ?? item.project_longitude);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return Number.POSITIVE_INFINITY;
        const dLat = toRadians(latitude - coordinates.latitude);
        const dLng = toRadians(longitude - coordinates.longitude);
        const a = Math.sin(dLat / 2) ** 2
            + Math.cos(toRadians(coordinates.latitude)) * Math.cos(toRadians(latitude)) * Math.sin(dLng / 2) ** 2;
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };
    const sorted = [...list].sort((a, b) => distance(a) - distance(b));
    return Array.isArray(payload) ? sorted : { ...payload, data: sorted };
};

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
    async ({ itemType, itemId, itemData = null }, { getState, rejectWithValue, dispatch }) => {
        try {
            const { token, isLoggedIn } = getState().auth;
            if (!isLoggedIn || !token || !itemId) return null;
            
            console.log('📤 Dispatching Save API Call for:', { itemType, itemId });
            await propertyApi.saveItem(token, itemType, itemId);
            
            // Dispatch notification after successful save
            const propertyName = itemData?.title || itemData?.name || itemData?.project_name || 'Property';
            dispatch(addNotification({
                eventKey: NOTIFICATION_EVENTS.PROPERTY_SAVED,
                title: 'Added to Your Shortlist',
                description: `${propertyName} has been added to your shortlist. You can review it anytime from Saved Properties.`,
                deepLink: '/shortlist',
                data: {
                    property_id: itemId,
                    property_name: propertyName,
                    item_type: itemType,
                },
            }));
            
            return { itemType, itemId, itemData };
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
            const coordinates = getState().location.coordinates;
            const params = { limit: 6 };
            if (coordinates) {
                params.latitude = coordinates.latitude;
                params.longitude = coordinates.longitude;
            }
            const response = await propertyApi.getRecommendedProperties(token, params);
            return prioritizeByDistance(response, coordinates);
        } catch (e) {
            return rejectWithValue(e.message);
        }
    }
);

// Fetch high growth projects from API
export const fetchHighGrowthProjectsThunk = createAsyncThunk(
    'properties/fetchHighGrowth',
    async (params = {}, { getState, rejectWithValue }) => {
        try {
            const { token } = getState().auth;
            if (!token) return { data: [], is_fallback: true };
            return await propertyApi.getHighGrowthProjects(token, params);
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

const getMediaUrl = (media) => {
    if (!media) return null;
    if (typeof media === 'string') return media;
    return media.url || media.thumbnail_url || null;
};

const normalizeContactedProperties = (payload) => {
    const list = Array.isArray(payload) ? payload : (payload?.data || []);

    return list.map((project, index) => {
        const normalized = normalizeProject(project, index, 'contacted');
        const images = Array.isArray(project.images) ? project.images : [];
        const coverImage = normalized.cover_image_url || getMediaUrl(images.find((image) => image?.is_cover)) || getMediaUrl(images[0]);
        const minPrice = normalized.price_from ?? project.min_price;
        const maxPrice = normalized.price_to ?? project.max_price;
        const displayLocation = normalized.display_location || buildProjectAddress(normalized);
        const displayPrice = normalized.display_price || buildProjectPrice(normalized);

        return {
            ...normalized,
            title: normalized.name || normalized.title || 'Project',
            type: 'Project',
            cover_image: coverImage,
            cover_image_url: coverImage,
            min_price: minPrice,
            max_price: maxPrice,
            price_from: minPrice,
            price_to: maxPrice,
            display_price: displayPrice,
            booking_status: project.visit_status || project.booking_status || 'contacted',
            contacted_at: project.contacted_at,
            location: displayLocation || normalized.location,
            display_location: displayLocation || normalized.display_location,
            images,
        };
    });
};

const propertiesSlice = createSlice({
    name: 'properties',
    initialState: {
        properties: [],
        missed: [],
        highGrowthProjects: [],
        highGrowthLoading: false,
        highGrowthCity: null,
        highGrowthIsFallback: false,
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
                const { itemId, itemType, itemData } = action.payload;
                if (!state.favouriteProjects.includes(itemId)) {
                    state.favouriteProjects.push(itemId);
                }
                const alreadyExists = state.savedProperties.some(p => p.id === itemId || p.item_id === itemId || p.data?.id === itemId);
                if (!alreadyExists) {
                    state.savedProperties.push({
                        id: itemId,
                        item_id: itemId,
                        type: itemType,
                        item_type: itemType,
                        data: itemData || { id: itemId, title: "Saved Item" }
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
                state.contactedProperties = normalizeContactedProperties(action.payload);
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
            })
            .addCase(fetchHighGrowthProjectsThunk.pending, (state) => {
                state.highGrowthLoading = true;
                state.error = null;
            })
            .addCase(fetchHighGrowthProjectsThunk.fulfilled, (state, action) => {
                state.highGrowthLoading = false;
                const payload = action.payload || {};
                state.highGrowthProjects = payload.data || [];
                state.highGrowthCity = payload.city || null;
                state.highGrowthIsFallback = payload.is_fallback || false;
            })
            .addCase(fetchHighGrowthProjectsThunk.rejected, (state, action) => {
                state.highGrowthLoading = false;
                state.error = action.payload;
            });
    },
});

export const { toggleFavourite, toggleSeen, toggleContacted, toggleRecent, setSelectedCategory, setSearchQuery, addSiteVisit, removeSiteVisit, confirmVisits, cancelUpcomingVisit } = propertiesSlice.actions;
export default propertiesSlice.reducer;
