import { useRef, useState, useEffect, useCallback } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    FlatList, KeyboardAvoidingView, Platform,
} from "react-native";
import Animated, {
    useSharedValue, useAnimatedStyle,
    withTiming, Easing, FadeIn, FadeOut, Layout,
} from "react-native-reanimated";
import { Ionicons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { useDispatch } from "react-redux";
import { router } from "expo-router";
import { openFilter, setSearchQuery } from "../store/slices/filterSlice";
import { Image } from "react-native";



const SEARCH_HISTORY = [
    { id: '1', icon: 'history', title: 'Serenity Reserve', subtitle: '2 hours ago • Scheme No 140' },
    { id: '2', icon: 'location-on', title: 'Vijay Nagar', subtitle: 'Yesterday • Nipania, Indore' },
    { id: '3', icon: 'domain', title: 'Luxury Villa in Indore', subtitle: '3 days ago • Scheme No. 136' },
    { id: '4', icon: 'domain', title: 'Bangalore Tech Park 3BHK', subtitle: '1 week ago • Whitefield' },
];

const TRENDING_SEARCHES = [
    '3 BHK in Indore',
    'Penthouse with Sea View',
    'Villas in Goa',
    'Studio Apartments',
];

const TRENDING_LOCATIONS = [
    'Dubai Marina', 'London Zone 1', 'Singapore Orchard', 'Goa Beachfront',
];

const ALL_SUGGESTIONS = [
    '2 BHK in Indore', '3 BHK in Indore', 'Flat in Vijay Nagar',
    'Villa in Mumbai', 'Sea View Apartment', 'Penthouse Mumbai',
    'Luxury Villa Pune', 'Office Space Pune', 'Plot in Baner',
    'Tech Park Office Bangalore', '3BHK Whitefield', 'Studio Apartment Bangalore',
    '1 BHK South Delhi', 'Independent House Delhi', 'Builder Floor Delhi',
    'Villas in Goa', 'Beach House Goa', 'Studio Goa',
    'Dubai Marina Apartment', 'London Zone 1 Flat', 'Singapore Condo',
    'Serenity Reserve', 'Sumeru Sky Heights', 'The Grand Towers',
    'Green Valley Residency', 'Nipania Crown', 'Palasia Pinnacle',
    'Corridor Luxe', 'VN Comfort Homes', 'Casa Verde Villas', 'Rajwada Green Plots',
    'Scheme No 140 Indore', 'Bypass Road Indore', 'AB Road Indore',
    'Nipania Indore', 'Super Corridor Indore', 'Vijay Nagar Indore',
];

const iconMap = {
    history: 'history',
    'location-on': 'map-marker-outline',
    domain: 'office-building-outline',
};

const TIMING = { duration: 250, easing: Easing.out(Easing.ease) };


function HistoryIcon({ type }) {
    return (
        <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#EEF2FF', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
            <MaterialCommunityIcons name={iconMap[type] || 'office-building-outline'} size={18} color="#4A43EC" />
        </View>
    );
}

function SectionLabel({ text }) {
    return (
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, paddingHorizontal: 20, marginTop: 20, marginBottom: 10 }}>
            {text}
        </Text>
    );
}

function Divider({ left = 20 }) {
    return <View style={{ height: 0.5, backgroundColor: '#F3F4F6', marginLeft: left }} />;
}

function SearchHistoryItem({ item, index, total, onSelect }) {
    return (
        <Animated.View entering={FadeIn.delay(index * 40).duration(200)} layout={Layout.springify()}>
            <TouchableOpacity onPress={() => onSelect(item.title)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
                <HistoryIcon type={item.icon} />
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{item.title}</Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{item.subtitle}</Text>
                </View>
                <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={16} color="#9CA3AF" />
                </TouchableOpacity>
            </TouchableOpacity>
            {index < total - 1 && <Divider left={70} />}
        </Animated.View>
    );
}

function TrendingItem({ item, index, total, onSelect }) {
    return (
        <Animated.View entering={FadeIn.delay(index * 40).duration(200)} layout={Layout.springify()}>
            <TouchableOpacity onPress={() => onSelect(item)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 }}>
                <MaterialCommunityIcons name="trending-up" size={18} color="#4A43EC" />
                <Text style={{ fontSize: 14, color: '#374151' }}>{item}</Text>
            </TouchableOpacity>
            {index < total - 1 && <Divider left={50} />}
        </Animated.View>
    );
}

function SuggestionItem({ item, index, onPress }) {
    return (
        <Animated.View entering={FadeIn.delay(index * 30).duration(180)} layout={Layout.springify()}>
            <TouchableOpacity onPress={() => onPress(item)} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 13, gap: 12, backgroundColor: '#fff' }}>
                <FontAwesome name="search" size={14} color="#9CA3AF" />
                <Text style={{ flex: 1, fontSize: 14, color: '#111827' }}>{item}</Text>
                <MaterialCommunityIcons name="arrow-top-left" size={16} color="#9CA3AF" />
            </TouchableOpacity>
            <Divider left={50} />
        </Animated.View>
    );
}


