import { View, Text, TextInput, TouchableOpacity, FlatList, Image, Modal, Pressable } from "react-native";
import { useRef, useState , useEffect } from "react"; 
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome, AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import FilterModal from "../../components/FilterModal";
import BudgetFilterModal from "../../components/BudgetFilterModal";
import BHKFilterModal from "../../components/BHKFilterModal";
import PossessionFilterModal from "../../components/PossessionFilterModal";
import { openFilter, openBudgetFilter, setSearchQuery, clearFilters, clearNonTypeFilters } from "../../store/slices/filterSlice";
import { useLocalSearchParams } from "expo-router";

// Filter constants
const BUDGET_MIN = 2000000;
const BUDGET_MAX = 50000000;
const AREA_MIN = 0;
const AREA_MAX = 5000;

function applyFilters(projects, filter) {
    return projects.filter((p) => {
        if (filter.address) {
            const q = filter.address.toLowerCase().trim();
            const match =
                (p.name || '').toLowerCase().includes(q) ||
                (p.area || '').toLowerCase().includes(q) ||
                (p.city || '').toLowerCase().includes(q);
            if (!match) return false;
        }

        if (filter.searchQuery) {
            const q = filter.searchQuery.toLowerCase().trim();
            const match =
                (p.name || '').toLowerCase().includes(q) ||
                (p.area || '').toLowerCase().includes(q) ||
                (p.city || '').toLowerCase().includes(q);
            if (!match) return false;
        }

        const budgetLowerActive = filter.budgetRange[0] > BUDGET_MIN;
        const budgetUpperActive = filter.budgetRange[1] < BUDGET_MAX;
        if (budgetLowerActive && p.budgetMax < filter.budgetRange[0]) return false;
        if (budgetUpperActive && p.budgetMin > filter.budgetRange[1]) return false;

        const areaLowerActive = filter.areaRange[0] > AREA_MIN;
        const areaUpperActive = filter.areaRange[1] < AREA_MAX;
        if (areaLowerActive && p.areaSqft < filter.areaRange[0]) return false;
        if (areaUpperActive && p.areaSqft > filter.areaRange[1]) return false;

        if (filter.possessionStatus.length > 0 && !filter.possessionStatus.includes(p.possessionStatus)) return false;

        if (filter.reraOnly && !p.rera) return false;

        return true;
    });
}

function ProjectCard({ item }) {
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
                        {item.cover_image_url
                            ? <Image source={{ uri: item.cover_image_url }} className="w-full h-full" resizeMode="cover" />
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
                    <Text className="text-[10px] text-[#6B7280] font-manrope mb-[4px]">
                        {item.area}, {item.city}
                    </Text>
                    <View className="flex-row items-center mb-1">
                        <Text className="text-[15px] font-manrope-extrabold text-[#111827]">{item.name}</Text>
                    </View>
                    <Text className="text-[11px] text-[#9CA3AF] font-manrope">{item.pincode}</Text>
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
    const { list: apiProjects } = useSelector((state) => state.project);
    const { category } = useLocalSearchParams();
    const [localQuery, setLocalQuery] = useState(filter.searchQuery || '');
    const [sortKey, setSortKey] = useState('relevance');
    const [sortOpen, setSortOpen] = useState(false);
    const [bhkOpen, setBhkOpen] = useState(false);
    const [possessionOpen, setPossessionOpen] = useState(false);

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

    const filtered = applyFilters(apiProjects, filter);

    const sorted = [...filtered].sort((a, b) => {
        if (sortKey === 'newest') return (b.created_at || '').localeCompare(a.created_at || '');
        return 0;
    });

    const activeSortLabel = SORT_OPTIONS.find(o => o.key === sortKey)?.label ?? 'Relevance';

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
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 }}>Project Page</Text>
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
                    <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }} onPress={() => router.push("/(screens)/map-view")}>
                        <MaterialCommunityIcons name="map-outline" size={18} color="#333" />
                    </TouchableOpacity>
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
                    <Text style={{ fontWeight: '700', color: '#111827' }}>{sorted.length}</Text>{category ? ` ${category}s` : ' Premium Projects'}
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
                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                        <MaterialCommunityIcons name="home-search-outline" size={48} color="#D1D5DB" />
                        <Text style={{ fontSize: 15, color: '#9CA3AF', marginTop: 12 }}>No properties match your filters</Text>
                        <Text style={{ fontSize: 13, color: '#D1D5DB', marginTop: 4 }}>Try adjusting or clearing filters</Text>
                    </View>
                }
            />
        </View>
    );
}