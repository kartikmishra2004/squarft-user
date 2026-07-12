import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, Pressable, ScrollView } from "react-native";
import { useState, useEffect } from "react"; 
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome, AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import BudgetFilterModal from "../../components/BudgetFilterModal";
import BHKFilterModal from "../../components/BHKFilterModal";
import PossessionFilterModal from "../../components/PossessionFilterModal";
import { openBudgetFilter, setSearchQuery, clearNonTypeFilters, togglePropertyType, clearPropertyTypes, openFilter, clearFilters } from "../../store/slices/filterSlice";
import { fetchFeaturedProjectsThunk, fetchNearbyProjectsThunk, fetchProjectListThunk, setMapProjects } from "../../store/slices/projectSlice";
import { fetchHighGrowthProjectsThunk } from "../../store/slices/propertiesSlice";
import { buildProjectAddress, buildProjectPrice, parseProjectPriceAmount } from "../../services/projectDisplay";
import { isReraApproved } from "../../components/ReraStatusBadge";

// Filter constants
const BUDGET_MIN = 2000000;
const BUDGET_MAX = 50000000;
const AREA_MIN = 0;
const AREA_MAX = 5000;
const SUBTYPE_FILTERS = ['Apartment', 'Villa', 'Plot', 'Shop', 'Office', 'Showroom', 'Rowhouse'];

const normalizeText = (value) => String(value ?? '').toLowerCase().trim();
const cleanDisplayText = (value) => {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (!text || ['none', 'null', 'undefined'].includes(text.toLowerCase())) return '';
    return text;
};

// Calculate distance between two coordinates in kilometers using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const getSearchText = (project) => [
    project.name,
    project.title,
    project.project_name,
    project.property_name,
    project.area,
    project.city,
    project.location,
    project.pincode,
    project.category,
    project.property_type,
    project.property_subtype,
    project.type,
].map(normalizeText).filter(Boolean).join(' ');

const getNumber = (...values) => {
    for (const value of values) {
        if (value === null || value === undefined || value === '') continue;
        const number = Number(String(value).replace(/[^0-9.]/g, ''));
        if (Number.isFinite(number) && number > 0) return number;
    }
    return null;
};

const getProjectPriceRange = (project) => {
    const variantPrices = collectVariantPrices(project);
    const min = firstProjectPrice(
        project.price_from,
        project.min_price,
        project.budgetMin,
        project.priceMin,
        project.base_price,
        project.property_min_price,
        project.inventory_min_price,
        project.display_price,
        project.priceRange,
        project.price_range,
        project.priceINR,
        project.price,
    ) ?? (variantPrices.length ? Math.min(...variantPrices) : null);
    const max = firstProjectPrice(
        project.price_to,
        project.max_price,
        project.budgetMax,
        project.priceMax,
        project.property_max_price,
        project.inventory_max_price,
        project.display_price,
        project.priceRange,
        project.price_range,
        project.priceINR,
        project.price,
    ) ?? (variantPrices.length ? Math.max(...variantPrices) : min);
    return { min, max };
};

const firstProjectPrice = (...values) => {
    for (const value of values) {
        const amount = parseProjectPriceAmount(value);
        if (amount) return amount;
    }
    return null;
};

const getSortPrice = (project) => {
    const priceRange = getProjectPriceRange(project);
    return priceRange.min || priceRange.max || null;
};

const getCreatedTime = (project) => {
    const value = project.created_at || project.createdAt || project.updated_at || project.updatedAt;
    const time = value ? new Date(value).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
};

const getNestedUnits = (project) => [
    ...(Array.isArray(project.variants) ? project.variants : []),
    ...(Array.isArray(project.floorPlans) ? project.floorPlans : []),
    ...(Array.isArray(project.floor_plans) ? project.floor_plans : []),
    ...(Array.isArray(project.properties) ? project.properties : []),
    ...(Array.isArray(project.units) ? project.units : []),
    ...(Array.isArray(project.inventory_units) ? project.inventory_units : []),
];

