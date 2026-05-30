import { useRef, useCallback, useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { addSiteVisit } from "../../store/slices/propertiesSlice";
import { useRouter } from "expo-router";

export default function BookVisitModal({ visible, onClose, project }) {
    const insets = useSafeAreaInsets();
    const [selected, setSelected] = useState([]);
    const dispatch = useDispatch();
    const router = useRouter();
    const sheetRef = useRef(null);

    useEffect(() => {
        if (visible) sheetRef.current?.present();
        else sheetRef.current?.dismiss();
    }, [visible]);

    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            onPress={onClose}
        />
    ), [onClose]);

    const toggle = (type) => {
        setSelected((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const handleContinue = () => {
        if (selected.length === 0) return;
        
        // Extract property IDs from selected floor plans
        const propertyIds = (project?.floorPlans || [])
            .filter(fp => selected.includes(fp.type || fp.title))
            .map(fp => fp.id)
            .filter(Boolean); // Remove any undefined/null values
        
        console.log('📋 Selected property IDs:', propertyIds);
        
        dispatch(addSiteVisit({
            ...project,
            selectedUnits: selected,
            projectId: project.id,
            propertyIds: propertyIds, // Pass property IDs
            id: project.id + Date.now().toString(),
        }));
        onClose();
        router.push({ pathname: "/visit", params: { tab: "Book visit" } });
    };

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={1}
            snapPoints={["45%"]}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40 }}
            backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#fff' }}
        >
            {/* Header */}
            <View className="flex-row items-start justify-between px-5 mb-2 mt-1">
                <View className="flex-1 pr-4">
                    <Text className="text-[20px] font-bold text-gray-900">What are you looking for?</Text>
                    <Text className="text-[13px] text-gray-400 mt-0.5">Select units for your site visit</Text>
                </View>
                <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                    <Ionicons name="close" size={18} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Scrollable variants */}
            <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
                {(project?.variants || project?.floorPlans || []).map((v, i) => {
                    const isSelected = selected.includes(v.type || v.title);
                    return (
                        <TouchableOpacity
                            key={i}
                            onPress={() => toggle(v.type || v.title)}
                            className="flex-row items-center bg-white border border-gray-100 rounded-2xl p-3 mb-3"
                        >
                            <View className="w-24 h-24 rounded-xl bg-gray-100 mr-3 overflow-hidden">
                                <Image source={project.imageMain} className="w-full h-full" resizeMode="cover" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[14px] font-manrope-bold text-gray-900 mb-0.5">{v.type || v.title}</Text>
                                <Text className="text-[13px] font-inter-bold text-indigo-600 mb-0.5">
                                    {v.priceRange || (v.price ? `₹${(v.price/100000).toFixed(0)}L` : '—')}
                                </Text>
                                <View className="flex-row items-center gap-1">
                                    <MaterialCommunityIcons name="floor-plan" size={11} color="#9CA3AF" />
                                    <Text className="text-[11px] text-gray-400">{v.area || project.areaSqft} SQ.FT.</Text>
                                </View>
                            </View>
                            <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ml-2 ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                                {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </BottomSheetScrollView>

            {/* Fixed footer */}
            <View className="px-5 pt-3 border-t border-gray-100" style={{ paddingBottom: insets.bottom + 12 }}>
                <View className="flex-row items-center justify-between mb-4 mx-2">
                    <View className="flex-row items-center gap-2">
                        <View className="w-2 h-2 rounded-full bg-green-500" />
                        <Text className="text-[13px] text-gray-700 font-semibold">
                            {selected.length} unit{selected.length !== 1 ? "s" : ""} selected
                        </Text>
                    </View>
                    {selected.length > 0 && (
                        <TouchableOpacity onPress={() => setSelected([])}>
                            <Text className="text-[13px] font-semibold text-indigo-600">Clear Selection</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    onPress={handleContinue}
                    disabled={selected.length === 0}
                    className={`rounded-2xl py-4 items-center ${selected.length > 0 ? 'bg-indigo-600' : 'bg-gray-300'}`}
                    style={selected.length > 0 ? { shadowColor: "#6C3BFF", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 8 } : {}}
                >
                    <Text className="text-white text-[16px] font-bold">Continue</Text>
                </TouchableOpacity>
            </View>
        </BottomSheetModal>
    );
}