function HistoryPanel({ onSelect }) {
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(10);

    useEffect(() => {
        translateY.value = withTiming(0, TIMING);
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={style}>
            <SectionLabel text="SEARCH HISTORY" />
            <View style={{ backgroundColor: '#fff' }}>
                {SEARCH_HISTORY.map((item, i) => (
                    <SearchHistoryItem key={item.id} item={item} index={i} total={SEARCH_HISTORY.length} onSelect={onSelect} />
                ))}
            </View>

            <SectionLabel text="TRENDING SEARCHES" />
            <View style={{ backgroundColor: '#fff' }}>
                {TRENDING_SEARCHES.map((item, i) => (
                    <TrendingItem key={item} item={item} index={i} total={TRENDING_SEARCHES.length} onSelect={onSelect} />
                ))}
            </View>

            <SectionLabel text="TRENDING LOCATIONS" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10 }}>
                {TRENDING_LOCATIONS.map((loc) => (
                    <TouchableOpacity key={loc} onPress={() => onSelect(loc)} style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' }}>
                        <Text style={{ fontSize: 13, color: '#374151' }}>{loc}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={{ alignItems: 'center', marginTop: 48, marginBottom: 20, gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Image
        source={require('../../squarft-user/assets/icons/squarlogo.png')} 
      />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1 }}>SquarFT</Text>
                </View>
                <Text style={{ fontSize: 10, color: '#9CA3AF', letterSpacing: 2 }}>PREMIUM REAL ESTATE ENGINE</Text>
            </View>
        </Animated.View>
    );
}

function SuggestionsPanel({ suggestions, onSelect }) {
    const opacity = useSharedValue(1);
    const translateY = useSharedValue(10);

    useEffect(() => {
        translateY.value = withTiming(0, TIMING);
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={style}>
            <SectionLabel text="SUGGESTIONS" />
            <View style={{ backgroundColor: '#fff' }}>
                {suggestions.map((item, i) => (
                    <SuggestionItem key={item} item={item} index={i} onPress={onSelect} />
                ))}
                {suggestions.length === 0 && (
                    <View style={{ paddingHorizontal: 20, paddingVertical: 24, alignItems: 'center' }}>
                        <MaterialCommunityIcons name="magnify-close" size={32} color="#D1D5DB" />
                        <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 8 }}>No results found</Text>
                    </View>
                )}
            </View>
        </Animated.View>
    );
}


export default function SearchOverlay({ value, onChangeText, onClose, insets }) {
    const dispatch = useDispatch();
    const inputRef = useRef(null);
    const debounceRef = useRef(null);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const headerOpacity = useSharedValue(1);
    const headerY = useSharedValue(-8);

    useEffect(() => {
        headerY.value = withTiming(0, { duration: 200 });
    }, []);

    const headerStyle = useAnimatedStyle(() => ({
        opacity: headerOpacity.value,
        transform: [{ translateY: headerY.value }],
    }));

    useEffect(() => {
        clearTimeout(debounceRef.current);
        if (value.trim() === '') {
            setShowSuggestions(false);
            setDebouncedQuery('');
            return;
        }
        debounceRef.current = setTimeout(() => {
            setDebouncedQuery(value.trim());
            setShowSuggestions(true);
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [value]);

    const suggestions = debouncedQuery
        ? ALL_SUGGESTIONS.filter(s => s.toLowerCase().includes(debouncedQuery.toLowerCase())).slice(0, 8)
        : [];

    const handleSelect = useCallback((text) => {
        dispatch(setSearchQuery(text));
        onChangeText(text);
        router.push('/(screens)/property-listing');
    }, []);

    return (
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#F9FAFB' }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

            <Animated.View style={[headerStyle, { paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#F9FAFB' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity onPress={onClose} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}>
                        <Ionicons name="chevron-back" size={20} color="#374151" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#111827' }}>Search Property</Text>
                </View>

                <View style={{ flexDirection: 'row', marginTop: 14, gap: 10 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 46, gap: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
                        <FontAwesome name="search" size={18} color="#4A43EC" />
                        <View style={{ width: 0.5, alignSelf: 'stretch', marginVertical: 10, backgroundColor: '#7974E7' }} />
                        <TextInput
                            ref={inputRef}
                            value={value}
                            onChangeText={onChangeText}
                            placeholder="Search..."
                            placeholderTextColor="#9CA3AF"
                            autoFocus
                            returnKeyType="search"
                            style={{ flex: 1, fontSize: 15, color: '#111827' }}
                        />
                        {value.length > 0 && (
                            <TouchableOpacity onPress={() => onChangeText('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => dispatch(openFilter())} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#4A43EC', borderRadius: 14, paddingHorizontal: 16, height: 46, gap: 6 }}>
                        <MaterialCommunityIcons name="tune-variant" size={16} color="#9DA8F0" />
                        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Filters</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            <FlatList
                data={[]}
                keyExtractor={() => 'dummy'}
                renderItem={null}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    showSuggestions
                        ? <SuggestionsPanel key="suggestions" suggestions={suggestions} onSelect={handleSelect} />
                        : <HistoryPanel key="history" onSelect={handleSelect} />
                }
            />

        </KeyboardAvoidingView>
    );
}
