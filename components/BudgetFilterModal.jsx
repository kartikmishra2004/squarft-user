import { useRef, useCallback, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import RangeSliderLib from "react-native-fast-range-slider";
import { useDispatch, useSelector } from "react-redux";
import { setBudgetRange, closeBudgetFilter } from "../store/slices/filterSlice";

const BUDGET_MIN = 2000000;
const BUDGET_MAX = 50000000;
const FACILITIES = ["Furnished", "Semi-Furnished", "Unfurnished"];

function formatBudget(val) {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(0)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
    return `₹${val}`;
}

export default function BudgetFilterModal() {
    const dispatch = useDispatch();
    const { budgetFilterOpen, budgetRange } = useSelector((s) => s.filter);
    const { width } = useWindowDimensions();
    const sheetRef = useRef(null);

    const [liveBudget, setLiveBudget] = useState(budgetRange);
    const [selectedFacilities, setSelectedFacilities] = useState([]);

    // Same pattern as FilterModal — useEffect watching Redux state
    useEffect(() => {
        if (budgetFilterOpen) sheetRef.current?.present();
        else sheetRef.current?.dismiss();
    }, [budgetFilterOpen]);

    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.4}
            onPress={() => dispatch(closeBudgetFilter())}
        />
    ), []);

    const handleClear = () => {
        setLiveBudget([BUDGET_MIN, BUDGET_MAX]);
        setSelectedFacilities([]);
        dispatch(setBudgetRange([BUDGET_MIN, BUDGET_MAX]));
    };

    const handleApply = () => {
        dispatch(setBudgetRange(liveBudget));
        dispatch(closeBudgetFilter());
    };

    const budgetLabel = `${formatBudget(liveBudget[0])} - ${formatBudget(liveBudget[1])}${liveBudget[1] >= BUDGET_MAX ? '+' : ''}`;

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={["52%"]}
            enablePanDownToClose
            onDismiss={() => dispatch(closeBudgetFilter())}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
            backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#fff' }}
        >
            <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 24 }}>
                    Select Budget Range
                </Text>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: '#374151' }}>Budget Range</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#4A43EC' }}>{budgetLabel}</Text>
                </View>

                <RangeSliderLib
                    key={`budget-${budgetRange[0]}-${budgetRange[1]}`}
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    initialMinValue={budgetRange[0]}
                    initialMaxValue={budgetRange[1]}
                    width={width - 40}
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
                    onValuesChange={(vals) => setLiveBudget([vals[0], vals[1]])}
                    onValuesChangeFinish={(vals) => setLiveBudget([vals[0], vals[1]])}
                />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, marginBottom: 24 }}>
                    <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{formatBudget(BUDGET_MIN)}</Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{formatBudget(BUDGET_MAX)}+</Text>
                </View>

                <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 14 }}>
                    Select Facilities
                </Text>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 28 }}>
                    {FACILITIES.map((f) => {
                        const active = selectedFacilities.includes(f);
                        return (
                            <TouchableOpacity
                                key={f}
                                onPress={() => setSelectedFacilities((prev) =>
                                    prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
                                )}
                                style={{
                                    borderWidth: 1.5,
                                    borderColor: active ? '#4A43EC' : '#E5E7EB',
                                    borderRadius: 10,
                                    paddingHorizontal: 14,
                                    paddingVertical: 9,
                                    backgroundColor: active ? '#EEF2FF' : '#fff',
                                }}
                            >
                                <Text style={{ fontSize: 13, color: active ? '#4A43EC' : '#374151', fontWeight: active ? '600' : '400' }}>
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        onPress={handleClear}
                        style={{ flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#4A43EC', alignItems: 'center' }}
                    >
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#4A43EC' }}>Clear All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleApply}
                        style={{ flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#4A43EC', alignItems: 'center' }}
                    >
                        <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Apply</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </BottomSheetModal>
    );
}
