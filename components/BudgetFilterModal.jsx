import { useEffect, useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RangeSliderLib from "react-native-fast-range-slider";
import { useDispatch, useSelector } from "react-redux";
import { closeBudgetFilter, setBudgetRange } from "../store/slices/filterSlice";

const BUDGET_MIN = 2000000;
const BUDGET_MAX = 50000000;

function formatBudget(val) {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(0)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
    return `₹${val}`;
}

export default function BudgetFilterModal() {
    const dispatch = useDispatch();
    const insets = useSafeAreaInsets();
    const { budgetFilterOpen, budgetRange } = useSelector((s) => s.filter);
    const { width } = useWindowDimensions();

    const [liveBudget, setLiveBudget] = useState(budgetRange);

    useEffect(() => {
        if (budgetFilterOpen) {
            setLiveBudget(budgetRange);
        }
    }, [budgetFilterOpen, budgetRange]);

    const handleClear = () => {
        setLiveBudget([BUDGET_MIN, BUDGET_MAX]);
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
        <Modal
            visible={budgetFilterOpen}
            transparent
            animationType="slide"
            statusBarTranslucent
            onRequestClose={() => dispatch(closeBudgetFilter())}
        >
            <View style={{ flex: 1, justifyContent: "flex-end" }}>
                <Pressable
                    onPress={() => dispatch(closeBudgetFilter())}
                    style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(0,0,0,0.35)" }}
                />
                <View style={{ backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 10, paddingBottom: insets.bottom + 28 }}>
                    <View style={{ alignItems: "center", marginBottom: 16 }}>
                        <View style={{ width: 40, height: 4, borderRadius: 999, backgroundColor: "#D1D5DB" }} />
                    </View>

                    <Text className="text-[18px] font-bold text-slate-900 mb-6">
                        Select Budget Range
                    </Text>

                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-sm font-medium text-gray-600">Budget Range</Text>
                        <Text className="text-sm font-bold text-indigo-600">{budgetLabel}</Text>
                    </View>

                    <RangeSliderLib
                        key={`${budgetRange[0]}-${budgetRange[1]}`}
                        min={BUDGET_MIN}
                        max={BUDGET_MAX}
                        initialMinValue={liveBudget[0]}
                        initialMaxValue={liveBudget[1]}
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
                        onValuesChange={(vals) => {
                            if (vals[0] !== liveBudget[0] || vals[1] !== liveBudget[1]) {
                                setLiveBudget([vals[0], vals[1]]);
                            }
                        }}
                    />

                    <View className="flex-row justify-between mt-1 mb-6">
                        <Text className="text-xs text-gray-400">{formatBudget(BUDGET_MIN)}</Text>
                        <Text className="text-xs text-gray-400">{formatBudget(BUDGET_MAX)}+</Text>
                    </View>

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
                </View>
            </View>
        </Modal>
    );
}
