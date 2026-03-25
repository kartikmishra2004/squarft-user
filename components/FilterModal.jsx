import { useEffect, useRef, useCallback } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, PanResponder, useWindowDimensions,
} from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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

function RangeSlider({ min, max, values, onChange }) {
    const { width } = useWindowDimensions();
    const TRACK_WIDTH = width - 64;
    const THUMB = 20;

    const toPercent = (v) => (v - min) / (max - min);
    const toValue = (pct) => Math.round(min + pct * (max - min));

    const leftPct = useRef(toPercent(values[0]));
    const rightPct = useRef(toPercent(values[1]));

    const makeResponder = useCallback((side) => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gs) => {
            const delta = gs.dx / TRACK_WIDTH;
            if (side === 'left') {
                const next = Math.max(0, Math.min(leftPct.current + delta, rightPct.current - 0.01));
                leftPct.current = next;
                onChange([toValue(next), values[1]]);
            } else {
                const next = Math.min(1, Math.max(rightPct.current + delta, leftPct.current + 0.01));
                rightPct.current = next;
                onChange([values[0], toValue(next)]);
            }
        },
    }), [values, TRACK_WIDTH]);

    const leftResponder = makeResponder('left');
    const rightResponder = makeResponder('right');

    const leftPos = toPercent(values[0]) * TRACK_WIDTH;
    const rightPos = toPercent(values[1]) * TRACK_WIDTH;

    return (
        <View style={{ height: 40, justifyContent: 'center' }}>
            <View style={{ height: 4, backgroundColor: '#E5E7EB', borderRadius: 2 }}>
                <View style={{ position: 'absolute', left: leftPos, width: rightPos - leftPos, height: 4, backgroundColor: '#4A43EC', borderRadius: 2 }} />
            </View>
            <View {...leftResponder.panHandlers} style={{ position: 'absolute', left: leftPos - THUMB / 2, width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: '#4A43EC', borderWidth: 3, borderColor: '#fff', shadowColor: '#4A43EC', shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 }} />
            <View {...rightResponder.panHandlers} style={{ position: 'absolute', left: rightPos - THUMB / 2, width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: '#4A43EC', borderWidth: 3, borderColor: '#fff', shadowColor: '#4A43EC', shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 }} />
        </View>
    );
}

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
    const { isOpen, address, tags, propertyTypes, propertySubTypes, budgetRange, areaRange, possessionStatus } = useSelector((state) => state.filter);

    const sheetRef = useRef(null);
    const snapPoints = ['92%'];

    useEffect(() => {
        if (isOpen) sheetRef.current?.present();
        else sheetRef.current?.dismiss();
    }, [isOpen]);

    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={() => dispatch(closeFilter())} />
    ), []);

    const budgetLabel = `${formatBudget(budgetRange[0])} - ${formatBudget(budgetRange[1])}${budgetRange[1] >= BUDGET_MAX ? '+' : ''}`;
    const areaLabel = `${areaRange[0]} - ${areaRange[1]}${areaRange[1] >= AREA_MAX ? '+' : ''}`;

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose
            onDismiss={() => dispatch(closeFilter())}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
            backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#fff' }}
        >
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14 }}>
                <TouchableOpacity onPress={() => dispatch(closeFilter())}>
                    <Ionicons name="close" size={22} color="#374151" />
                </TouchableOpacity>
                <Text style={{ fontSize: 17, fontWeight: '600', color: '#111827' }}>Filters</Text>
                <View style={{ width: 22 }} />
            </View>

            <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>

                {/* Address */}
                <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 12 }}>
                    <TextInput value={address} onChangeText={(v) => dispatch(setAddress(v))} placeholder="Address & Landmark" placeholderTextColor="#9CA3AF" style={{ flex: 1, fontSize: 14, color: '#111827' }} />
                    <MaterialCommunityIcons name="crosshairs-gps" size={20} color="#4A43EC" />
                </View>

                {/* Tags */}
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>Budget Range</Text>
                    <Text style={{ fontSize: 13, color: '#4A43EC', fontWeight: '500' }}>{budgetLabel}</Text>
                </View>
                <RangeSlider min={BUDGET_MIN} max={BUDGET_MAX} values={budgetRange} onChange={(v) => dispatch(setBudgetRange(v))} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 16 }}>
                    {['20L', '1Cr', '2Cr', '3Cr', '5Cr+'].map((l) => <Text key={l} style={{ fontSize: 11, color: '#9CA3AF' }}>{l}</Text>)}
                </View>

                {/* Area Range */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>Build-up Area in sq.ft.</Text>
                    <Text style={{ fontSize: 13, color: '#4A43EC', fontWeight: '500' }}>{areaLabel}</Text>
                </View>
                <RangeSlider min={AREA_MIN} max={AREA_MAX} values={areaRange} onChange={(v) => dispatch(setAreaRange(v))} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 16 }}>
                    {['0', '1667', '3333', '5000+'].map((l) => <Text key={l} style={{ fontSize: 11, color: '#9CA3AF' }}>{l}</Text>)}
                </View>

                {/* Possession Status */}
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 10 }}>Possession Status</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {POSSESSION.map((p) => <CheckBox key={p} label={p} checked={possessionStatus.includes(p)} onPress={() => dispatch(togglePossession(p))} />)}
                </View>

            </BottomSheetScrollView>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                <TouchableOpacity onPress={() => dispatch(clearFilters())}>
                    <Text style={{ fontSize: 15, color: '#374151', textDecorationLine: 'underline' }}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => dispatch(closeFilter())} style={{ backgroundColor: '#4A43EC', borderRadius: 12, paddingHorizontal: 28, paddingVertical: 12 }}>
                    <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>Apply Filters</Text>
                </TouchableOpacity>
            </View>
        </BottomSheetModal>
    );
}