const collectVariantPrices = (project) =>
    getNestedUnits(project)
        .flatMap((unit) => [
            unit?.price,
            unit?.base_price,
            unit?.price_from,
            unit?.min_price,
            unit?.price_to,
            unit?.max_price,
            unit?.priceRange,
            unit?.price_range,
        ])
        .map(parseProjectPriceAmount)
        .filter(Boolean);

const getProjectArea = (project) =>
    getNumber(project.total_area_sqft, project.area_sqft, project.areaSqft, project.total_area, project.carpet_area);

const matchesPropertyType = (project, selectedTypes) => {
    if (selectedTypes.length === 0) return true;

    // Priority 1: Check available_subtypes array (most reliable)
    if (Array.isArray(project.available_subtypes) && project.available_subtypes.length > 0) {
        const subtypes = project.available_subtypes.map(normalizeText);
        return selectedTypes.some((type) => {
            const selected = normalizeText(type);
            // Exact match or with 's' plural
            return subtypes.some(subtype => 
                subtype === selected || 
                subtype === `${selected}s` || 
                `${subtype}s` === selected
            );
        });
    }

    // Priority 2: Check nested units for their property types
    const units = getNestedUnits(project);
    if (units.length > 0) {
        const unitTypes = units
            .flatMap((unit) => [
                unit?.property_type,
                unit?.property_subtype,
                unit?.sub_type,
                unit?.type,
            ])
            .filter(Boolean)
            .map(normalizeText);
        
        if (unitTypes.length > 0) {
            return selectedTypes.some((type) => {
                const selected = normalizeText(type);
                return unitTypes.some(unitType => 
                    unitType === selected || 
                    unitType === `${selected}s` || 
                    `${unitType}s` === selected
                );
            });
        }
    }

    // Priority 3: Fallback to checking project-level fields
    const projectTypes = [
        project.property_type,
        project.property_subtype,
        project.category,
        project.type,
    ]
        .filter(Boolean)
        .map(normalizeText);

    return selectedTypes.some((type) => {
        const selected = normalizeText(type);
        return projectTypes.some(projectType => 
            projectType === selected || 
            projectType === `${selected}s` || 
            `${projectType}s` === selected
        );
    });
};

const getBhkValues = (project) => {
    const values = new Set();
    const fields = [
        project.bedrooms,
        project.bhk,
        project.bhk_config,
        project.configuration,
        project.configurations,
        project.configs,
        ...(Array.isArray(project.available_configurations) ? project.available_configurations : []),
        project.property_subtype,
        project.propertySubtype,
        project.sub_type,
        ...(Array.isArray(project.subTypes) ? project.subTypes : []),
        ...getNestedUnits(project).flatMap((unit) => [
            unit?.bedrooms,
            unit?.bhk,
            unit?.configuration,
            unit?.property_subtype,
            unit?.sub_type,
            unit?.type,
            unit?.title,
        ]),
    ];

    fields.forEach((field) => {
        const text = normalizeText(field);
        if (!text) return;

        const matches = text.match(/\d+\+?(?=\s*(?:bhk|bed|bedroom)\b)/g) || [];
        matches.forEach((match) => values.add(match.trim()));

        if (text.includes('bhk')) {
            const looseMatches = text.match(/\d+\+?/g) || [];
            looseMatches.forEach((match) => values.add(match.trim()));
        }

        const plainNumber = Number(text);
        if (Number.isFinite(plainNumber) && plainNumber > 0) values.add(String(plainNumber));
    });

    return values;
};

const matchesBhk = (project, selectedSubTypes) => {
    if (selectedSubTypes.length === 0) return true;

    const bhkValues = getBhkValues(project);
    return selectedSubTypes.some((subType) => {
        const selected = normalizeText(subType).replace(/\s*bhk/g, '').trim();
        const selectedNumber = parseFloat(selected);
        const selectedIsPlus = selected.includes('+');

        return [...bhkValues].some((value) => {
            const bhkNumber = parseFloat(value);
            if (!Number.isFinite(bhkNumber)) return false;
            if (selectedIsPlus) return bhkNumber >= selectedNumber;
            return bhkNumber === selectedNumber;
        });
    });
};

