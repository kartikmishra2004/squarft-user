import { useEffect, useRef, useCallback, useState } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { fetchBuilderDetailsThunk, clearBuilder } from "../../store/slices/builderSlice";
import { fetchProjectListThunk } from "../../store/slices/projectSlice";
import { allProjects } from "../../data/projects";
import DetailFooter from "./DetailFooter";

const POSSESSION_FILTERS = ["All", "In 3 yrs", "Ready To Move", "Under Construction"];

const getPossessionKey = (value) => {
    const normalized = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, "_");

    if (normalized.includes("ready")) return "ready_to_move";
    if (normalized.includes("in_3") || normalized.includes("3_year")) return "in_3_years";
    if (normalized.includes("under") || normalized.includes("construction") || normalized.includes("upcoming")) {
        return "under_construction";
    }

    return normalized;
};

const formatPossessionLabel = (value) => {
    const key = getPossessionKey(value);
    if (key === "ready_to_move") return "Ready to Move";
    if (key === "in_3_years") return "In 3 yrs";
    if (key === "under_construction") return "Under Construction";
    return value || "Project";
};

const FILTER_MAP = {
    "All": () => true,
    "In 3 yrs": (p) => getPossessionKey(p.possessionStatus) === "in_3_years",
    "Ready To Move": (p) => getPossessionKey(p.possessionStatus) === "ready_to_move",
    "Under Construction": (p) => getPossessionKey(p.possessionStatus) === "under_construction",
};

export default function BuilderModal({ visible, onClose, project }) {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const [activeFilter, setActiveFilter] = useState("All");
    const sheetRef = useRef(null);
    const snapPoints = ['55%'];
    
    const { currentBuilder, builderProjects: apiProjects, loading } = useSelector((state) => state.builder);
    const { list: projectList } = useSelector((state) => state.project);

    // Fetch builder details when modal opens
    useEffect(() => {
        if (visible && project?.developerId) {
            console.log('🏗️ Fetching builder details for ID:', project.developerId);
            dispatch(fetchBuilderDetailsThunk(project.developerId));
            if (!projectList?.length) {
                dispatch(fetchProjectListThunk());
            }
        } else if (visible && !project?.developerId) {
            console.log('⚠️ No developerId available for project:', project?.name);
            console.log('⚠️ Project data:', { 
                id: project?.id, 
                builder: project?.builder,
                developerId: project?.developerId 
            });
        }
    }, [visible, project?.developerId, projectList?.length, dispatch]);

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
    const organizationProjects = (projectList || []).filter((p) => {
        const organizationId = p.organisation_id || p.organization_id || p.organisationId || p.organizationId;
        return organizationId && project?.developerId && String(organizationId) === String(project.developerId);
    });
    
    // Use API projects if available, otherwise fallback to local data
    let builderProjects = [];
    if (apiProjects && apiProjects.length > 0) {
        // Map API projects to match the expected format
        builderProjects = apiProjects.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            location: p.location || [p.area, p.city].filter(Boolean).join(", "),
            imageMain: p.cover_image_url ? { uri: p.cover_image_url } : project?.imageMain,
            possessionStatus: p.possession_status || p.possessionStatus || p.possession,
            price_from: p.price_from,
            price_to: p.price_to,
            rera: Boolean(p.rera_approved),
        }));
    } else if (organizationProjects.length > 0) {
        builderProjects = organizationProjects.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            location: p.location || [p.area, p.city].filter(Boolean).join(", "),
            imageMain: p.cover_image_url ? { uri: p.cover_image_url } : project?.imageMain,
            possessionStatus: p.possession_status || p.possessionStatus || p.possession,
            price_from: p.price_from,
            price_to: p.price_to,
            rera: Boolean(p.rera_approved),
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
                        filteredProjects.map((p) => {
                            const priceText = p.variants?.[0]?.priceRange
                                ?? p.avgPricePerSqft
                                ?? (p.price_from ? `\u20B9${(Number(p.price_from) / 100000).toFixed(0)}L` : "\u2014");
                            const metaText = p.subTypes?.length
                                ? `${p.subTypes.join(", ")} BHK ${p.propertyType || ""}`.trim()
                                : formatPossessionLabel(p.possessionStatus);
                            return (
                            <View
                                key={p.id}
                                className="flex-row items-center bg-white border border-gray-100 rounded-2xl p-3 mb-3"
                                style={{ shadowColor: "#6B7280", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 }}
                            >
                                <View className="w-[116px] h-[116px] rounded-xl bg-gray-100 mr-5 overflow-hidden">
                                    {p.imageMain ? (
                                        <Image source={p.imageMain} className="w-full h-full" resizeMode="cover" />
                                    ) : (
                                        <View className="w-full h-full bg-gray-100" />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[16px] font-bold text-gray-900 mb-0.5">
                                        {priceText}
                                    </Text>
                                    <Text className="text-[14px] font-bold text-gray-800 mb-0.5">{p.name}</Text>
                                    <Text className="text-[12px] text-gray-400">{metaText}</Text>
                                    <Text className="text-[11px] text-gray-400 mb-3">{p.location}</Text>
                                    {p.rera && (
                                        <View className="self-start bg-green-100 rounded-md px-2 py-0.5">
                                            <Text className="text-[10px] font-bold text-green-600">RERA</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );})
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
