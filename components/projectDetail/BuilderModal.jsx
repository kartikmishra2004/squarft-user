import { useEffect, useRef, useCallback, useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchBuilderDetailsThunk, clearBuilder } from "../../store/slices/builderSlice";
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
    const dispatch = useDispatch();
    const [activeFilter, setActiveFilter] = useState("In 3 years");
    const sheetRef = useRef(null);
    const snapPoints = ['55%'];
    
    const { currentBuilder, builderProjects: apiProjects, loading } = useSelector((state) => state.builder);
    const { isLoggedIn, token } = useSelector((state) => state.auth);

    // Fetch builder details when modal opens
    useEffect(() => {
        if (visible && project?.developerId) {
            console.log('🏗️ Fetching builder details for ID:', project.developerId);
            dispatch(fetchBuilderDetailsThunk(project.developerId));
        } else if (visible && !project?.developerId) {
            console.log('⚠️ No developerId available for project:', project?.name);
            console.log('⚠️ Project data:', { 
                id: project?.id, 
                builder: project?.builder,
                developerId: project?.developerId 
            });
        }
    }, [visible, project?.developerId]);

    // Clear builder data when modal closes
    useEffect(() => {
        if (!visible) {
            dispatch(clearBuilder());
        }
    }, [visible]);

    useEffect(() => {
        if (visible && project) sheetRef.current?.present();
        else sheetRef.current?.dismiss();
    }, [visible, project]);

    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} onPress={onClose} />
    ), [onClose]);

    const builderName = currentBuilder?.name || project?.builder || "";
    
    // Use API projects if available, otherwise fallback to local data
    let builderProjects = [];
    if (apiProjects && apiProjects.length > 0) {
        // Map API projects to match the expected format
        builderProjects = apiProjects.map(p => ({
            id: p.id,
            name: p.name,
            // Add other fields as needed from your local projects structure
            // For now, we'll just show basic info
        }));
    } else {
        // Fallback to local data
        const normalizeBuilder = (name) => name?.toLowerCase().trim() || "";
        builderProjects = allProjects.filter((p) => {
            const projectBuilder = normalizeBuilder(p.builder);
            const currentBuilderName = normalizeBuilder(builderName);
            return projectBuilder.includes(currentBuilderName) || currentBuilderName.includes(projectBuilder);
        });
    }
    
    const filteredProjects = builderProjects.filter(FILTER_MAP[activeFilter] ?? (() => true));

    if (!project) return null;

    return (
        <BottomSheetModal
            ref={sheetRef}
            index={1}
            snapPoints={snapPoints}
            enablePanDownToClose
            onDismiss={onClose}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={{ backgroundColor: '#D1D5DB', width: 40, marginTop: 10 }}
            backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: '#fff' }}
        >
       
            <View style={{ height: 16 }} />

          
            <BottomSheetScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row items-start justify-between px-5 mb-3">
                    <View className="flex-1 pr-4 ">
                        <Text className="text-[17px] mb-2 pr-6 font-manrope-semibold text-gray-900 leading-7">{builderName}</Text>
                        <View className="flex-row items-center gap-3 mt-2">
                            <View className="bg-gray-100 px-3 py-1 rounded-lg">
                                <Text className="text-[12px] font-manrope-regular text-gray-500">{project?.builderCity}</Text>
                            </View>
                            <Text className="text-[12px] font-manrope-regular text-gray-400">
                                {loading ? '...' : `${builderProjects.length} Total Projects`}
                            </Text>
                        </View>
                    </View>
                    <View className="w-16 h-16 rounded-xl overflow-hidden bg-gray-900">
                        <Image source={project?.builderLogo} className="w-full h-full" resizeMode="cover" />
                    </View>
                </View>
                
                {/* Possession filter */}
                <Text className="text-[15px] mt-1 font-manrope-semibold text-gray-900 px-5 mb-4">Possession</Text>
                
                {/* Embedded inner horizontal listings are safely retained inside the parent wrapper container */}
                <BottomSheetScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10, paddingBottom: 6 }}>
                    {POSSESSION_FILTERS.map((f) => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setActiveFilter(f)}
                            className={`px-4 py-2.5 rounded-xl border items-center ${activeFilter === f ? "bg-[#F8F5FF] border-[#DCD0FF]" : "bg-white border-gray-200"}`}
                        >
                            <Text className={`text-[13px] font-manrope-semibold ${activeFilter === f ? "text-[#4A43EC]" : "text-gray-500"}`}>{f}</Text>
                        </TouchableOpacity>
                    ))}
                </BottomSheetScrollView>

                {/* Projects list */}
                <View className="px-5 mt-4 mb-4">
                    {loading ? (
                        <View className="items-center py-10">
                            <ActivityIndicator size="large" color="#4A43EC" />
                            <Text className="text-[14px] font-manrope-semibold text-gray-400 mt-3">Loading projects...</Text>
                        </View>
                    ) : filteredProjects.length === 0 ? (
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
                                        {p.variants?.[0]?.priceRange ?? p.avgPricePerSqft ?? '—'}
                                    </Text>
                                    <Text className="text-[14px] font-bold text-gray-800 mb-0.5">{p.name}</Text>
                                    <Text className="text-[12px] text-gray-400">{p.subTypes?.join(", ")} BHK {p.propertyType}</Text>
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
            </BottomSheetScrollView>

            {/* Footer attached persistently to lower window terminal zones outside scrolling canvas layout constraints */}
            <View className="px-5 pt-3 border-t border-gray-100" style={{ paddingBottom: insets.bottom || 14, backgroundColor: '#fff' }}>
                <DetailFooter />
            </View>
        </BottomSheetModal>
    );
}