const getPossessionStatuses = (project) => {
    const values = [
        project.possessionStatus,
        project.possession_status,
        project.possession,
        project.possession_date,
        ...getNestedUnits(project).flatMap((unit) => [
            unit?.possessionStatus,
            unit?.possession_status,
            unit?.possession,
            unit?.possession_date,
        ]),
    ];

    const statuses = new Set();

    values.forEach((value) => {
        const text = normalizeText(value);
        if (!text) return;

        if (text.includes('ready') || text.includes('immediate')) {
            statuses.add('Ready to Move');
            return;
        }

        if (text.includes('under') || text.includes('construction') || text.includes('upcoming')) {
            statuses.add('Under Construction');
            return;
        }

        const parsedDate = new Date(value);
        if (!Number.isNaN(parsedDate.getTime())) {
            statuses.add(parsedDate.getTime() <= Date.now() ? 'Ready to Move' : 'Under Construction');
        }
    });

    return statuses;
};

const getPossessionStatus = (project) => {
    const statuses = getPossessionStatuses(project);
    if (statuses.size > 0) return [...statuses][0];

    const text = normalizeText(project.possessionStatus || project.possession_status || project.possession || project.possession_date);
    if (!text) return '';
    if (text.includes('ready') || text.includes('immediate')) return 'Ready to Move';
    if (text.includes('under') || text.includes('construction')) return 'Under Construction';
    return project.possessionStatus || project.possession_status || project.possession || project.possession_date;
};

const hasRera = (project) => isReraApproved(project);

