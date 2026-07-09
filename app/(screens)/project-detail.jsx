import {
  View,
  Text,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavourite, savePropertyThunk, unsavePropertyThunk, fetchSavedPropertiesThunk, fetchRecommendedPropertiesThunk } from "../../store/slices/propertiesSlice";
import { fetchProjectDetailsThunk, fetchFloorPlansThunk, fetchResaleThunk, fetchLandmarksThunk, fetchAmenitiesThunk, fetchSimilarPropertiesThunk, fetchProjectListThunk } from "../../store/slices/projectSlice";
import { fetchBuilderDetailsThunk } from "../../store/slices/builderSlice";
import { incrementProjectView } from "../../store/slices/projectViewTrackingSlice";
import { addToRecentProjects } from "../../store/slices/recentProjectsSlice";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { allProjects } from "../../data/projects";
import Overview from "../../components/projectDetail/Overview";
import Highlights from "../../components/projectDetail/Highlights";
import PropertyTour from "../../components/projectDetail/PropertyTour";
import BookVisitModal from "../../components/projectDetail/BookVisitModal";
import DetailFooter from "../../components/projectDetail/DetailFooter";
import ReraStatusBadge from "../../components/ReraStatusBadge";
import BuilderModal from "../../components/projectDetail/BuilderModal";

const frame260 = require("../../assets/images/Frame 26086854.png");
const frame871 = require("../../assets/images/Frame 26086871.png");
const group1597 = require("../../assets/images/Group 1597884495.png");

const { width } = Dimensions.get("window");

function SkeletonBox({ width: w, height: h, borderRadius = 8, style }) {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, { toValue: 1, duration: 1100, useNativeDriver: true })
    ).start();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <View style={[{ width: w, height: h, borderRadius, backgroundColor: '#E5E7EB', overflow: 'hidden' }, style]}>
      <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.55)', 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

function ProjectDetailSkeleton({ insets }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8F5FF' }}>
      {/* Hero */}
      <SkeletonBox width={width} height={380} borderRadius={0} />

      {/* Back button */}
      <View style={{ position: 'absolute', top: insets.top + 10, left: 16 }}>
        <SkeletonBox width={38} height={38} borderRadius={19} />
      </View>

      {/* Main card */}
      <View style={{ marginHorizontal: 16, marginTop: -96, backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 12 }}>
        <SkeletonBox width={200} height={18} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <SkeletonBox width={100} height={80} borderRadius={12} />
          <SkeletonBox width={width - 180} height={80} borderRadius={12} />
        </View>
        <SkeletonBox width="100%" height={44} borderRadius={12} />
      </View>

      {/* Config block */}
      <View style={{ marginHorizontal: 16, marginTop: 12, backgroundColor: '#fff', borderRadius: 10, padding: 16, flexDirection: 'row', gap: 16 }}>
        <View style={{ gap: 8 }}>
          <SkeletonBox width={60} height={10} />
          <SkeletonBox width={100} height={14} />
        </View>
        <View style={{ width: 1, backgroundColor: '#E5E7EB' }} />
        <View style={{ gap: 8 }}>
          <SkeletonBox width={80} height={10} />
          <SkeletonBox width={120} height={22} />
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', marginHorizontal: 20, marginTop: 16, gap: 10 }}>
        {[1, 2, 3].map(i => <SkeletonBox key={i} width={(width - 60) / 3} height={38} borderRadius={12} />)}
      </View>

      {/* Content lines */}
      <View style={{ marginHorizontal: 16, marginTop: 20, gap: 10 }}>
        <SkeletonBox width="90%" height={12} />
        <SkeletonBox width="75%" height={12} />
        <SkeletonBox width="85%" height={12} />
      </View>
    </View>
  );
}

function getRouteParam(value) {
  const param = Array.isArray(value) ? value[0] : value;
  return param && param !== 'none' ? param : null;
}

function formatCompactPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  if (amount >= 10000000) {
    const crores = amount / 10000000;
    return `\u20B9${Number.isInteger(crores) ? crores.toFixed(0) : crores.toFixed(1)}Cr`;
  }

  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `\u20B9${Number.isInteger(lakhs) ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
  }

  return `\u20B9${amount.toLocaleString('en-IN')}`;
}

function formatProjectDate(value) {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

function normalizeProjectRating(...values) {
  for (const value of values) {
    const rating = Number(value);
    if (Number.isFinite(rating) && rating > 0) {
      const cappedRating = Math.min(rating, 10);
      return Number.isInteger(cappedRating)
        ? String(cappedRating)
        : cappedRating.toFixed(1);
    }
  }

  return '8.8';
}

function formatConfigLabel(value) {
  const text = cleanText(value).replace(/[_-]+/g, ' ');
  if (!text) return '';

  return text
    .split(' ')
    .filter(Boolean)
    .map((word) => {
      const upper = word.toUpperCase();
      if (upper === 'BHK' || upper === 'PG') return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function normalizeConfigLabel(value) {
  if (!value) return null;

  const values = Array.isArray(value) ? value : String(value).split(',');
  const bhkValues = [];
  const otherValues = [];

  values.forEach((item) => {
    const rawText = cleanText(item);
    const text = rawText.toLowerCase();
    if (!text) return;

    const bhkMatches = text.match(/\d+\+?(?=\s*bhk\b)/g) || [];
    if (bhkMatches.length > 0) {
      bhkValues.push(...bhkMatches);
      return;
    }

    const plainNumber = text.trim().match(/^\d+\+?$/);
    if (plainNumber) {
      bhkValues.push(plainNumber[0]);
      return;
    }

    const label = formatConfigLabel(rawText);
    if (label) otherValues.push(label);
  });

  const cleaned = [...new Set(bhkValues)].sort((a, b) => parseFloat(a) - parseFloat(b));
  const uniqueOtherValues = [...new Set(otherValues)];
  const parts = [];

  if (cleaned.length > 0) parts.push(`${cleaned.join(', ')} BHK`);
  if (uniqueOtherValues.length > 0) parts.push(uniqueOtherValues.join(', '));

  return parts.length > 0 ? parts.join(', ') : null;
}

function normalizeFloorPlan(plan) {
  const title = plan.title
    || (plan.bedrooms ? `${plan.bedrooms} BHK` : formatConfigLabel(plan.property_subtype || plan.sub_type || plan.type) || 'Unit');
  const areaSqft = plan.area_sqft ?? plan.total_area_sqft ?? plan.areaSqft ?? null;

  return {
    ...plan,
    title,
    type: plan.property_subtype || plan.sub_type || plan.type || title,
    area_sqft: areaSqft,
    area: plan.area || (areaSqft ? `${areaSqft} sqft` : null),
    price: plan.price ?? plan.base_price ?? plan.price_from ?? null,
    image: plan.image || plan.floor_plan_url || plan.cover_image || null,
    amenities: Array.isArray(plan.amenities) ? plan.amenities : [],
  };
}

function toImageSource(value, fallback = null) {
  if (typeof value === 'string' && value.trim()) return { uri: value };
  if (value) return value;
  return fallback;
}

function cleanText(value) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text || ['none', 'null', 'undefined'].includes(text.toLowerCase())) return '';
  return text;
}

function cleanBuilderName(value) {
  const text = cleanText(value);
  if (!text || ['organisation', 'organization', 'builder', 'developer'].includes(text.toLowerCase())) return '';
  return text;
}

function buildProjectLocation(primary = {}, fallback = {}) {
  const parts = [
    cleanText(primary.area),
    cleanText(primary.city),
    cleanText(primary.pincode),
  ].filter(Boolean);

  if (parts.length > 0) return parts.join(', ');

  return cleanText(primary.location)
    || cleanText(primary.address)
    || cleanText(fallback.location)
    || [cleanText(fallback.area), cleanText(fallback.city), cleanText(fallback.pincode)].filter(Boolean).join(', ');
}

export default function ProjectDetail() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const id = getRouteParam(params.id);
  const slug = getRouteParam(params.slug);
  const from = getRouteParam(params.from);
  const [activeTab, setActiveTab] = useState("Overview");
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [builderModalVisible, setBuilderModalVisible] = useState(false);
  const dispatch = useDispatch();
  const savedProjects = useSelector((s) => s.properties.favouriteProjects);
  const recommendedProperties = useSelector((s) => s.properties.recommended);
  const { details: apiProject, floorPlans, resale, landmarks, amenities, similarProperties, loading: apiLoading, currentDetailSlug } = useSelector((s) => s.project);
  const { list: projectList } = useSelector((s) => s.project);
  const { currentBuilder } = useSelector((s) => s.builder);
  const { isLoggedIn, token } = useSelector((s) => s.auth);

  // Debug: Log auth state
  useEffect(() => {
    console.log('🔐 Auth State:', { isLoggedIn, hasToken: !!token });
  }, [isLoggedIn, token]);

  // Find project from API list or local fallback
  const listProject = projectList.find((p) => p.id === id) || allProjects.find((p) => p.id === id);
  const isSaved = savedProjects.includes(id);

  // Use slug from params or from API project list (local allProjects has no slug)
  const resolvedProjectSlug = slug || listProject?.slug || null;
  const detailLookupKey = id || resolvedProjectSlug;
  const activeApiProject = apiProject && (!id || String(apiProject.id) === String(id)) && currentDetailSlug === detailLookupKey
    ? apiProject
    : null;
  const projectOrganisationId = activeApiProject?.developer?.id
    || activeApiProject?.organisation_id
    || activeApiProject?.organization_id
    || listProject?.organisation_id
    || listProject?.organization_id
    || null;

  // Save the project itself, not the floor-plan properties
  const projectSaveId = id || resolvedProjectSlug || listProject?.id;
  const trackedProjectRef = useRef(null);

  // If no slug available, fetch project list to resolve it
  useEffect(() => {
    if (!resolvedProjectSlug || resolvedProjectSlug === 'none') {
      dispatch(fetchProjectListThunk());
    }
  }, [dispatch, resolvedProjectSlug]);
  
  const handleToggleSave = async () => {
    console.log('🔖 Toggle Save Clicked');
    console.log('📊 Current State:', {
      projectId: id,
      projectSlug: resolvedProjectSlug,
      isSaved,
      isLoggedIn,
      hasToken: !!token,
      floorPlansLoaded: !!floorPlans,
      floorPlansCount: floorPlans?.floor_plans?.length || 0,
      projectSaveId,
    });
    
    // Only proceed with API calls if user is logged in
    if (!isLoggedIn || !token) {
      console.log('⚠️ User not logged in, only saving locally');
      dispatch(toggleFavourite(id));
      return;
    }
    
    if (projectSaveId) {
      try {
      if (isSaved) {
        console.log('🗑️ Unsaving project via API:', projectSaveId);
        await dispatch(unsavePropertyThunk({ itemType: 'project', itemId: projectSaveId })).unwrap();
      } else {
        console.log('💾 Saving project via API:', projectSaveId);
        await dispatch(savePropertyThunk({ itemType: 'project', itemId: projectSaveId, itemData: savedProjectData })).unwrap();
      }
      dispatch(fetchSavedPropertiesThunk());
      console.log('✅ Save/Unsave operations completed');
      } catch (error) {
        console.log('❌ Save/Unsave operation failed:', error);
      }
    } else {
      console.log('⚠️ No project id available for save/unsave API');
    }
  };

  useEffect(() => {
    if (detailLookupKey) {
      console.log('Fetching project details for:', detailLookupKey);
      dispatch(fetchProjectDetailsThunk(detailLookupKey));
    }

    if (resolvedProjectSlug && resolvedProjectSlug !== 'none') {
      console.log('🔍 Fetching project details for slug:', resolvedProjectSlug);
      dispatch(fetchFloorPlansThunk(resolvedProjectSlug));
      dispatch(fetchResaleThunk(resolvedProjectSlug));
      dispatch(fetchLandmarksThunk(resolvedProjectSlug));
      dispatch(fetchAmenitiesThunk(resolvedProjectSlug));
      dispatch(fetchSimilarPropertiesThunk(resolvedProjectSlug));
      dispatch(fetchRecommendedPropertiesThunk());
    } else {
      console.log('⚠️ No slug available — id:', id, 'slug:', slug, 'resolvedProjectSlug:', resolvedProjectSlug);
    }
    // Don't clear project on cleanup - it causes re-loading when navigating between projects
    // Only clear when component actually unmounts (user leaves project detail screen)
  }, [dispatch, detailLookupKey, resolvedProjectSlug, id, slug]);

  useEffect(() => {
    if (!detailLookupKey || trackedProjectRef.current === detailLookupKey) return;

    trackedProjectRef.current = detailLookupKey;
    dispatch(incrementProjectView(String(detailLookupKey)));
    dispatch(addToRecentProjects(String(detailLookupKey)));
  }, [dispatch, detailLookupKey]);

  useEffect(() => {
    if (projectOrganisationId) {
      dispatch(fetchBuilderDetailsThunk({ builderId: projectOrganisationId }));
    }
  }, [dispatch, projectOrganisationId]);

  if (!listProject && !activeApiProject) {
    return <ProjectDetailSkeleton insets={insets} />;
  }

  // Show skeleton while API details are still loading
  if (apiLoading && !activeApiProject && !listProject) {
    return <ProjectDetailSkeleton insets={insets} />;
  }

  // Merge API data with list/local fallback
  const base = listProject || {};
  const apiVariants = Array.isArray(activeApiProject?.variants)
    ? activeApiProject.variants.map(normalizeFloorPlan)
    : [];
  const normalizedVariants = Array.isArray(floorPlans?.floor_plans) && floorPlans.floor_plans.length > 0
    ? floorPlans.floor_plans.map(normalizeFloorPlan)
    : (apiVariants.length > 0 ? apiVariants : (base.variants || []));
  const variantConfig = normalizedVariants
    .map((variant) => variant.bedrooms || variant.property_subtype || variant.sub_type || variant.type || variant.title)
    .filter(Boolean);
  const coverImage = activeApiProject?.cover_image
    || activeApiProject?.cover_image_url
    || activeApiProject?.image
    || activeApiProject?.image_url
    || base.cover_image_url
    || base.cover_image
    || base.image
    || base.image_url;
  const currentBuilderMatchesProject = currentBuilder?.id
    && projectOrganisationId
    && String(currentBuilder.id) === String(projectOrganisationId);
  const organisationName = currentBuilderMatchesProject ? currentBuilder.name : null;
  const organisationLogo = currentBuilderMatchesProject ? currentBuilder.logo_url : null;
  const builderName = cleanBuilderName(activeApiProject?.developer?.name)
    || cleanBuilderName(organisationName)
    || cleanBuilderName(activeApiProject?.organisation_name)
    || cleanBuilderName(activeApiProject?.org_name)
    || cleanBuilderName(activeApiProject?.owner_name)
    || cleanBuilderName(activeApiProject?.builder_name)
    || cleanBuilderName(base.organisation_name)
    || cleanBuilderName(base.org_name)
    || cleanBuilderName(base.builder)
    || cleanBuilderName(base.owner_name)
    || "Developer details unavailable";
  const launchedValue = activeApiProject?.stats?.launched
    || activeApiProject?.project_launch_date
    || activeApiProject?.created_at
    || base.launchedIn
    || base.created_at;
  const unitsValue = activeApiProject?.stats?.units
    ?? activeApiProject?.total_properties
    ?? activeApiProject?.units
    ?? (normalizedVariants.length > 0 ? normalizedVariants.length : base.units);
  const apiRating = normalizeProjectRating(
    activeApiProject?.rating,
    activeApiProject?.score,
    activeApiProject?.project_rating,
    base.rating,
  );
  const rawConfig = floorPlans?.summary?.configs ?? floorPlans?.configs ?? activeApiProject?.summary?.configs ?? activeApiProject?.configs ?? activeApiProject?.config;
  const rawStartingPrice = floorPlans?.summary?.starting_from
    ?? floorPlans?.summary?.startingFrom
    ?? floorPlans?.starting_from
    ?? floorPlans?.startingFrom
    ?? floorPlans?.price?.min
    ?? activeApiProject?.summary?.starting_from
    ?? activeApiProject?.starting_from
    ?? activeApiProject?.price_from
    ?? base.price_from
    ?? base.min_price
    ?? normalizedVariants.find((variant) => variant.price || variant.base_price || variant.price_from)?.price
    ?? normalizedVariants.find((variant) => variant.price || variant.base_price || variant.price_from)?.base_price
    ?? normalizedVariants.find((variant) => variant.price || variant.base_price || variant.price_from)?.price_from
    ?? null;
  const projectLocation = buildProjectLocation(activeApiProject || {}, base);

  const project = {
    ...base,
    ...(activeApiProject ? {
      name: activeApiProject.name || base.name,
      city: cleanText(activeApiProject.city) || cleanText(base.city),
      area: cleanText(activeApiProject.area) || cleanText(base.area),
      pincode: cleanText(activeApiProject.pincode) || cleanText(base.pincode),
      latitude: activeApiProject.latitude ?? base.latitude,
      longitude: activeApiProject.longitude ?? base.longitude,
      location: projectLocation,
      description: activeApiProject.description || base.description,
      reraId: activeApiProject.rera_id || activeApiProject.rera_number || base.reraId,
      possession: activeApiProject.possession || activeApiProject.possession_date || activeApiProject.possession_status || base.possession,
      possessionStatus: activeApiProject.possession || activeApiProject.possession_status || activeApiProject.possession_date || base.possessionStatus || base.possession,
      builder: builderName,
      builderLogo: toImageSource(activeApiProject.developer?.logo || activeApiProject.org_logo_url || activeApiProject.organisation_logo_url || organisationLogo, base.builderLogo),
      developerId: projectOrganisationId || base.developerId,
      imageMain: toImageSource(coverImage, base.imageMain),
      imageThumb: toImageSource(activeApiProject.thumbnail_url || activeApiProject.image_thumb, toImageSource(coverImage, base.imageThumb || base.imageMain)),
      brochure: activeApiProject.brochure || (activeApiProject.brochure_url
        ? {
          url: activeApiProject.brochure_url,
          label: activeApiProject.brochure_label,
        }
        : null) || base.brochure || null,
      units: unitsValue,
      launchedIn: launchedValue ? formatProjectDate(launchedValue) : base.launchedIn,
      rating: apiRating,
      subTypes: base.subTypes || variantConfig,
      propertyType: base.propertyType || activeApiProject.property_type,
      avgPricePerSqft: base.avgPricePerSqft,
      price_from: activeApiProject.price_from ?? base.price_from,
      price_to: activeApiProject.price_to ?? base.price_to,
      rera: activeApiProject.rera_approved !== undefined
        ? Boolean(activeApiProject.rera_approved)
        : Boolean(base.rera),
      variants: base.variants,
    } : {
      name: base.name,
      city: cleanText(base.city),
      area: cleanText(base.area),
      pincode: cleanText(base.pincode),
      latitude: base.latitude,
      longitude: base.longitude,
      location: buildProjectLocation(base),
      builder: builderName,
      builderLogo: toImageSource(base.organisation_logo_url || base.org_logo_url || base.builderLogo, base.imageMain),
      developerId: projectOrganisationId || base.developerId,
      imageMain: toImageSource(coverImage, base.imageMain),
      possession: base.possession_date || base.possession,
      units: base.units,
      launchedIn: base.launchedIn,
      rating: normalizeProjectRating(base.rating),
    }),
    variants: normalizedVariants,
    floorPlans: normalizedVariants,
    resaleProperties: resale,
    recommendedProperties,
    landmarks: landmarks,
    amenities: amenities,
    similarProperties: similarProperties?.length > 0
      ? similarProperties
      : projectList.filter(p => p.id !== id && (p.city === base.city || p.area === base.area)).slice(0, 5),
  };

  const bhkConfig = normalizeConfigLabel(rawConfig)
    || normalizeConfigLabel(variantConfig)
    || normalizeConfigLabel(project.subTypes)
    || null;
  const startingPrice = rawStartingPrice !== null && rawStartingPrice !== undefined
    ? (typeof rawStartingPrice === 'number'
        ? `₹${(rawStartingPrice / 100000).toFixed(0)}L`
        : rawStartingPrice)
    : project.variants?.[0]?.priceRange?.split("–")[0]?.trim() ?? project.avgPricePerSqft;

  const savedProjectData = {
    id: projectSaveId,
    name: project.name,
    title: project.name,
    slug: resolvedProjectSlug,
    area: project.area || base.area || project.location,
    city: project.city || base.city,
    location: project.location,
    pincode: project.pincode || base.pincode,
    cover_image_url: activeApiProject?.cover_image || base.cover_image_url || base.cover_image,
    image: activeApiProject?.cover_image || base.cover_image_url || base.cover_image,
    price_from: project.price_from ?? rawStartingPrice,
    price_to: project.price_to,
    min_price: project.price_from ?? rawStartingPrice,
    rera_id: project.reraId || activeApiProject?.rera_id || base.rera_id,
  };

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
            className={`absolute right-4 w-[38px] h-[38px] rounded-full items-center justify-center ${isSaved ? "bg-black/85" : "bg-white/85"}`}
            style={{ top: insets.top + 10 }}
          >
            <Ionicons
              name={isSaved ? "heart" : "heart-outline"}
              size={21}
              color={isSaved ? "#EF4444" : "#111827"}
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
                <ReraStatusBadge approved={project.rera} textClassName="text-[10px]" />
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
            <TouchableOpacity
              onPress={() => setBuilderModalVisible(true)}
              className="px-4 py-3 flex-row items-center justify-between"
            >
              <Text
                className="text-[12px] font-bold text-indigo-600 flex-1 mr-2"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {project.builder} 
              </Text>
             
            </TouchableOpacity>
          </ImageBackground>
        </View>

        {/* Config block */}
        <View className="mx-4 bg-white rounded-[10px] mt-3 px-5 py-4 flex-row items-center border border-[#d6d4fc] mb-3">
          <View className="flex-col pr-10 items-start">
            <Text className="text-[11px] font-inter-bold text-[#94A3B8] tracking-widest">
              CONFIG
            </Text>
            {bhkConfig ? (
              <Text className="text-[13px] font-inter-semibold text-[#0F172A]">
                {bhkConfig}
              </Text>
            ) : (
              <Text className="text-[13px] font-inter-semibold text-[#94A3B8]">
                Config on request
              </Text>
            )}
          </View>
          <View className="w-px h-12 bg-gray-200" />
          <View className="flex-1 flex-row items-end pl-5 gap-4">
            <Text className="text-[12px] font-manrope-medium text-gray-500 mb-0.5">
              Starting from
            </Text>
            {startingPrice ? (
              <Text className="text-2xl font-manrope-bold text-[#4941EC]">
                {formatCompactPrice(rawStartingPrice) || startingPrice}*
              </Text>
            ) : (
              <Text className="text-[13px] font-inter-semibold text-[#94A3B8]">
               {"Price\non request"}
              </Text>
            )}
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
      <BuilderModal
        visible={builderModalVisible}
        onClose={() => setBuilderModalVisible(false)}
        project={project}
      />
    </View>
  );
}
