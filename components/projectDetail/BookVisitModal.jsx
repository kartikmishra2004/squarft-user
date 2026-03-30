import { View, Text, Image, TouchableOpacity, Modal, ScrollView } from "react-native";
import { useState } from "react";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BookVisitModal({ visible, onClose, project }) {
    const insets = useSafeAreaInsets();
    const [selected, setSelected] = useState([]);

    const toggle = (type) => {
        setSelected((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                <View className="bg-white rounded-t-3xl" style={{ maxHeight: "85%" }}>

                    {/* Handle */}
                    <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-4 mb-3" />

                    {/* Header */}
                    <View className="flex-row items-start justify-between px-5 mb-2">
                        <View className="flex-1 pr-4">
                            <Text className="text-[20px] font-bold text-gray-900">What are you looking for?</Text>
                            <Text className="text-[13px] text-gray-400 mt-0.5">Select units for your site visit</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center">
                            <Ionicons name="close" size={18} color="#374151" />
                        </TouchableOpacity>
                    </View>

                    {/* Scrollable variants — flex-1 so footer stays fixed */}
                    <ScrollView className="px-5 mt-2" showsVerticalScrollIndicator={false}>
                        {project?.variants.map((v, i) => {
                            const isSelected = selected.includes(v.type);
                            return (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => toggle(v.type)}
                                    className="flex-row items-center bg-white border border-gray-100 rounded-2xl p-3 mb-3"
                                    >
                                    <View className="w-24 h-24 rounded-xl bg-gray-100 mr-3 overflow-hidden">
                                        <Image source={project.imageMain} className="w-full h-full" resizeMode="cover" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[14px] font-manrope-bold text-gray-900 mb-0.5">{v.type}</Text>
                                        <Text className="text-[13px] font-inter-bold text-indigo-600 mb-0.5">{v.priceRange}</Text>
                                        <View className="flex-row items-center gap-1">
                                            <MaterialCommunityIcons name="floor-plan" size={11} color="#9CA3AF" />
                                            <Text className="text-[11px] text-gray-400">{project.areaSqft} SQ.FT.</Text>
                                        </View>
                                    </View>
                                    <View className={`w-6 h-6 rounded-md border-2 items-center justify-center ml-2 ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"}`}>
                                        {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                        <View className="h-2" />
                    </ScrollView>

                    {/* Fixed footer */}
                    <View className="px-5 pt-3 border-t border-gray-100" style={{ paddingBottom: insets.bottom + 2 }}>
                        <View className="flex-row items-center justify-between mb-6 mx-2">
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
                            className="bg-indigo-600 rounded-2xl py-4 items-center"
                            style={{ shadowColor: "#6C3BFF", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 8 }}
                        >
                            <Text className="text-white text-[16px] font-bold">Continue to Schedule →</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
