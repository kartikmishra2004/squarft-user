import { memo, useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View, Text, TextInput, TouchableOpacity,
    useWindowDimensions,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import RangeSliderLib from "react-native-fast-range-slider";
import {
    closeFilter, setAddress, removeTag,
    togglePropertyType, toggleSubType,
    setBudgetRange, setAreaRange,
    togglePossession, clearFilters,
} from "../store/slices/filterSlice";

const PROPERTY_TYPES = ['Flat/Apartment', 'House/Villa', 'Plot', 'Commercial'];
const SUB_TYPES = ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '5+ BHK'];
const POSSESSION = ['Ready to Move', 'Under Construction'];

const BUDGET_MIN = 2000000;
const BUDGET_MAX = 50000000;
const AREA_MIN = 0;
const AREA_MAX = 5000;

function formatBudget(val) {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(0)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
    return `₹${val}`;
}

function RangeSlider({ min, max, values, onChange, onLiveChange }) {
    const { width } = useWindowDimensions();
    return (
        <RangeSliderLib
            key={`${values[0]}-${values[1]}`}
            min={min}
            max={max}
            initialMinValue={values[0]}
            initialMaxValue={values[1]}
            width={width - 64}
            trackHeight={4}
            thumbSize={24}
            showThumbLines={false}
            selectedTrackColor="#4A43EC"
            unselectedTrackStyle={{ backgroundColor: '#E5E7EB' }}
            thumbStyle={{
                backgroundColor: '#4A43EC',
                borderWidth: 3,
                borderColor: '#fff',
                shadowColor: '#4A43EC',
                shadowOpacity: 0.4,
                shadowRadius: 4,
                elevation: 4,
            }}
            onValuesChange={(vals) => onLiveChange?.([vals[0], vals[1]])}
            onValuesChangeFinish={(vals) => onChange([vals[0], vals[1]])}
        />
    );
}

const BudgetRangeSection = memo(function BudgetRangeSection({ budgetRange, onChange }) {
    const [liveBudget, setLiveBudget] = useState(budgetRange);

    useEffect(() => {
        setLiveBudget(budgetRange);
    }, [budgetRange]);

    const budgetLabel = `${formatBudget(liveBudget[0])} - ${formatBudget(liveBudget[1])}${liveBudget[1] >= BUDGET_MAX ? '+' : ''}`;

    return (
        <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>Budget Range</Text>
                <Text style={{ fontSize: 13, color: '#4A43EC', fontWeight: '500' }}>{budgetLabel}</Text>
            </View>
            <RangeSlider min={BUDGET_MIN} max={BUDGET_MAX} values={budgetRange} onChange={onChange} onLiveChange={setLiveBudget} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 16 }}>
                {['20L', '1Cr', '2Cr', '3Cr', '5Cr+'].map((l) => <Text key={l} style={{ fontSize: 11, color: '#9CA3AF' }}>{l}</Text>)}
            </View>
        </>
    );
});

const AreaRangeSection = memo(function AreaRangeSection({ areaRange, onChange }) {
    const [liveArea, setLiveArea] = useState(areaRange);

    useEffect(() => {
        setLiveArea(areaRange);
    }, [areaRange]);

    const areaLabel = `${liveArea[0]} - ${liveArea[1]}${liveArea[1] >= AREA_MAX ? '+' : ''}`;

    return (
        <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>Build-up Area in sq.ft.</Text>
                <Text style={{ fontSize: 13, color: '#4A43EC', fontWeight: '500' }}>{areaLabel}</Text>
            </View>
            <RangeSlider min={AREA_MIN} max={AREA_MAX} values={areaRange} onChange={onChange} onLiveChange={setLiveArea} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 16 }}>
                {['0', '1667', '3333', '5000+'].map((l) => <Text key={l} style={{ fontSize: 11, color: '#9CA3AF' }}>{l}</Text>)}
            </View>
        </>
    );
});

function ChipButton({ label, selected, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} style={{ borderWidth: 1, borderColor: selected ? '#4A43EC' : '#E5E7EB', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8, backgroundColor: '#fff' }}>
            <Text style={{ color: selected ? '#4A43EC' : '#374151', fontSize: 13, fontWeight: selected ? '600' : '400' }}>{label}</Text>
        </TouchableOpacity>
    );
}

