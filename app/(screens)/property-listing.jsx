import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, Pressable } from "react-native";
import { useState, useEffect } from "react"; 
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome, AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { router, useLocalSearchParams } from "expo-router";
import FilterModal from "../../components/FilterModal";
import BudgetFilterModal from "../../components/BudgetFilterModal";
import BHKFilterModal from "../../components/BHKFilterModal";
import PossessionFilterModal from "../../components/PossessionFilterModal";
import { openFilter, openBudgetFilter, setSearchQuery, clearNonTypeFilters } from "../../store/slices/filterSlice";
import { fetchFeaturedProjectsThunk, fetchNearbyProjectsThunk, fetchProjectListThunk, setMapProjects } from "../../store/slices/projectSlice";
import { buildProjectAddress, buildProjectPrice, parseProjectPriceAmount } from "../../services/projectDisplay";

// Filter constants
const BUDGET_MIN = 2000000;
const BUDGET_MAX = 50000000;
const AREA_MIN = 0;
const AREA_MAX = 5000;

const normalizeText = (value) => String(value ?? '').toLowerCase().trim();
const cleanDisplayText = (value) => {
    const text = String(value ?? '').replace(/\s+/g, ' ').trim();
    if (!text || ['none', 'null', 'undefined'].includes(text.toLowerCase())) return '';
    return text;
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
    const min = firstProjectPrice(project.price_from, project.min_price, project.budgetMin, project.priceMin, project.base_price, project.price);
    const max = firstProjectPrice(project.price_to, project.max_price, project.budgetMax, project.priceMax, project.price) ?? min;
    return { min, max };
};

const firstProjectPrice = (...values) => {
    for (const value of values) {
        const amount = parseProjectPriceAmount(value);
        if (amount) return amount;
    }
    return null;
};

const getProjectArea = (project) =>
    getNumber(project.total_area_sqft, project.area_sqft, project.areaSqft, project.total_area, project.carpet_area);

const getProjectTypeText = (project) => [
    project.propertyType,
    project.property_type,
    project.property_subtype,
    project.category,
    project.type,
    project.name,
].map(normalizeText).filter(Boolean).join(' ');

const matchesPropertyType = (project, selectedTypes) => {
    if (selectedTypes.length === 0) return true;

    const text = getProjectTypeText(project);
    return selectedTypes.some((type) => {
        const selected = normalizeText(type);
        if (selected === 'flat/apartment') return /\b(flat|apartment|residential)\b/.test(text);
        if (selected === 'house/villa') return /\b(house|villa|rowhouse|row house)\b/.test(text);
        if (selected === 'plot') return /\b(plot|land)\b/.test(text);
        if (selected === 'commercial') return /\b(commercial|shop|showroom|office|retail)\b/.test(text);
        return text.includes(selected);
    });
};

const getBhkValues = (project) => {
    const values = new Set();
    const fields = [
        project.bedrooms,
        project.bhk,
        project.configuration,
        project.configurations,
        project.property_subtype,
        project.propertyType,
        project.type,
        project.name,
        ...(Array.isArray(project.subTypes) ? project.subTypes : []),
        ...(Array.isArray(project.variants) ? project.variants.map((variant) => variant.type || variant.title) : []),
    ];

    fields.forEach((field) => {
        const text = normalizeText(field);
        if (!text) return;
        const matches = text.match(/\d+\+?\s*bhk|\d+\+/g) || [];
        matches.forEach((match) => values.add(match.replace(/\s*bhk/g, '').trim()));
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
        return bhkValues.has(selected);
    });
};

const getPossessionStatus = (project) => {
    const text = normalizeText(project.possessionStatus || project.possession_status || project.possession);
    if (!text) return '';
    if (text.includes('ready') || text.includes('immediate')) return 'Ready to Move';
    if (text.includes('under') || text.includes('construction')) return 'Under Construction';
    return project.possessionStatus || project.possession_status || project.possession;
};

const hasRera = (project) => Boolean(project.rera || project.rera_id || project.reraId || project.rera_number);

function applyFilters(projects, filter) {
    return projects.filter((p) => {
        const searchText = getSearchText(p);

        if (filter.address) {
            const q = filter.address.toLowerCase().trim();
            if (!searchText.includes(q)) return false;
        }

        if (filter.searchQuery) {
            const q = filter.searchQuery.toLowerCase().trim();
            if (!searchText.includes(q)) return false;
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

        if (filter.possessionStatus.length > 0 && !filter.possessionStatus.includes(getPossessionStatus(p))) return false;

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
    const filter = useSelector((state) => state.filter);
    const { list: apiProjects, featured, nearby, loading: projectsLoading, featuredLoading, nearbyLoading } = useSelector((state) => state.project);
    const { category, focus, featured: featuredParam, recommended, nearby: nearbyParam, latitude, longitude, locationName } = useLocalSearchParams();
    const isFocusMode = focus === '1';
    const isFeaturedMode = featuredParam === '1';
    const isRecommendedMode = recommended === '1';
    const isNearbyMode = nearbyParam === '1';
    const nearbyLocationName = Array.isArray(locationName) ? locationName[0] : locationName;
    const [localQuery, setLocalQuery] = useState(isNearbyMode ? (nearbyLocationName || filter.searchQuery || '') : (filter.searchQuery || ''));
    const [sortKey, setSortKey] = useState('relevance');
    const [sortOpen, setSortOpen] = useState(false);
    const [bhkOpen, setBhkOpen] = useState(false);
    const [possessionOpen, setPossessionOpen] = useState(false);

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

    const projects = (isFocusMode || isFeaturedMode) ? featured : (isNearbyMode ? nearby : apiProjects);
    const effectiveFilter = (isFocusMode || isFeaturedMode || isRecommendedMode)
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
        if (sortKey === 'newest') return (b.created_at || '').localeCompare(a.created_at || '');
        return 0;
    });

    const activeSortLabel = SORT_OPTIONS.find(o => o.key === sortKey)?.label ?? 'Relevance';
    const handleOpenMap = () => {
        dispatch(setMapProjects(sorted));
        const title = isFeaturedMode
            ? 'Featured Projects'
            : (isRecommendedMode
                ? 'Recommended Projects'
                : (isFocusMode ? 'Project in Focus' : (isNearbyMode ? 'Nearby Projects' : 'Project Page')));
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
            : (isFocusMode ? 'Project in Focus' : (isNearbyMode ? 'Nearby Projects' : 'Project Page')));

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <FilterModal />
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
                    <TouchableOpacity onPress={() => dispatch(openFilter())} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#4A43EC', alignItems: 'center', justifyContent: 'center' }}>
                        <AntDesign name="spotify" size={18} color="#7F88E5" />
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }} onPress={handleOpenMap}>
                        <MaterialCommunityIcons name="map-outline" size={18} color="#333" />
                    </TouchableOpacity> */}
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => dispatch(clearNonTypeFilters())}
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
                    <Text style={{ fontWeight: '700', color: '#111827' }}>{sorted.length}</Text>{isFeaturedMode ? ' Featured Projects' : (isRecommendedMode ? ' Recommended Projects' : (isFocusMode ? ' Projects in Focus' : (category ? ` ${category}s` : ' Premium Projects')))}
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
                    ((isFocusMode || isFeaturedMode) ? featuredLoading : (isNearbyMode ? nearbyLoading : projectsLoading)) ? (
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <Text style={{ fontSize: 15, color: '#9CA3AF' }}>
                                {isFeaturedMode ? 'Loading featured projects...' : (isFocusMode ? 'Loading projects in focus...' : (isNearbyMode ? 'Finding nearby projects...' : 'Loading projects...'))}
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
