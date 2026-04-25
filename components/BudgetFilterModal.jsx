import React, { useRef, useCallback, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
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

    useEffect(() => {
        if (budgetFilterOpen) sheetRef.current?.present();
        else sheetRef.current?.dismiss();
    }, [budgetFilterOpen]);

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.4}
                onPress={() => dispatch(closeBudgetFilter())}
            />
        ),
        [dispatch]
    );

    const handleClear = () => {
        setLiveBudget([BUDGET_MIN, BUDGET_MAX]);
        setSelectedFacilities([]);
        dispatch(setBudgetRange([BUDGET_MIN, BUDGET_MAX]));
    };

    const handleApply = () => {
        dispatch(setBudgetRange(liveBudget));
        dispatch(closeBudgetFilter());
    };

    const budgetLabel = `${formatBudget(liveBudget[0])} - ${formatBudget(liveBudget[1])}${
        liveBudget[1] >= BUDGET_MAX ? "+" : ""
    }`;

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={0}
            snapPoints={["50%"]} 
            enablePanDownToClose
            enableDynamicSizing={false} 
            onDismiss={() => dispatch(closeBudgetFilter())}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40 }}
            backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        >
            {/* pb-10 (padding-bottom: 40px) niche space ke liye */}
            <BottomSheetView className="px-5 pt-2 pb-10">
                
                <Text className="text-[18px] font-bold text-slate-900 mb-6">
                    Select Budget Range
                </Text>

                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-sm font-medium text-gray-600">Budget Range</Text>
                    <Text className="text-sm font-bold text-indigo-600">{budgetLabel}</Text>
                </View>

                <RangeSliderLib
                    key={`budget-${budgetRange[0]}-${budgetRange[1]}`}
                    min={BUDGET_MIN}
                    max={BUDGET_MAX}
                    initialMinValue={budgetRange[0]}
                    initialMaxValue={budgetRange[1]}
                    width={width - 50}
                    trackHeight={4}
                    thumbSize={18}
                    showThumbLines={false}
                    selectedTrackColor="#4A43EC"
                    unselectedTrackStyle={{ backgroundColor: "#E5E7EB" }}
                    thumbStyle={{
                        backgroundColor: "#4A43EC",
                        borderWidth: 2,
                        borderColor: "#fff",
                        elevation: 4,
                    }}
                    onValuesChange={(vals) => setLiveBudget([vals[0], vals[1]])}
                />

                <View className="flex-row justify-between mt-1 mb-6">
                    <Text className="text-xs text-gray-400">{formatBudget(BUDGET_MIN)}</Text>
                    <Text className="text-xs text-gray-400">{formatBudget(BUDGET_MAX)}+</Text>
                </View>

                <Text className="text-base font-bold text-slate-900 mb-3">
                    Select Facilities
                </Text>
                
                <View className="flex-row gap-2 mb-7">
                    {FACILITIES.map((f) => {
                        const active = selectedFacilities.includes(f);
                        return (
                            <TouchableOpacity
                                key={f}
                                onPress={() =>
                                    setSelectedFacilities((prev) =>
                                        prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
                                    )
                                }
                                className={`border-[1.5px] rounded-xl px-[14px] py-[9px] ${
                                    active ? "border-indigo-600 bg-indigo-50" : "border-gray-200 bg-white"
                                }`}
                            >
                                <Text className={`text-[13px] ${active ? "text-indigo-600 font-semibold" : "text-gray-700 font-normal"}`}>
                                    {f}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Bottom Buttons */}
                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={handleClear}
                        className="flex-1 py-4 rounded-2xl border-[1.5px] border-indigo-600 items-center"
                    >
                        <Text className="text-[15px] font-semibold text-indigo-600">Clear All</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        onPress={handleApply}
                        className="flex-1 py-4 rounded-2xl bg-indigo-600 items-center"
                    >
                        <Text className="text-[15px] font-semibold text-white">Apply</Text>
                    </TouchableOpacity>
                </View>

            </BottomSheetView>
        </BottomSheetModal>
    );
}