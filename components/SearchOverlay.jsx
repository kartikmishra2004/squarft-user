import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { openFilter } from "../store/slices/filterSlice";

const SEARCH_HISTORY = [
    { id: '1', icon: 'history', title: 'Indore 2 BHK', subtitle: '2 hours ago • Vijay Nagar Area' },
    { id: '2', icon: 'location-on', title: 'Mumbai Sea View', subtitle: 'Yesterday • Worli, Mumbai' },
    { id: '3', icon: 'domain', title: 'Luxury Villa in Pune', subtitle: '3 days ago • Baner-Pashan Link Road' },
    { id: '4', icon: 'domain', title: 'Bangalore Tech Park 3BHK', subtitle: '1 week ago • Whitefield' },
];

const TRENDING_SEARCHES = [
    '3 BHK in South Delhi',
    'Penthouse with Sea View',
    'Villas in Goa',
    'Studio Apartments',
];

const TRENDING_LOCATIONS = [
    'Dubai Marina', 'London Zone 1', 'Singapore Orchard', 'Goa Beachfront',
];

const iconMap = {
    'history': { lib: 'MaterialCommunityIcons', name: 'history' },
    'location-on': { lib: 'MaterialCommunityIcons', name: 'map-marker-outline' },
    'domain': { lib: 'MaterialCommunityIcons', name: 'office-building-outline' },
};

function HistoryIcon({ type }) {
    const map = iconMap[type] || iconMap['domain'];
    return (
        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MaterialCommunityIcons name={map.name} size={18} color="#4A43EC" />
        </View>
    );
}

export default function SearchOverlay({ value, onChangeText, onClose, insets }) {
    const dispatch = useDispatch();

    return (
        <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>

            {/* Header */}
            <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#F9FAFB' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                        <Ionicons name="chevron-back" size={20} color="#374151" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Search Property</Text>
                </View>

                {/* Search bar */}
                <View style={{ flexDirection: 'row', marginTop: 14, gap: 10 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 46, gap: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
                        <FontAwesome name="search" size={18} color="#4A43EC" />
                        <View style={{ width: 0.5, alignSelf: 'stretch', marginVertical: 10, backgroundColor: '#7974E7' }} />
                        <TextInput
                            value={value}
                            onChangeText={onChangeText}
                            placeholder="Search..."
                            placeholderTextColor="#9CA3AF"
                            autoFocus
                            style={{ flex: 1, fontSize: 15, color: '#111827' }}
                        />
                    </View>
                    <TouchableOpacity onPress={() => dispatch(openFilter())} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#4A43EC', borderRadius: 14, paddingHorizontal: 16, height: 46, gap: 6 }}>
                        <MaterialCommunityIcons name="tune-variant" size={16} color="#9DA8F0" />
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Filters</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

                {/* Search History */}
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, paddingHorizontal: 20, marginTop: 20, marginBottom: 10 }}>SEARCH HISTORY</Text>
                <View style={{ backgroundColor: '#fff', marginHorizontal: 0 }}>
                    {SEARCH_HISTORY.map((item, i) => (
                        <View key={item.id}>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
                                <HistoryIcon type={item.icon} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{item.title}</Text>
                                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{item.subtitle}</Text>
                                </View>
                                <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                    <Ionicons name="close" size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                            {i < SEARCH_HISTORY.length - 1 && <View style={{ height: 0.5, backgroundColor: '#F3F4F6', marginLeft: 70 }} />}
                        </View>
                    ))}
                </View>

                {/* Trending Searches */}
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, paddingHorizontal: 20, marginTop: 24, marginBottom: 10 }}>TRENDING SEARCHES</Text>
                <View style={{ backgroundColor: '#fff' }}>
                    {TRENDING_SEARCHES.map((item, i) => (
                        <View key={item}>
                            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 }}>
                                <MaterialCommunityIcons name="trending-up" size={18} color="#4A43EC" />
                                <Text style={{ fontSize: 14, color: '#374151' }}>{item}</Text>
                            </TouchableOpacity>
                            {i < TRENDING_SEARCHES.length - 1 && <View style={{ height: 0.5, backgroundColor: '#F3F4F6', marginLeft: 50 }} />}
                        </View>
                    ))}
                </View>

                {/* Trending Locations */}
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>TRENDING LOCATIONS</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10 }}>
                    {TRENDING_LOCATIONS.map((loc) => (
                        <TouchableOpacity key={loc} style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' }}>
                            <Text style={{ fontSize: 13, color: '#374151' }}>{loc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Footer logo */}
                <View style={{ alignItems: 'center', marginTop: 48, gap: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <MaterialCommunityIcons name="rhombus" size={20} color="#F97316" />
                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#374151', letterSpacing: 1 }}>SquarFT</Text>
                    </View>
                    <Text style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: 2 }}>PREMIUM REAL ESTATE ENGINE</Text>
                </View>

            </ScrollView>
        </View>
    );
}
