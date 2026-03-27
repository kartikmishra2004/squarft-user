import { View, Text, TextInput, TouchableOpacity, FlatList, Image } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import { allProjects } from "../../data/projects";
import FilterModal from "../../components/FilterModal";
import { openFilter, setSearchQuery } from "../../store/slices/filterSlice";

const BHK_MAP = {
    "1 BHK": 1, "2 BHK": 2, "3 BHK": 3, "4 BHK": 4, "5+ BHK": 5,
};

function applyFilters(projects, filter) {
    return projects.filter((p) => {
        if (filter.searchQuery) {
            const q = filter.searchQuery.toLowerCase();
            const match = p.name.toLowerCase().includes(q) ||
                p.location.toLowerCase().includes(q) ||
                p.builder.toLowerCase().includes(q) ||
                p.subTypes.some(s => s.toLowerCase().includes(q));
            if (!match) return false;
        }

        if (filter.propertyTypes.length > 0 && !filter.propertyTypes.includes(p.propertyType)) return false;

        if (filter.propertySubTypes.length > 0) {
            const match = filter.propertySubTypes.some((s) => p.subTypes.includes(s));
            if (!match) return false;
        }

        if (p.budgetMax < filter.budgetRange[0] || p.budgetMin > filter.budgetRange[1]) return false;

        if (p.areaSqft < filter.areaRange[0] || p.areaSqft > filter.areaRange[1]) return false;

        if (filter.possessionStatus.length > 0 && !filter.possessionStatus.includes(p.possessionStatus)) return false;

        return true;
    });
}

function ProjectCard({ item }) {
    return (
        <View style={{ backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 }}>
            <View style={{ flexDirection: 'row', height: 160 }}>
                <View style={{ flex: 1, position: 'relative' }}>
                    <Image source={item.imageMain} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3 }}>
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>{item.builder}</Text>
                    </View>
                    {item.zeroBrokerage && (
                        <View style={{ position: 'absolute', bottom: 0, left: 0, backgroundColor: '#16A34A', paddingHorizontal: 10, paddingVertical: 4 }}>
                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>ZERO BROKERAGE</Text>
                        </View>
                    )}
                </View>
                <View style={{ width: 100, position: 'relative' }}>
                    <Image source={item.imageThumb} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    <View style={{ position: 'absolute', bottom: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                        <Text style={{ color: '#fff', fontSize: 10 }}>1/{item.totalImages}</Text>
                    </View>
                </View>
            </View>

            <View style={{ padding: 14 }}>
                <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>
                    Possession: {item.possession}{'  •  '}Avg Price per sq ft: {item.avgPricePerSqft}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>{item.name}</Text>
                    {item.rera && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#16A34A', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1, gap: 3 }}>
                            <Text style={{ fontSize: 10, color: '#16A34A', fontWeight: '700' }}>RERA</Text>
                            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#16A34A' }} />
                        </View>
                    )}
                </View>

                <Text style={{ fontSize: 13, color: '#6B7280', marginBottom: 12 }}>{item.location}</Text>

                <View style={{ flexDirection: 'row', gap: 24, marginBottom: 14 }}>
                    {item.variants.map((v, i) => (
                        <View key={i}>
                            <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '600', marginBottom: 2 }}>{v.type}</Text>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>{v.priceRange}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={{ borderWidth: 1.5, borderColor: '#4A43EC', borderRadius: 10, paddingVertical: 12, alignItems: 'center' }}>
                    <Text style={{ color: '#4A43EC', fontSize: 14, fontWeight: '600' }}>View details</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function PropertyListing() {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const filter = useSelector((state) => state.filter);
    const [localQuery, setLocalQuery] = useState(filter.searchQuery || '');

    const handleSearch = (text) => {
        setLocalQuery(text);
        dispatch(setSearchQuery(text));
    };

    const filtered = applyFilters(allProjects, filter);

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
            <FilterModal />

            <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#F9FAFB' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                        <Ionicons name="chevron-back" size={20} color="#374151" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 }}>Property Page</Text>
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
                        <MaterialCommunityIcons name="tune-variant" size={20} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name="view-grid-outline" size={20} color="#374151" />
                    </TouchableOpacity>
                </View>

                <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity style={{ backgroundColor: '#4A43EC', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 }}>
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Map View</Text>
                    </TouchableOpacity>
                    {['Budget', 'BHK', 'Possession'].map((f) => (
                        <TouchableOpacity key={f} onPress={() => dispatch(openFilter())} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#fff', gap: 4 }}>
                            <Text style={{ fontSize: 12, color: '#374151' }}>{f}</Text>
                            <Ionicons name="chevron-down" size={12} color="#6B7280" />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 }}>
                <Text style={{ fontSize: 13, color: '#6B7280' }}>
                    <Text style={{ fontWeight: '700', color: '#111827' }}>{filtered.length}</Text> Premium Projects
                </Text>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 12, color: '#4A43EC', fontWeight: '600' }}>SORT BY: RELEVANCE</Text>
                    <MaterialCommunityIcons name="sort" size={14} color="#4A43EC" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ProjectCard item={item} />}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
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