function CheckBox({ label, checked, onPress }) {
    return (
        <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginRight: 10, marginBottom: 8, width: 140 }}>
            <View style={{ width: 18, height: 18, borderRadius: 3, borderWidth: 1.5, borderColor: checked ? '#4A43EC' : '#9CA3AF', backgroundColor: checked ? '#4A43EC' : '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
                {checked && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={{ fontSize: 13, color: '#374151', flexShrink: 1 }}>{label}</Text>
        </TouchableOpacity>
    );
}

export default function FilterModal() {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { isOpen, address, locationCoordinates, tags, propertyTypes, propertySubTypes, budgetRange, areaRange, possessionStatus } = useSelector((state) => state.filter);
    const [localAddress, setLocalAddress] = useState(address);
    const sheetProgress = useRef(new Animated.Value(1)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const animateOpen = () => {
        Animated.sequence([
            Animated.timing(sheetProgress, {
                toValue: 0,
                duration: 460,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 160,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
            }),
        ]).start();
    };

    useEffect(() => {
        if (!isOpen) {
            sheetProgress.stopAnimation();
            backdropOpacity.stopAnimation();
            sheetProgress.setValue(1);
            backdropOpacity.setValue(0);
            return;
        }
        setLocalAddress(address);
    }, [address, backdropOpacity, isOpen, sheetProgress]);

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="none"
            statusBarTranslucent
            onShow={animateOpen}
            onRequestClose={() => dispatch(closeFilter())}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1, justifyContent: "flex-end" }}
            >
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: backdropOpacity, backgroundColor: "rgba(0,0,0,0.35)" }]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => dispatch(closeFilter())} />
                </Animated.View>
                <Animated.View style={{ maxHeight: "92%", backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden", transform: [{ translateY: sheetProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 700] }) }] }}>
                    <View style={{ alignItems: "center", paddingTop: 8 }}>
                        <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: "#D1D5DB" }} />
                    </View>

                    {/* Header */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 }}>
                        <TouchableOpacity onPress={() => dispatch(closeFilter())}>
                            <Ionicons name="close" size={22} color="#374151" />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 17, fontWeight: '600', color: '#111827' }}>Filters</Text>
                        <View style={{ width: 22 }} />
                    </View>

                    <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }} showsVerticalScrollIndicator={false}>

                        {/* Address */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 12 }}>
                            <TextInput value={localAddress} onChangeText={setLocalAddress} placeholder="Address & Landmark" placeholderTextColor="#9CA3AF" style={{ flex: 1, fontSize: 14, color: '#111827' }} />
                            <TouchableOpacity
                                onPress={() => {
                                    dispatch(setAddress(localAddress));
                                    dispatch(closeFilter());
                                    router.push('/(screens)/location-picker');
                                }}
                                accessibilityRole="button"
                                accessibilityLabel="Choose location on map"
                                hitSlop={10}
                                style={{ padding: 6 }}
                            >
                                <MaterialCommunityIcons name="map-marker-radius-outline" size={22} color="#4A43EC" />
                            </TouchableOpacity>
                        </View>

                        {tags.length > 0 && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 }}>
                                {tags.map((tag) => (
                                    <View key={tag} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#EEF2FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8 }}>
                                        <Text style={{ fontSize: 13, color: '#4A43EC', marginRight: 6 }}>{tag}</Text>
                                        <TouchableOpacity onPress={() => dispatch(removeTag(tag))}>
                                            <Ionicons name="close" size={14} color="#4A43EC" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Property Type */}
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 10 }}>Property Type</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                            {PROPERTY_TYPES.map((t) => <ChipButton key={t} label={t} selected={propertyTypes.includes(t)} onPress={() => dispatch(togglePropertyType(t))} />)}
                        </View>

                        {/* Sub Type */}
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 8, marginBottom: 10 }}>Property Sub Type</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
                            {SUB_TYPES.map((t) => <ChipButton key={t} label={t} selected={propertySubTypes.includes(t)} onPress={() => dispatch(toggleSubType(t))} />)}
                        </View>

                        {/* Budget Range */}
                        <BudgetRangeSection budgetRange={budgetRange} onChange={(v) => dispatch(setBudgetRange(v))} />

                        {/* Area Range */}
                        <AreaRangeSection areaRange={areaRange} onChange={(v) => dispatch(setAreaRange(v))} />

                        {/* Possession Status */}
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 10 }}>Possession Status</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                            {POSSESSION.map((p) => <CheckBox key={p} label={p} checked={possessionStatus.includes(p)} onPress={() => dispatch(togglePossession(p))} />)}
                        </View>

                    </ScrollView>

                    {/* bottom area */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                        paddingTop: 14,
                        paddingBottom: insets.bottom + 14,
                        borderTopWidth: 1,
                        borderTopColor: '#F3F4F6',
                        backgroundColor: '#fff',
                    }}>
                        <TouchableOpacity onPress={() => { dispatch(clearFilters()); setLocalAddress(''); }}>
                            <Text style={{ fontSize: 15, color: '#374151', textDecorationLine: 'underline' }}>Clear All</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                dispatch(setAddress(localAddress));
                                dispatch(closeFilter());
                                if (locationCoordinates) {
                                    router.push({
                                        pathname: '/(screens)/property-listing',
                                        params: {
                                            nearby: '1',
                                            latitude: String(locationCoordinates.latitude),
                                            longitude: String(locationCoordinates.longitude),
                                            locationName: localAddress,
                                        },
                                    });
                                } else {
                                    router.push('/(screens)/property-listing');
                                }
                            }}
                            style={{ backgroundColor: '#4A43EC', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 }}>
                            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Apply Filters</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
