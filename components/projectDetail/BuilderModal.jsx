import { View, Text, Image, TouchableOpacity, Modal, ScrollView } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { allProjects } from "../../data/projects";
import DetailFooter from "./DetailFooter";

const POSSESSION_FILTERS = ["In 3 years", "Ready To Move", "Under Construction"];

const FILTER_MAP = {
    "In 3 years": (p) => p.possessionStatus === "Under Construction",
    "Ready To Move": (p) => p.possessionStatus === "Ready to Move",
    "Under Construction": (p) => p.possessionStatus === "Under Construction",
};

export default function BuilderModal({ visible, onClose, project }) {
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState("In 3 years");

    // Get builder name and normalize it for comparison
    const builderName = project?.builder || "";
    const normalizeBuilder = (name) => name?.toLowerCase().trim() || "";
    
    // Filter projects by builder (case-insensitive partial match)
    const builderProjects = allProjects.filter((p) => {
        const projectBuilder = normalizeBuilder(p.builder);
        const currentBuilder = normalizeBuilder(builderName);
        return projectBuilder.includes(currentBuilder) || currentBuilder.includes(projectBuilder);
    });
    
    const filteredProjects = builderProjects.filter(FILTER_MAP[activeFilter] ?? (() => true));

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose} />
                <View className="bg-white rounded-t-3xl" style={{ maxHeight: "90%" }}>                    
                    {/* Handle */}
                    <View className="w-10 h-1 bg-gray-300 rounded-full self-center mt-4 mb-6" />
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View className="flex-row items-start justify-between px-5 mb-3">
                            <View className="flex-1 pr-4 ">
                                <Text className="text-[17px] mb-2 pr-6 font-manrope-semibold text-gray-900 leading-7">{project?.builder}</Text>
                                <View className="flex-row items-center gap-3 mt-2">
                                    <View className="bg-gray-100 px-3 py-1 rounded-lg">
                                        <Text className="text-[12px] font-manrope-regular text-gray-500">{project?.builderCity}</Text>
                                    </View>
                                    <Text className="text-[12px] font-manrope-regular text-gray-400">{builderProjects.length} Total Projects</Text>
                                </View>
                            </View>
                            <View className="w-16 h-16 rounded-xl overflow-hidden bg-gray-900">
                                <Image source={project?.builderLogo} className="w-full h-full" resizeMode="cover" />
                            </View>
                        </View>
                        
                        {/* Possession filter */}
                        <Text className="text-[15px] mt-1 font-manrope-semibold text-gray-900 px-5 mb-4">Possession</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 6 }}>
                            {POSSESSION_FILTERS.map((f) => (
                                <TouchableOpacity
                                    key={f}
                                    onPress={() => setActiveFilter(f)}
                                    className={`px-4 py-2.5 rounded-xl border items-center ${activeFilter === f ? "bg-[#F8F5FF] border-[#DCD0FF]" : "bg-white border-gray-200"}`}
                                >
                                    <Text className={`text-[13px] font-manrope-semibold ${activeFilter === f ? "text-[#4A43EC]" : "text-gray-500"}`}>{f}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Projects list */}
                        <View className="px-5 mt-4 mb-4">
                            {filteredProjects.length === 0 ? (
                                <View className="items-center py-10">
                                    
                                    <Text className="text-[14px] font-manrope-semibold text-gray-400 mt-3">No projects found</Text>
                                    <Text className="text-[12px] text-gray-300 mt-1">No {activeFilter} projects by this builder</Text>
                                </View>
                            ) : (
                                filteredProjects.map((p) => (
                                    <View
                                        key={p.id}
                                        className="flex-row items-center bg-white border border-gray-100 rounded-2xl p-3 mb-3"
                                        style={{ shadowColor: "#6B7280", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                                    >
                                        <View className="w-[116px] h-[116px] rounded-xl bg-gray-100 mr-5 overflow-hidden">
                                            <Image source={p.imageMain} className="w-full h-full" resizeMode="cover" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-[16px] font-bold text-gray-900 mb-0.5">
                                                {p.variants[0]?.priceRange ?? p.avgPricePerSqft}
                                            </Text>
                                            <Text className="text-[14px] font-bold text-gray-800 mb-0.5">{p.name}</Text>
                                            <Text className="text-[12px] text-gray-400">{p.subTypes.join(", ")} BHK {p.propertyType}</Text>
                                            <Text className="text-[11px] text-gray-400 mb-3">{p.location}</Text>
                                            {p.rera && (
                                                <View className="self-start bg-green-100 rounded-md px-2 py-0.5">
                                                    <Text className="text-[10px] font-bold text-green-600">RERA</Text>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View className="px-5 pt-3 border-t border-gray-100" style={{ paddingBottom: insets.bottom  }}>
                        <DetailFooter />
                    </View>
                </View>
            </View>
        </Modal>
    );
}