function applyFilters(projects, filter) {
    return projects.filter((p) => {
        const searchText = getSearchText(p);

        // Location-based filtering (prioritize coordinates over text)
        if (filter.locationCoordinates) {
            // If coordinates are available, calculate distance
            const projectLat = p.latitude ?? p.lat;
            const projectLng = p.longitude ?? p.lng ?? p.lon;
            
            if (projectLat != null && projectLng != null) {
                const distance = calculateDistance(
                    filter.locationCoordinates.latitude,
                    filter.locationCoordinates.longitude,
                    projectLat,
                    projectLng
                );
                // Filter projects within 10km radius
                if (distance > 10) return false;
            }
        } else if (filter.address) {
            // Fallback to text-based location matching if no coordinates
            const q = filter.address.toLowerCase().trim();
            if (!searchText.includes(q)) return false;
        }

        if (filter.searchQuery) {
            const q = filter.searchQuery.toLowerCase().trim();
            const bhkMatch = q.match(/\b([1-5])\s*(?:bhk|bedroom|bed)\b/);
            const subtypeMatch = q.match(/\b(apartment|flat|villa|bungalow|plot|land|shop|office|showroom|rowhouse|townhouse)\b/);
            if (bhkMatch && !matchesBhk(p, [`${bhkMatch[1]} BHK`])) return false;
            if (subtypeMatch && !matchesPropertyType(p, [subtypeMatch[1]])) return false;

            const remainingText = q
                .replace(/\b[1-5]\s*(?:bhk|bedroom|bed)\b/g, ' ')
                .replace(/\b(apartment|flat|villa|bungalow|plot|land|shop|office|showroom|rowhouse|townhouse)\b/g, ' ')
                .replace(/\b(in|at|near)\b/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (remainingText && !searchText.includes(remainingText)) return false;
        }

        if (!matchesPropertyType(p, filter.propertyTypes)) return false;
        if (!matchesBhk(p, filter.propertySubTypes)) return false;

        const priceRange = getProjectPriceRange(p);
        const budgetLowerActive = filter.budgetRange[0] > BUDGET_MIN;
        const budgetUpperActive = filter.budgetRange[1] < BUDGET_MAX;
        if ((budgetLowerActive || budgetUpperActive) && (!priceRange.min || !priceRange.max)) return false;
        if (budgetLowerActive && priceRange.max < filter.budgetRange[0]) return false;
        if (budgetUpperActive && priceRange.min > filter.budgetRange[1]) return false;

        const projectArea = getProjectArea(p);
        const areaLowerActive = filter.areaRange[0] > AREA_MIN;
        const areaUpperActive = filter.areaRange[1] < AREA_MAX;
        if ((areaLowerActive || areaUpperActive) && !projectArea) return false;
        if (areaLowerActive && projectArea < filter.areaRange[0]) return false;
        if (areaUpperActive && projectArea > filter.areaRange[1]) return false;

        if (filter.possessionStatus.length > 0) {
            const statuses = getPossessionStatuses(p);
            if (!filter.possessionStatus.some((status) => statuses.has(status) || status === getPossessionStatus(p))) return false;
        }

        if (filter.reraOnly && !hasRera(p)) return false;

        return true;
    });
}

function ProjectCard({ item }) {
    const title = item.name || item.title || item.project_name || 'Project';
    const location = item.display_location || buildProjectAddress(item) || cleanDisplayText(item.location || item.address);
    const price = item.display_price || buildProjectPrice(item);
    const image = item.cover_image_url || item.cover_image || item.image_url || item.image;

    return (
        <View
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6 mx-4"
        >
            <TouchableOpacity
                activeOpacity={0.97}
                onPress={() => router.push({ pathname: '/(screens)/project-detail', params: { id: item.id, slug: item.slug } })}
            >
                <View className="flex-row h-36 w-full">
                    <View className="flex-[2] relative bg-gray-200 border-r-2 border-white">
                        {image
                            ? <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                            : <View className="w-full h-full bg-gray-200 items-center justify-center">
                                <MaterialCommunityIcons name="office-building-outline" size={32} color="#9CA3AF" />
                              </View>
                        }
                    </View>
                    <View className="flex-[1] relative bg-gray-100 items-center justify-center">
                        <MaterialCommunityIcons name="image-outline" size={24} color="#D1D5DB" />
                    </View>
                </View>

                <View className="px-3 pt-3 pb-2">
                    <Text className="text-[10px] text-[#6B7280] font-manrope mb-[4px]" numberOfLines={1}>
                        {location || item.pincode}
                    </Text>
                    <View className="flex-row items-center mb-1">
                        <Text className="text-[15px] font-manrope-extrabold text-[#111827] flex-1" numberOfLines={1}>{title}</Text>
                    </View>
                    <Text className="text-[13px] text-[#4A43EC] font-manrope-extrabold mb-1" numberOfLines={1}>
                        {price || 'Price on request'}
                    </Text>
                    <Text className="text-[11px] text-[#9CA3AF] font-manrope">
                        {item.distance_km ? `${item.distance_km} km away` : item.pincode}
                    </Text>
                </View>

                <View className="mx-3 mb-2" style={{ borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#E5E7EB' }} />
            </TouchableOpacity>

            <View className="px-3 pb-3">
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(screens)/project-detail', params: { id: item.id, slug: item.slug } })}
                    className="w-full border border-[#4A43EC] rounded-xl py-2 items-center justify-center"
                >
                    <Text className="text-[#4A43EC] font-manrope-extrabold text-[13px]">View details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function PropertyListing() {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const filter = useSelector((state) => state.filter);
    const { list: apiProjects, featured, nearby, loading: projectsLoading, featuredLoading, nearbyLoading } = useSelector((state) => state.project);
    const { highGrowthProjects, highGrowthLocalities, highGrowthLoading, highGrowthCity } = useSelector((state) => state.properties);
    const { category, focus, featured: featuredParam, recommended, highGrowth, nearby: nearbyParam, latitude, longitude, locationName } = useLocalSearchParams();
    const isFocusMode = focus === '1';
    const isFeaturedMode = featuredParam === '1';
    const isRecommendedMode = recommended === '1';
    const isHighGrowthMode = highGrowth === '1';
    const isNearbyMode = nearbyParam === '1';
    const nearbyLocationName = Array.isArray(locationName) ? locationName[0] : locationName;
    const [localQuery, setLocalQuery] = useState(isNearbyMode ? (nearbyLocationName || filter.searchQuery || '') : (filter.searchQuery || ''));
    const [sortKey, setSortKey] = useState('relevance');
    const [sortOpen, setSortOpen] = useState(false);
    const [bhkOpen, setBhkOpen] = useState(false);
    const [possessionOpen, setPossessionOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', () => {
            dispatch(clearFilters());
        });
        return unsubscribe;
    }, [dispatch, navigation]);

    // Fetch project list on mount if not already loaded
    useEffect(() => {
        dispatch(fetchProjectListThunk());
    }, [dispatch]);

    useEffect(() => {
        if (isFocusMode || isFeaturedMode) {
            dispatch(fetchFeaturedProjectsThunk());
        }
    }, [dispatch, isFocusMode, isFeaturedMode]);

    useEffect(() => {
        if (isHighGrowthMode) {
            dispatch(fetchHighGrowthProjectsThunk());
        }
    }, [dispatch, isHighGrowthMode]);

    useEffect(() => {
        if (!isNearbyMode || !latitude || !longitude) return;

        dispatch(fetchNearbyProjectsThunk({
            latitude: Number(latitude),
            longitude: Number(longitude),
        }));
    }, [dispatch, isNearbyMode, latitude, longitude]);

    // Sync search input with Redux searchQuery when navigated from SearchOverlay
    useEffect(() => {
        setLocalQuery(isNearbyMode ? (nearbyLocationName || filter.searchQuery || '') : (filter.searchQuery || ''));
    }, [filter.searchQuery, isNearbyMode, nearbyLocationName]);

    const SORT_OPTIONS = [
        { key: 'relevance', label: 'Relevance' },
        { key: 'newest', label: 'Newest First' },
        { key: 'price_asc', label: 'Price - Low to High' },
        { key: 'price_desc', label: 'Price - High to Low' },
    ];

    const handleSearch = (text) => {
        setLocalQuery(text);
        dispatch(setSearchQuery(text));
    };

    const highGrowthSource = highGrowthProjects?.length > 0 ? highGrowthProjects : highGrowthLocalities;
    const highGrowthList = (highGrowthSource || []).map((project) => ({
        ...project,
        title: project.name || project.title || 'Project',
        location: project.location || buildProjectAddress(project),
        display_price: project.price_range || project.display_price || buildProjectPrice(project),
        priceRange: project.price_range || project.priceRange,
        priceINR: project.price_range || project.priceINR,
        image: project.cover_image || project.cover_image_url || project.image,
        cover_image_url: project.cover_image || project.cover_image_url || project.image,
        bhk: project.bhk_config || project.bhk,
        possessionStatus: project.possession || project.possessionStatus,
    }));

    const projects = (isFocusMode || isFeaturedMode)
        ? featured
        : (isHighGrowthMode ? highGrowthList : (isNearbyMode ? nearby : apiProjects));
    const effectiveFilter = (isFocusMode || isFeaturedMode || isRecommendedMode || isHighGrowthMode)
        ? {
            ...filter,
            propertyTypes: [],
            propertySubTypes: [],
            budgetRange: [BUDGET_MIN, BUDGET_MAX],
            areaRange: [AREA_MIN, AREA_MAX],
            possessionStatus: [],
            reraOnly: false,
        }
        : (isNearbyMode ? { ...filter, searchQuery: '' } : filter);
    const filtered = applyFilters(projects, effectiveFilter);

    const sorted = [...filtered].sort((a, b) => {
        if (sortKey === 'newest') return getCreatedTime(b) - getCreatedTime(a);

        if (sortKey === 'price_asc' || sortKey === 'price_desc') {
            const priceA = getSortPrice(a);
            const priceB = getSortPrice(b);
            if (priceA === null && priceB === null) return 0;
            if (priceA === null) return 1;
            if (priceB === null) return -1;
            return sortKey === 'price_asc' ? priceA - priceB : priceB - priceA;
        }

        return 0;
    });

    const activeSortLabel = SORT_OPTIONS.find(o => o.key === sortKey)?.label ?? 'Relevance';
    const handleOpenMap = () => {
        dispatch(setMapProjects(sorted));
        const title = isFeaturedMode
            ? 'Featured Projects'
            : (isRecommendedMode
                ? 'Recommended Projects'
                : (isHighGrowthMode
                    ? `High Growth Projects${highGrowthCity ? ` in ${highGrowthCity}` : ''}`
                    : (isFocusMode ? 'Project in Focus' : (isNearbyMode ? 'Nearby Projects' : 'Project Page'))));
        router.push({
            pathname: "/(screens)/map-view",
            params: {
                title,
            },
        });
    };

    const pageTitle = isFeaturedMode
        ? 'Featured Projects'
        : (isRecommendedMode
            ? 'Recommended Projects'
            : (isHighGrowthMode
                ? `High Growth Projects${highGrowthCity ? ` in ${highGrowthCity}` : ''}`
                : (isFocusMode ? 'Project in Focus' : (isNearbyMode ? 'Nearby Projects' : 'Project Page'))));

    const listLoading = isHighGrowthMode
        ? highGrowthLoading
        : ((isFocusMode || isFeaturedMode) ? featuredLoading : (isNearbyMode ? nearbyLoading : projectsLoading));

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <BudgetFilterModal />
            <BHKFilterModal visible={bhkOpen} onClose={() => setBhkOpen(false)} />
            <PossessionFilterModal visible={possessionOpen} onClose={() => setPossessionOpen(false)} />

            <Image
                source={require('../../assets/images/blur (3).png')}
                pointerEvents="none"
                style={{ position: 'absolute', left: -40, top: -30, width: 570, height: 360, opacity: 0.6, zIndex: -1 }}
            />
            <Image
                source={require('../../assets/images/blur (5).png')}
                pointerEvents="none"
                style={{ position: 'absolute', left: 216, top: 23, width: 241, height: 241, borderRadius: 1000, opacity: 1, zIndex: -1 }}
            />

            <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'transparent', zIndex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                        <Ionicons name="chevron-back" size={20} color="#374151" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 }}>
                        {pageTitle}
                    </Text>
                    <TouchableOpacity>
                        <Ionicons name="notifications-outline" size={22} color="#374151" />
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 44, gap: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
                        <FontAwesome name="search" size={16} color="#4A43EC" />
                        <TextInput
                            value={localQuery}
                            onChangeText={handleSearch}
                            placeholder="Search..."
                            placeholderTextColor="#9CA3AF"
                            style={{ flex: 1, fontSize: 14, color: '#111827' }}
                        />
                    </View>
                      <TouchableOpacity onPress={() => dispatch(openFilter())} className="flex-row items-center bg-[#4A43EC] rounded-xl px-5 h-[44px] w-[53px] gap-2">
                                  <AntDesign name="spotify" size={18} color="#7F88E5" />
                                </TouchableOpacity>
                    <TouchableOpacity onPress={handleOpenMap} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#4A43EC', alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name="map-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => { dispatch(clearNonTypeFilters()); dispatch(clearPropertyTypes()); }}
                        style={{ backgroundColor: '#4A43EC', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 }}
                    >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>View All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => dispatch(openBudgetFilter())}
                        style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#fff', gap: 4 }}
                    >
                        <Text style={{ fontSize: 12, color: '#374151' }}>Budget</Text>
                        <Ionicons name="chevron-down" size={12} color="#6B7280" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setBhkOpen(true)}
                        style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: filter.propertySubTypes.length > 0 ? '#4A43EC' : '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: filter.propertySubTypes.length > 0 ? '#F5F3FF' : '#fff', gap: 4 }}
                    >
                        <Text style={{ fontSize: 12, color: filter.propertySubTypes.length > 0 ? '#4A43EC' : '#374151' }}>
                            {filter.propertySubTypes.length > 0 ? filter.propertySubTypes.join(', ') : 'BHK'}
                        </Text>
                        <Ionicons name="chevron-down" size={12} color={filter.propertySubTypes.length > 0 ? '#4A43EC' : '#6B7280'} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setPossessionOpen(true)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: (filter.possessionStatus.length > 0 || filter.reraOnly) ? '#4A43EC' : '#E5E7EB',
                            borderRadius: 10,
                            paddingHorizontal: 12,
                            paddingVertical: 7,
                            backgroundColor: (filter.possessionStatus.length > 0 || filter.reraOnly) ? '#F5F3FF' : '#fff',
                            gap: 4,
                        }}
                    >
                        <Text style={{ fontSize: 12, color: (filter.possessionStatus.length > 0 || filter.reraOnly) ? '#4A43EC' : '#374151' }}>
                            {filter.possessionStatus.length > 0 ? filter.possessionStatus.join(', ') : 'Possession'}
                        </Text>
                        <Ionicons name="chevron-down" size={12} color={(filter.possessionStatus.length > 0 || filter.reraOnly) ? '#4A43EC' : '#6B7280'} />
                    </TouchableOpacity>
                </View>
              
            </View>
            <View style={{ height: 1, backgroundColor: '#E5E7EB', width: '85%', alignSelf: 'center', marginVertical: 4, marginBottom: 8, marginTop: 4, }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: '#6B7280' }}>
                    <Text style={{ fontWeight: '700', color: '#111827' }}>{sorted.length}</Text>{isFeaturedMode ? ' Featured Projects' : (isRecommendedMode ? ' Recommended Projects' : (isHighGrowthMode ? ' High Growth Projects' : (isFocusMode ? ' Projects in Focus' : (category ? ` ${category}s` : ' Premium Projects'))))}
                </Text>
                <TouchableOpacity onPress={() => setSortOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 12, color: '#4A43EC', fontWeight: '600' }}>SORT BY: {activeSortLabel.toUpperCase()}</Text>
                    <MaterialCommunityIcons name="sort" size={14} color="#4A43EC" />
                </TouchableOpacity>
            </View>

            {/* Sort dropdown modal */}
            <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}>
                <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }} onPress={() => setSortOpen(false)}>
                    <View style={{
                        position: 'absolute', right: 16, top: 180,
                        backgroundColor: '#fff', borderRadius: 14,
                        overflow: 'hidden', minWidth: 210,
                        shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, elevation: 8,
                    }}>
                        {SORT_OPTIONS.map((opt, i) => (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => { setSortKey(opt.key); setSortOpen(false); }}
                                style={{
                                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                                    paddingHorizontal: 16, paddingVertical: 14,
                                    borderBottomWidth: i < SORT_OPTIONS.length - 1 ? 1 : 0,
                                    borderBottomColor: '#F3F4F6',
                                    backgroundColor: sortKey === opt.key ? '#F5F3FF' : '#fff',
                                }}
                            >
                                <Text style={{ fontSize: 14, color: sortKey === opt.key ? '#4A43EC' : '#374151', fontWeight: sortKey === opt.key ? '600' : '400' }}>
                                    {opt.label}
                                </Text>
                                {sortKey === opt.key && <Ionicons name="checkmark" size={16} color="#4A43EC" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            <FlatList
                data={sorted}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ProjectCard item={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
                ListEmptyComponent={
                    listLoading ? (
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <Text style={{ fontSize: 15, color: '#9CA3AF' }}>
                                {isFeaturedMode ? 'Loading featured projects...' : (isHighGrowthMode ? 'Loading high growth projects...' : (isFocusMode ? 'Loading projects in focus...' : (isNearbyMode ? 'Finding nearby projects...' : 'Loading projects...')))}
                            </Text>
                        </View>
                    ) : (
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <MaterialCommunityIcons name="home-search-outline" size={48} color="#D1D5DB" />
                            <Text style={{ fontSize: 15, color: '#9CA3AF', marginTop: 12 }}>No properties match your filters</Text>
                            <Text style={{ fontSize: 13, color: '#D1D5DB', marginTop: 4 }}>Try adjusting or clearing filters</Text>
                        </View>
                    )
                }
            />
        </View>
    );
}
