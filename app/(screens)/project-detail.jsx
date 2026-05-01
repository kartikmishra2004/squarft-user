import {
  View,
  Text,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavourite, savePropertyThunk, unsavePropertyThunk } from "../../store/slices/propertiesSlice";
import { fetchProjectDetailsThunk, fetchFloorPlansThunk, fetchResaleThunk, fetchLandmarksThunk, fetchAmenitiesThunk, fetchSimilarPropertiesThunk, clearProject } from "../../store/slices/projectSlice";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { allProjects } from "../../data/projects";
import Overview from "../../components/projectDetail/Overview";
import Highlights from "../../components/projectDetail/Highlights";
import PropertyTour from "../../components/projectDetail/PropertyTour";
import BookVisitModal from "../../components/projectDetail/BookVisitModal";
import DetailFooter from "../../components/projectDetail/DetailFooter";

const frame260 = require("../../assets/images/Frame 26086854.png");
const frame871 = require("../../assets/images/Frame 26086871.png");
const group1597 = require("../../assets/images/Group 1597884495.png");

const { width } = Dimensions.get("window");

export default function ProjectDetail() {
  const insets = useSafeAreaInsets();
  const { id, slug, from } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("Overview");
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const dispatch = useDispatch();
  const savedProjects = useSelector((s) => s.properties.favouriteProjects);
  const { details: apiProject, floorPlans, resale, landmarks, amenities, similarProperties, loading: apiLoading } = useSelector((s) => s.project);
  const { list: projectList } = useSelector((s) => s.project);
  const { isLoggedIn, token } = useSelector((s) => s.auth);

  // Debug: Log auth state
  useEffect(() => {
    console.log('🔐 Auth State:', { isLoggedIn, hasToken: !!token });
  }, [isLoggedIn, token]);

  // Find project from API list or local fallback
  const listProject = projectList.find((p) => p.id === id) || allProjects.find((p) => p.id === id);
  const isSaved = savedProjects.includes(id);

  // Use slug from params or from list project
  const projectSlug = slug || listProject?.slug;

  // Get property IDs from floor plans (for saving to API)
  const propertyIds = floorPlans?.floor_plans?.map(fp => fp.id).filter(Boolean) || [];
  
  const handleToggleSave = async () => {
    console.log('🔖 Toggle Save Clicked');
    console.log('📊 Current State:', {
      projectId: id,
      projectSlug,
      isSaved,
      floorPlansLoaded: !!floorPlans,
      floorPlansCount: floorPlans?.floor_plans?.length || 0,
      propertyIds,
    });
    
    // Toggle local state immediately
    dispatch(toggleFavourite(id));
    
    // If we have property IDs, save/unsave them via API
    if (propertyIds.length > 0) {
      if (isSaved) {
        console.log('🗑️ Unsaving properties:', propertyIds);
        // Unsave all properties in this project
        for (const propId of propertyIds) {
          await dispatch(unsavePropertyThunk(propId));
        }
      } else {
        console.log('💾 Saving properties:', propertyIds);
        // Save all properties in this project
        for (const propId of propertyIds) {
          await dispatch(savePropertyThunk(propId));
        }
      }
      console.log('✅ Save/Unsave operations completed');
    } else {
      console.log('⚠️ No property IDs available yet');
      console.log('⚠️ Floor plans data:', floorPlans);
      console.log('⚠️ Only saving locally, will sync when floor plans load');
    }
  };

  useEffect(() => {
    if (projectSlug && projectSlug !== 'none') {
      dispatch(fetchProjectDetailsThunk(projectSlug));
      dispatch(fetchFloorPlansThunk(projectSlug));
      dispatch(fetchResaleThunk(projectSlug));
      dispatch(fetchLandmarksThunk(projectSlug));
      dispatch(fetchAmenitiesThunk(projectSlug));
      dispatch(fetchSimilarPropertiesThunk(projectSlug));
    }
    return () => dispatch(clearProject());
  }, [id, projectSlug]);

  // Auto-sync saved state when floor plans load
  useEffect(() => {
    if (isSaved && propertyIds.length > 0 && isLoggedIn && token) {
      console.log('🔄 Floor plans loaded for saved project, syncing to API...');
      propertyIds.forEach(propId => {
        dispatch(savePropertyThunk(propId));
      });
    }
  }, [propertyIds.length, isSaved, isLoggedIn, token]);

  if (!listProject && !apiProject) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400">Project not found</Text>
      </View>
    );
  }

  // Merge API data with list/local fallback
  const base = listProject || {};
  const project = {
    ...base,
    ...(apiProject ? {
      name: apiProject.name || base.name,
      location: apiProject.location || base.location,
      description: apiProject.description || base.description,
      reraId: apiProject.rera_id || base.reraId,
      possession: apiProject.possession || base.possession,
      builder: apiProject.developer?.name || base.builder,
      
      units: (apiProject.stats?.units && apiProject.stats.units !== "N/A") ? apiProject.stats.units : base.units,
      launchedIn: (apiProject.stats?.launched && apiProject.stats.launched !== "N/A") ? apiProject.stats.launched : base.launchedIn,
      rating: apiProject.rating || base.rating,

      subTypes: base.subTypes,
      propertyType: base.propertyType,
      avgPricePerSqft: base.avgPricePerSqft,
      possessionStatus: base.possessionStatus,
      rera: base.rera,
      variants: base.variants,
    } : {
      name: base.name,
      location: base.location || (base.area && base.city ? `${base.area}, ${base.city}` : ''),
      possession: base.possession_date || base.possession,
      units: base.units,
      launchedIn: base.launchedIn,
      rating: base.rating,
    }),
    floorPlans: floorPlans?.floor_plans || base.variants,
    resaleProperties: resale,
    landmarks: landmarks,
    amenities: amenities,
    similarProperties: similarProperties,
  };

  const bhkConfig = floorPlans?.summary?.configs || project.subTypes?.join(", ");
  const startingPrice =
    floorPlans?.summary?.starting_from
      ? `₹${(floorPlans.summary.starting_from / 100000).toFixed(0)}L`
      : project.variants?.[0]?.priceRange?.split("–")[0]?.trim() ?? project.avgPricePerSqft;

  return (
    <View className="flex-1 bg-[#F8F5FF]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Hero Image */}
        <View style={{ width, height: 380 }}>
          <Image
            source={project.imageMain}
            className="w-full h-full"
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-4 w-[38px] h-[38px] rounded-full bg-white/85 items-center justify-center"
            style={{ top: insets.top + 10 }}
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleToggleSave}
            className="absolute right-4 w-[38px] h-[38px] rounded-full bg-white/85 items-center justify-center"
            style={{ top: insets.top + 10 }}
          >
            <MaterialCommunityIcons
              name={isSaved ? "bookmark-plus" : "bookmark-plus-outline"}
              size={20}
              color={isSaved ? "#0c0c0cff" : "#111827"}
            />
          </TouchableOpacity>
        </View>

        {/* Main Card */}
        <View
          className="-mt-24 mx-4 bg-white rounded-xl p-3 px-5 mb-3"
          style={{
            shadowColor: "#6B7280",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.04,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <Text className="text-[16px] font-manrope-extrabold text-gray-900 mb-2">
            {project.name}
          </Text>

          <View className="flex-row items-start gap-3 mb-3.5">
            {/* Left: Rating block */}
            <View className="border border-gray-200 rounded-xl p-3 mt-5 pl-2 pr-4">
              <ImageBackground
                source={frame260}
                style={{
                  position: "absolute",
                  top: -14,
                  left: 2,
                  width: 80,
                  height: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  paddingLeft: 30,
                }}
                imageStyle={{ borderRadius: 8 }}
                resizeMode="stretch"
              >
                <Text
                  style={{ fontSize: 14, fontWeight: "800", color: "#4A43EC" }}
                >
                  {project.rating}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color: "#4A43EC",
                    fontWeight: "600",
                    marginTop: 4,
                  }}
                >
                  {" "}
                  /10
                </Text>
              </ImageBackground>
              <Text className="text-[12px] text-indigo-600 font-manrope-bold mt-1">
                Possession by
              </Text>
              <View className="flex-row items-center space-x-1 mt-0.5">
                <Text className="text-[10px] font-manrope-medium text-[#858585]">
                  {project.possession}
                </Text>
                <Ionicons name="chevron-forward" size={13} color="#858585" />
              </View>
            </View>

            {/* Right: Location block */}
            <View className="flex-[2] border border-gray-200 rounded-xl p-3 overflow-hidden">
              <View className="flex-1 mr-1.5">
                <Text
                  className="text-[12px] font-manrope-bold text-indigo-600 mb-1"
                  numberOfLines={2}
                >
                  {project.location}
                </Text>
                <View className="flex-row items-center space-x-1 mb-1">
                  <Ionicons name="location" size={14} color="#4A43EC" />
                  <Text className="text-[11px] font-manrope-regular text-gray-500">
                    {" "}
                    Prime Location
                  </Text>
                </View>
                {project.rera && (
                  <View className="flex-row items-center space-x-1">
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={14}
                      color="#22C55E"
                    />
                    <Text className="text-[11px] font-manrope-regular text-gray-500">
                      {" "}
                      RERA
                    </Text>
                  </View>
                )}
              </View>
              <Image
                source={group1597}
                className="absolute right-0 top-0 bottom-0 w-[90px] h-full"
                resizeMode="cover"
              />
            </View>
          </View>

          {/* Builder row */}
          <ImageBackground
            source={frame871}
            className="rounded-2xl overflow-hidden"
            imageStyle={{ borderRadius: 12 }}
            resizeMode="stretch"
          >
            <TouchableOpacity className="px-4 py-3 flex-row items-center justify-between">
              <Text
                className="text-[12px] font-bold text-indigo-600 flex-1 mr-2"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {project.builder} · {project.possessionStatus}
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#4A43EC" />
            </TouchableOpacity>
          </ImageBackground>
        </View>

        {/* Config block */}
        <View className="mx-4 bg-white rounded-[10px] mt-3 px-5 py-4 flex-row items-center border border-[#d6d4fc] mb-3">
          <View className="flex-col pr-10 items-start">
            <Text className="text-[11px] font-inter-bold text-[#94A3B8] tracking-widest">
              CONFIG
            </Text>
            <Text className="text-[13px] font-inter-semibold text-[#0F172A]">
              {bhkConfig ? `${bhkConfig} BHK` : project.propertyType}
            </Text>
          </View>
          <View className="w-px h-12 bg-gray-200" />
          <View className="flex-1 flex-row items-end pl-5 gap-4">
            <Text className="text-[12px] font-manrope-medium text-gray-500 mb-0.5">
              Starting from
            </Text>
            <Text className="text-2xl font-manrope-bold text-[#4941EC]">
              {startingPrice}*
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View className="mx-4 mb-6 mt-1 h-px bg-gray-200" />

        {/* Tab Bar */}
        <View className="flex-row mx-5 mb-4 gap-3">
          {["Overview", "Highlights", "Property Tour"].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl items-center border ${activeTab === tab ? "bg-[#F8F5FF] border-[#DCD0FF]" : "bg-white border-gray-200"}`}
            >
              <Text
                className={`text-[13px] font-manrope-bold ${activeTab === tab ? "text-[#4A43EC]" : "text-gray-700"}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === "Overview" && <Overview project={project} />}
        {activeTab === "Highlights" && <Highlights project={project} />}
        {activeTab === "Property Tour" && <PropertyTour project={project} />}
      </ScrollView>

      {/* Bottom CTA */}
      {from !== "visit" && (
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-6 border-t border-gray-100"
          style={{ paddingBottom: insets.bottom + 14 }}
        >
          <DetailFooter onBookVisit={() => setBookModalVisible(true)} />
        </View>
      )}

      <BookVisitModal
        visible={bookModalVisible}
        onClose={() => setBookModalVisible(false)}
        project={project}
      />
    </View>
  );
}
