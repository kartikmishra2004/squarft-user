import { useState, useRef, useEffect, useMemo } from "react";
import { View, Text, Pressable, ScrollView, Image, TextInput, Platform, KeyboardAvoidingView, Alert, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSelector, useDispatch } from "react-redux";
import { confirmVisits } from "../../store/slices/propertiesSlice";
import { fetchBranchListThunk, fetchAvailableSlotsThunk, createSiteVisitThunk, updateSiteVisitThunk, clearAvailableSlots } from "../../store/slices/visitSlice";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { useLocalSearchParams, useRouter } from "expo-router";
import { currentUser } from "../../data/user";
import PropertyDetailModal from "../../components/projectDetail/PropertyDetailModal";
import { propertyApi } from "../../services/propertyApi";
import { projectApi } from "../../services/projectApi";

const FALLBACK_PROPERTY_IMAGE = { uri: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" };

const STATIC_SALES_OFFICERS = [
  { id: "rahul-sharma", name: "Rahul Sharma", role: "Senior Sales Officer" },
  { id: "priya-verma", name: "Priya Verma", role: "Site Visit Specialist" },
  { id: "amit-jain", name: "Amit Jain", role: "Property Consultant" },
];

const PREVIOUS_SALES_OFFICER = STATIC_SALES_OFFICERS[0];

const formatSlotTime = (value) =>
  new Date(value).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).replace(/^0/, '');

const getSlotHour = (slot) => new Date(slot.slot_start).getHours();

const toLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey) => {
  const [year, month, day] = String(dateKey || '').split('-').map(Number);
  if (!year || !month || !day) return new Date();
  return new Date(year, month - 1, day);
};

const normalizeFutureDateKey = (dateKey, todayKey) =>
  dateKey && String(dateKey) >= todayKey ? String(dateKey) : todayKey;

const getMonthKey = (dateKey) => String(dateKey || '').slice(0, 7);

const isFutureSlot = (slot, now) => {
  const slotTime = new Date(slot.slot_start);
  return !Number.isNaN(slotTime.getTime()) && slotTime > now;
};

const groupAvailableSlots = (slots) => {
  const groups = { morning: [], afternoon: [], evening: [] };
  slots.forEach((slot) => {
    const hour = getSlotHour(slot);
    if (hour < 12) groups.morning.push(slot);
    else if (hour < 17) groups.afternoon.push(slot);
    else groups.evening.push(slot);
  });
  return groups;
};

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ''));

const getPropertyIdForVisit = (item) => {
  const candidates = [
    item?.propertyIds?.[0],
    item?.property_id,
    item?.propertyId,
    item?.id,
  ];
  return candidates.find(isUuid);
};

const getImageSource = (image) => {
  if (typeof image === "string" && image) return { uri: image };
  return image || FALLBACK_PROPERTY_IMAGE;
};

const getVisitVariantLabel = (visit) => {
  if (visit?.variant) return visit.variant;
  if (Array.isArray(visit?.selectedUnits) && visit.selectedUnits[0]) return visit.selectedUnits[0];
  return visit?.unitType || visit?.type || visit?.title || visit?.name || "Selected Unit";
};

const getSelectedVisitVariant = (visit) => {
  if (visit?.variantDetails) return visit.variantDetails;

  const propertyId = getPropertyIdForVisit(visit);
  const selectedLabel = getVisitVariantLabel(visit);
  const options = [
    ...(Array.isArray(visit?.floorPlans) ? visit.floorPlans : []),
    ...(Array.isArray(visit?.variants) ? visit.variants : []),
  ];

  return options.find((option) => {
    const optionLabel = option?.type || option?.title;
    return (propertyId && option?.id === propertyId) || (selectedLabel && optionLabel === selectedLabel);
  });
};

const getApiList = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (key && Array.isArray(response?.data?.[key])) return response.data[key];
  if (key && Array.isArray(response?.[key])) return response[key];
  return [];
};

const getApiData = (response) => response?.data || response || null;

const normalizeApiFloorPlan = (plan = {}) => {
  const title = plan.title || (plan.bedrooms ? `${plan.bedrooms} BHK` : "Selected Unit");
  const areaSqft = plan.area_sqft ?? plan.total_area_sqft ?? plan.areaSqft ?? null;

  return {
    ...plan,
    title,
    type: plan.type || title,
    area_sqft: areaSqft,
    total_area_sqft: plan.total_area_sqft ?? areaSqft,
    area: plan.area || (areaSqft ? `${areaSqft} sqft` : null),
    price: plan.price ?? plan.base_price ?? plan.price_from ?? null,
    image: plan.image || plan.floor_plan_url || plan.cover_image || null,
    amenities: Array.isArray(plan.amenities) ? plan.amenities : [],
  };
};

const normalizeApiAmenities = (amenities = []) =>
  amenities
    .map((amenity) => (typeof amenity === "string" ? amenity : amenity?.name))
    .filter(Boolean);

const findById = (items, id) =>
  items.find((item) => id && String(item?.id) === String(id));

const resolveProjectSlug = (visit, property, projects) => {
  const directSlug = visit?.slug || visit?.projectSlug || visit?.project?.slug;
  if (directSlug && directSlug !== "none") return directSlug;

  const projectId = property?.project_id || visit?.project_id || visit?.projectId;
  const matchedProject = projects.find((project) =>
    (projectId && String(project?.id) === String(projectId)) ||
    (projectId && String(project?.project_id) === String(projectId)) ||
    (visit?.title && project?.name && String(project.name).toLowerCase() === String(visit.title).toLowerCase())
  );

  return matchedProject?.slug || null;
};

const LOCALITY_CITY_FALLBACKS = {
  nipania: "Indore",
  "scheme no 140": "Indore",
  "bypass road": "Indore",
  "ab road": "Indore",
  "scheme 54": "Indore",
  palasia: "Indore",
};

const getCityForVisit = (visit) => {
  const explicitCity = visit?.city || visit?.projectCity || visit?.builderCity;
  if (explicitCity) return explicitCity;

  const locationParts = String(visit?.location || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (locationParts.length > 1) return locationParts[locationParts.length - 1];

  const locality = locationParts[0]?.toLowerCase();
  return LOCALITY_CITY_FALLBACKS[locality] || null;
};

const buildPropertyDetailPayload = (visit) => {
  const propertyId = getPropertyIdForVisit(visit);
  const selectedVariant = getSelectedVisitVariant(visit);
  const imageSource = getImageSource(visit?.image || visit?.imageMain);
  const title = visit?.title || visit?.name || "Property";
  const variantLabel = selectedVariant?.type || selectedVariant?.title || getVisitVariantLabel(visit);
  const priceValue = selectedVariant?.priceRange || selectedVariant?.price || selectedVariant?.base_price || selectedVariant?.price_from || visit?.price || visit?.priceINR || visit?.priceRange || visit?.avgPricePerSqft;
  const areaValue = selectedVariant?.area || selectedVariant?.area_sqft || selectedVariant?.total_area_sqft || visit?.area || visit?.areaSqft || visit?.area_sqft;

  const variant = {
    ...selectedVariant,
    id: propertyId || visit?.property_id || visit?.id,
    title: variantLabel,
    type: variantLabel,
    price: selectedVariant?.price ?? selectedVariant?.base_price ?? selectedVariant?.price_from ?? priceValue,
    priceRange: selectedVariant?.priceRange || (typeof priceValue === "string" ? priceValue : undefined),
    area: selectedVariant?.area || (areaValue ? String(areaValue) : undefined),
    area_sqft: selectedVariant?.area_sqft ?? selectedVariant?.total_area_sqft ?? visit?.area_sqft,
    total_area_sqft: selectedVariant?.total_area_sqft,
    possession_status: selectedVariant?.possession_status || visit?.possessionStatus || visit?.possession,
    possession: selectedVariant?.possession || visit?.possession,
    tower_no: selectedVariant?.tower_no || selectedVariant?.tower || visit?.tower_no || visit?.tower,
    inventory: selectedVariant?.inventory ?? visit?.inventory,
    amenities: selectedVariant?.amenities || visit?.amenities,
    image: getImageSource(selectedVariant?.image || selectedVariant?.floor_plan_url || visit?.image || visit?.imageMain),
  };

  return {
    project: {
      ...visit,
      id: visit?.projectId || visit?.project_id || propertyId || visit?.id,
      name: title,
      title,
      location: visit?.location || "",
      imageMain: imageSource,
      imageThumb: getImageSource(visit?.imageThumb || visit?.image || visit?.imageMain),
      builder: visit?.builder || visit?.developer_name || "SquarFt",
      totalImages: visit?.totalImages || 1,
      possessionStatus: visit?.possessionStatus || visit?.possession_status || visit?.possession,
      possession: visit?.possession,
      tower_no: visit?.tower_no || visit?.tower,
      inventory: visit?.inventory,
      units: visit?.units,
      amenities: visit?.amenities || [],
      variants: [variant],
      floorPlans: [variant],
    },
    variant,
  };
};

export default function BookSiteVisit() {
  const router = useRouter();
  const dispatch = useDispatch();
  const rawBookedSiteVisits = useSelector((state) => state.properties.bookedSiteVisits);
  const { isLoggedIn, token } = useSelector((state) => state.auth);
  const { branches, availableSlots, branchesLoading, slotsLoading, creating } = useSelector((state) => state.visit);

  // Deduplicate securely to prevent persisted duplicates lingering from old bug
  const bookedSiteVisits = Array.from(new Map(rawBookedSiteVisits.map(item => [item.projectId || item.id.toString().replace(/_reschedule_.*/, ""), item])).values());

  const { selectedIds, initialDate, initialTime, initialVisitors, initialNotes, rescheduleVisitId } = useLocalSearchParams();

  const todayKey = toLocalDateKey();
  const initialSelectedDate = normalizeFutureDateKey(initialDate, todayKey);
  const [now, setNow] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate);
  const [calendarMonth, setCalendarMonth] = useState(initialSelectedDate);
  const scrollViewRef = useRef(null);
  const [selectedTime, setSelectedTime] = useState(initialTime ? [initialTime] : []);
  const [visitors, setVisitors] = useState(initialVisitors ? parseInt(initialVisitors, 10) : 1);
  const [notes, setNotes] = useState(initialNotes || "");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [resolvedPropertyCity, setResolvedPropertyCity] = useState(null);
  const [resolvingPropertyCity, setResolvingPropertyCity] = useState(false);
  const [selectedSalesOfficerId, setSelectedSalesOfficerId] = useState(null);
  const [usePreviousSalesOfficer, setUsePreviousSalesOfficer] = useState(false);
  const [isOfficerDropdownOpen, setIsOfficerDropdownOpen] = useState(false);
  const [detailModalData, setDetailModalData] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const selectedPropertyIds = selectedIds ? selectedIds.split(",") : bookedSiteVisits.map(v => v.id);

  // Get first property to determine city for branch lookup
  const firstProperty = bookedSiteVisits.find(v => selectedPropertyIds.includes(v.id));
  const propertyCity = getCityForVisit(firstProperty);
  const propertyIdForSlots = getPropertyIdForVisit(firstProperty);
  const bookingCity = propertyCity || resolvedPropertyCity;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentTodayKey = toLocalDateKey(now);
    if (selectedDate < currentTodayKey) {
      setSelectedDate(currentTodayKey);
      setCalendarMonth(currentTodayKey);
      setSelectedTime([]);
    }
  }, [now, selectedDate]);

  useEffect(() => {
    setResolvedPropertyCity(null);
  }, [propertyIdForSlots]);

  useEffect(() => {
    if (propertyCity || !isLoggedIn || !token || !propertyIdForSlots) return;

    let isMounted = true;
    setResolvingPropertyCity(true);

    propertyApi.getPropertyList(token, { limit: 500 })
      .then((response) => {
        if (!isMounted) return;
        const properties = getApiList(response);
        const property = findById(properties, propertyIdForSlots);
        const city = property?.city || getCityForVisit({
          ...property,
          location: property?.location || [property?.area, property?.city].filter(Boolean).join(", "),
        });

        if (city) {
          setResolvedPropertyCity(city);
        }
      })
      .catch((error) => {
        console.log("Failed to resolve property city for visit slots:", error?.message || error);
      })
      .finally(() => {
        if (isMounted) setResolvingPropertyCity(false);
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCity, propertyIdForSlots, isLoggedIn, token]);

  // Fetch branches when component mounts
  useEffect(() => {
    setSelectedBranch(null);
    setSelectedTime([]);
    if (isLoggedIn && token && bookingCity) {
      console.log('🏢 Fetching branches for city:', bookingCity);
      dispatch(fetchBranchListThunk(bookingCity));
    } else {
      dispatch(clearAvailableSlots());
    }
  }, [dispatch, bookingCity, isLoggedIn, token]);

  // Auto-select first branch when branches load
  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0]);
      console.log('✅ Auto-selected branch:', branches[0].name);
    }
  }, [branches, selectedBranch]);

  // Fetch available slots when date or branch changes
  useEffect(() => {
    if (isLoggedIn && token && selectedDate && selectedBranch && propertyIdForSlots) {
      console.log('🕐 Fetching available slots:', {
        property_id: propertyIdForSlots,
        date: selectedDate,
        branch_id: selectedBranch.id
      });
      
      dispatch(fetchAvailableSlotsThunk({
        property_id: propertyIdForSlots,
        date: selectedDate,
        branch_id: selectedBranch.id
      }));
    } else {
      dispatch(clearAvailableSlots());
    }
  }, [dispatch, selectedDate, selectedBranch, propertyIdForSlots, isLoggedIn, token]);

  const futureAvailableSlots = useMemo(
    () => availableSlots.filter(slot => isFutureSlot(slot, now)),
    [availableSlots, now]
  );

  useEffect(() => {
    if (!selectedTime.length) return;
    const availableLabels = new Set(futureAvailableSlots.map(slot => formatSlotTime(slot.slot_start)));
    if (availableSlots.length > 0 && !availableLabels.has(selectedTime[0])) {
      setSelectedTime([]);
      setSelectedSalesOfficerId(null);
      setUsePreviousSalesOfficer(false);
      setIsOfficerDropdownOpen(false);
    }
  }, [availableSlots.length, futureAvailableSlots, selectedTime]);

  useEffect(() => {
    if (selectedTime.length) return;
    setSelectedSalesOfficerId(null);
    setUsePreviousSalesOfficer(false);
    setIsOfficerDropdownOpen(false);
  }, [selectedTime.length]);

  // Clear slots when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearAvailableSlots());
    };
  }, [dispatch]);

  const slotGroups = futureAvailableSlots.length > 0
    ? groupAvailableSlots(futureAvailableSlots)
    : { morning: [], afternoon: [], evening: [] };

  const slotSetupLoading = resolvingPropertyCity || branchesLoading;
  const selectedSalesOfficer = usePreviousSalesOfficer
    ? PREVIOUS_SALES_OFFICER
    : STATIC_SALES_OFFICERS.find((officer) => officer.id === selectedSalesOfficerId);
  const emptySlotTitle = !propertyIdForSlots
    ? "Property unit missing"
    : !bookingCity
      ? "City details missing"
      : !selectedBranch
        ? "No active branch found"
        : "No slots available";
  const emptySlotMessage = !propertyIdForSlots
    ? "Please reopen the project and add a specific unit to your site visit."
    : !bookingCity
      ? "We could not detect this property's city. Please reopen the property details and add the unit again."
      : !selectedBranch
        ? `No active branch is available for ${bookingCity}.`
        : "Try a different date or nearby branch.";

  const isPreviousMonthDisabled = getMonthKey(calendarMonth) <= getMonthKey(toLocalDateKey(now));

  const handleSlotPress = (slot) => {
    setSelectedTime([typeof slot === 'string' ? slot : formatSlotTime(slot.slot_start)]);
    setSelectedSalesOfficerId(null);
    setUsePreviousSalesOfficer(false);
    setIsOfficerDropdownOpen(false);
  };

  const isSlotSelected = (slot) =>
    Array.isArray(selectedTime) ? selectedTime.includes(slot) : selectedTime === slot;

  const hydratePropertyDetailPayload = async (visit) => {
    const fallbackPayload = buildPropertyDetailPayload(visit);
    const propertyId = getPropertyIdForVisit(visit);
    if (!propertyId) return fallbackPayload;

    try {
      const [propertyResponse, projectListResponse] = await Promise.all([
        propertyApi.getPropertyList(token, { limit: 500 }),
        projectApi.listProjects(token),
      ]);

      const properties = getApiList(propertyResponse);
      const projects = getApiList(projectListResponse);
      const property = findById(properties, propertyId);
      const projectId = property?.project_id || visit?.project_id || visit?.projectId;
      const projectListItem = projects.find((project) =>
        (projectId && String(project?.id) === String(projectId)) ||
        (visit?.slug && project?.slug === visit.slug)
      );
      const slug = resolveProjectSlug(visit, property, projects);

      let projectDetails = null;
      let floorPlans = [];
      let projectAmenities = [];

      if (slug) {
        const [detailsResponse, floorPlansResponse, amenitiesResponse] = await Promise.all([
          projectApi.getProjectDetails(slug, token),
          projectApi.getProjectFloorPlans(slug, token),
          projectApi.getProjectAmenities(slug, token),
        ]);

        projectDetails = getApiData(detailsResponse);
        floorPlans = getApiList(floorPlansResponse, "floor_plans");
        projectAmenities = normalizeApiAmenities(getApiList(amenitiesResponse));
      }

      const matchedPlan = findById(floorPlans, propertyId);
      const normalizedPlan = matchedPlan ? normalizeApiFloorPlan(matchedPlan) : null;
      const propertyImage = property?.cover_image || property?.cover_image_url || property?.image;
      const selectedVariant = {
        ...fallbackPayload.variant,
        ...normalizeApiFloorPlan({
          id: propertyId,
          title: property?.title || fallbackPayload.variant.title,
          bedrooms: property?.bedrooms,
          total_area_sqft: property?.total_area_sqft,
          area_sqft: property?.total_area_sqft,
          price: property?.base_price ?? property?.min_price ?? property?.max_price,
          base_price: property?.base_price,
          tower_no: property?.tower_no,
          image: propertyImage,
        }),
        ...(normalizedPlan || {}),
      };

      const variantAmenities = normalizeApiAmenities(selectedVariant.amenities || []);
      selectedVariant.amenities = variantAmenities.length > 0 ? variantAmenities : projectAmenities;
      selectedVariant.possession_status =
        selectedVariant.possession_status ||
        selectedVariant.possession ||
        property?.possession_status ||
        projectDetails?.possession ||
        projectDetails?.possession_status ||
        fallbackPayload.variant.possession_status;
      selectedVariant.inventory =
        selectedVariant.inventory ??
        property?.inventory ??
        projectDetails?.stats?.units ??
        fallbackPayload.variant.inventory;

      const projectImage = projectDetails?.cover_image || projectListItem?.cover_image_url || propertyImage;
      const projectArea = projectDetails?.area || property?.area || visit?.area || fallbackPayload.project.area;
      const projectCity = projectDetails?.city || property?.city || visit?.city || fallbackPayload.project.city;

      return {
        project: {
          ...fallbackPayload.project,
          ...projectListItem,
          id: projectDetails?.id || projectListItem?.id || projectId || fallbackPayload.project.id,
          slug: slug || fallbackPayload.project.slug,
          name: projectDetails?.name || projectListItem?.name || fallbackPayload.project.name,
          title: projectDetails?.name || projectListItem?.name || fallbackPayload.project.title,
          city: projectCity,
          area: projectArea,
          location: projectDetails?.location || fallbackPayload.project.location || [projectArea, projectCity].filter(Boolean).join(", "),
          imageMain: getImageSource(projectImage || fallbackPayload.project.imageMain),
          imageThumb: getImageSource(propertyImage || projectImage || fallbackPayload.project.imageThumb),
          builder: projectDetails?.developer?.name || fallbackPayload.project.builder,
          totalImages: fallbackPayload.project.totalImages || 1,
          possessionStatus: projectDetails?.possession || property?.possession_status || fallbackPayload.project.possessionStatus,
          possession: projectDetails?.possession || property?.possession_status || fallbackPayload.project.possession,
          tower_no: selectedVariant.tower_no || fallbackPayload.project.tower_no,
          inventory: selectedVariant.inventory ?? fallbackPayload.project.inventory,
          units: projectDetails?.stats?.units ?? fallbackPayload.project.units,
          price_from: projectDetails?.price_from ?? projectDetails?.starting_from ?? property?.min_price ?? selectedVariant.price,
          price_to: projectDetails?.price_to ?? property?.max_price,
          amenities: selectedVariant.amenities,
          variants: [selectedVariant],
          floorPlans: [selectedVariant],
        },
        variant: selectedVariant,
      };
    } catch (error) {
      console.log("Property detail hydration failed:", error?.message || error);
      return fallbackPayload;
    }
  };

  const handleViewDetails = async (visit) => {
    const fallbackPayload = buildPropertyDetailPayload(visit);
    setDetailModalData(fallbackPayload);
    setIsDetailModalVisible(true);

    const enrichedPayload = await hydratePropertyDetailPayload(visit);
    setDetailModalData(enrichedPayload);
  };

  const renderSlotSection = (label, icon, slots) => (
    <>
      <View className="flex-row items-center mb-3.5">
        <Feather name={icon} size={12} color="#9CA3AF" />
        <Text className="text-[10px] font-manrope-extrabold text-[#6B7280] ml-2 uppercase tracking-[1px]">{label}</Text>
      </View>
      <View className="flex-row flex-wrap gap-3 mb-5">
        {slots.map(slot => {
          const labelText = formatSlotTime(slot.slot_start);
          return (
            <Pressable
              key={slot.slot_start}
              onPress={() => handleSlotPress(slot)}
              className={`items-center justify-center rounded-xl border ${isSlotSelected(labelText) ? 'bg-[#F2EFFF] border-[#B2A7FF]' : 'bg-white border-gray-200'}`}
              style={{ width: '30.5%', height: 44 }}
            >
              <Text
                numberOfLines={1}
                className={`text-[11.5px] font-manrope-bold tracking-wide ${isSlotSelected(labelText) ? 'text-[#4A43EC]' : 'text-[#111827]'}`}
              >
                {labelText}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );

  const handleConfirmVisit = async () => {
    if (!isLoggedIn || !token) {
      Alert.alert('Login Required', 'Please login to book a site visit');
      return;
    }

    if (selectedTime.length === 0) {
      Alert.alert('Select Time', 'Please select a time slot for your visit');
      return;
    }

    if (!selectedSalesOfficer) {
      Alert.alert('Select Sales Officer', 'Please select a sales officer for your site visit');
      return;
    }

    const itemsToBook = bookedSiteVisits.filter(v => selectedPropertyIds.includes(v.id));
    if (itemsToBook.length === 0) return;

    const bookingTargets = itemsToBook.map(item => ({
      item,
      propertyId: getPropertyIdForVisit(item),
    }));
    const missingProperty = bookingTargets.find(target => !target.propertyId);
    if (missingProperty) {
      Alert.alert(
        'Property Not Available',
        `${missingProperty.item.title || missingProperty.item.name || 'This property'} cannot be booked because its unit ID is missing. Please reopen the project and add a specific unit to your site visit.`
      );
      return;
    }

    const selectedTimeVal = Array.isArray(selectedTime) ? selectedTime[0] : selectedTime;
    const selectedApiSlot = futureAvailableSlots.find(slot => formatSlotTime(slot.slot_start) === selectedTimeVal);
    if (!selectedApiSlot) {
      Alert.alert('Slot Unavailable', 'This time slot has already passed. Please choose another available slot.');
      setSelectedTime([]);
      return;
    }
    
    // Convert selected date and time to ISO format for API
    const [hours, minutes] = selectedTimeVal.replace(/[AP]M/, '').trim().split(':').map(Number);
    const isPM = selectedTimeVal.includes('PM');
    const hour24 = isPM && hours !== 12 ? hours + 12 : (!isPM && hours === 12 ? 0 : hours);
    
    const slotDateTime = new Date(selectedDate);
    slotDateTime.setHours(hour24, minutes || 0, 0, 0);

    try {
      const slotStart = selectedApiSlot.slot_start || slotDateTime.toISOString();
      
      console.log('📤 Creating site visit:', {
        property_count: bookingTargets.length,
        slot_start: slotStart,
        user_note: notes || null,
        branch_id: selectedBranch?.id
      });

      const createdVisits = [];
      for (const target of bookingTargets) {
        const result = await dispatch(createSiteVisitThunk({
          property_id: target.propertyId,
          slot_start: slotStart,
          user_note: notes || null,
          branch_id: selectedBranch?.id
        })).unwrap();

        createdVisits.push({
          item: target.item,
          propertyId: target.propertyId,
          result,
        });
      }

      console.log('✅ Site visits created:', createdVisits.length);

      if (rescheduleVisitId) {
        try {
          await dispatch(updateSiteVisitThunk({
            visitId: rescheduleVisitId,
            updateData: { status: 'rescheduled' },
          })).unwrap();
        } catch (updateError) {
          console.log('Failed to mark previous visit as rescheduled:', updateError);
        }
      }

      // Also update local Redux state for UI
      const dateObj = new Date(selectedDate);
      const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const newUpcoming = createdVisits.map(({ item, propertyId, result }, index) => ({
        id: result.data?.id || `${propertyId}_${Date.now()}_${index}`,
        projectId: item.projectId || item.id.replace(/\d{13}$/, ""),
        propertyIds: item.propertyIds?.length ? item.propertyIds : [propertyId],
        title: item.title || item.name,
        location: item.location,
        image: item.image || item.imageMain || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
        status: "UPCOMING",
        dateFull: `${formattedDate} · ${selectedTimeVal || "10:00 AM"}`,
        slot_start: result.data?.slot_start || slotStart,
        slot_end: result.data?.slot_end,
        isoDate: result.data?.slot_start || slotStart,
        visitors: visitors,
        notes: notes,
        salesOfficerId: selectedSalesOfficer.id,
        salesOfficerName: selectedSalesOfficer.name,
        salesOfficerRole: selectedSalesOfficer.role,
        bookingId: result.data?.id || `SQF-${Math.floor(10000 + Math.random() * 90000)}`,
        visitorName: currentUser.name,
        duration: "1.5 Hours",
      }));

      dispatch(confirmVisits(newUpcoming));

      router.replace({
        pathname: '/(screens)/booking-status',
        params: {
          date: selectedDate,
          time: selectedTimeVal,
          propertyName: newUpcoming[0].title,
          propertyId: newUpcoming[0].projectId
        }
      });
    } catch (error) {
      console.log('❌ Error creating site visit:', error);
      
      // Handle specific error messages with user-friendly alerts
      const errorMessage = error?.message || error || 'Failed to book site visit. Please try again.';
      
      if (errorMessage.includes('No officers available')) {
        Alert.alert(
          'No Officers Available',
          'Unfortunately, no sales officers are available for this time slot. Please try selecting a different date or time.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (errorMessage.includes('already have a booking')) {
        Alert.alert(
          'Booking Conflict',
          'You already have a site visit booked at this time. Please choose a different time slot.',
          [{ text: 'OK', style: 'default' }]
        );
      } else if (errorMessage.includes('fully booked')) {
        Alert.alert(
          'Slot Fully Booked',
          'This time slot is fully booked. Please select another time.',
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        Alert.alert(
          'Booking Failed',
          errorMessage,
          [{ text: 'OK', style: 'default' }]
        );
      }
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingTop: Platform.OS === "ios" ? insets.top : 40, backgroundColor: "white" }}>
        <View className="flex-row items-center justify-between px-6 py-0.5 bg-white border-b border-gray-200">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 justify-center"
          >
            <Feather name="arrow-left" size={24} color="#111827" />
          </Pressable>

          <Text className="text-[15px] font-manrope-bold text-[#111827]">
            Book a site visit
          </Text>

          <View className="w-10 h-10" />
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={-30}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 bg-white"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >

          {/* Selected Properties */}
          {bookedSiteVisits.filter(v => selectedPropertyIds.includes(v.id)).map((visit) => {
            const imageObj = visit.image || visit.imageMain;
            const imageSource = getImageSource(imageObj);

            return (
              <View key={visit.id} className="border border-gray-200 rounded-2xl p-4 flex-row mb-2 mt-2 bg-white">
                <Image source={imageSource} className="w-[75px] h-[75px] rounded-[12px] mr-4 border border-gray-200" resizeMode="cover" />
                <View className="flex-1 justify-center">
                  <Text className="text-[#4A43EC] text-[9px] font-manrope-extrabold uppercase tracking-[1.5px] mb-1.5">
                    SQUARFT PREMIUM
                  </Text>
                  <Text className="text-[14px] font-manrope-extrabold text-[#111827] mb-1" numberOfLines={1}>
                    {visit.title || visit.name}
                  </Text>
                  <View className="flex-row items-center mb-1.5">
                    <Feather name="map-pin" size={11} color="#9CA3AF" />
                    <Text className="text-[11px] font-manrope text-[#6B7280] ml-1.5" numberOfLines={1}>
                      {visit.location}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleViewDetails(visit)}
                    className="flex-row items-center mt-0.5"
                  >
                    <Text className="text-[#4A43EC] text-[11px] font-manrope-bold">
                      View Details
                    </Text>
                    <Feather name="chevron-right" size={12} color="#4A43EC" className="ml-1" />
                  </Pressable>
                </View>
              </View>
            );
          })}

          {/* Select Date */}
          <View className="mb-7 mt-3">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-[14px] font-manrope-bold text-[#111827]">Select Date</Text>
              <View className="flex-row items-center">
                <Text className="text-[12px] font-manrope text-[#4B5563] mr-4">
                  {parseDateKey(calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
                </Text>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => {
                      if (isPreviousMonthDisabled) return;
                      const d = parseDateKey(calendarMonth);
                      d.setMonth(d.getMonth() - 1);
                      setCalendarMonth(toLocalDateKey(d));
                    }}
                    disabled={isPreviousMonthDisabled}
                    className="w-[24px] h-[24px] border border-gray-200 rounded-full bg-white items-center justify-center"
                  >
                    <Feather name="chevron-left" size={12} color={isPreviousMonthDisabled ? "#D1D5DB" : "#9CA3AF"} />
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      const d = parseDateKey(calendarMonth);
                      d.setMonth(d.getMonth() + 1);
                      setCalendarMonth(toLocalDateKey(d));
                    }}
                    className="w-[24px] h-[24px] border border-gray-200 rounded-full bg-white items-center justify-center"
                  >
                    <Feather name="chevron-right" size={12} color="#4B5563" />
                  </Pressable>
                </View>
              </View>
            </View>

            <View className="border border-gray-200 rounded-[20px] pb-2 pt-2 bg-white overflow-hidden">
              <Calendar
                key={calendarMonth}
                current={calendarMonth}
                minDate={toLocalDateKey(now)}
                hideArrows={true}
                renderHeader={() => <View style={{ height: 0 }} />}
                onDayPress={(day) => {
                  const currentTodayKey = toLocalDateKey(now);
                  if (day.dateString < currentTodayKey) return;
                  setSelectedDate(day.dateString);
                  setSelectedTime([]);
                }}
                onMonthChange={(month) => setCalendarMonth(month.dateString)}
                markingType={'custom'}
                markedDates={{
                  [selectedDate]: {
                    selected: true,
                    disableTouchEvent: true,
                    customStyles: {
                      container: {
                        backgroundColor: '#4A43EC',
                        elevation: 6,
                        shadowColor: '#4A43EC',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.35,
                        shadowRadius: 6,
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        borderWidth: 2,
                        borderColor: 'white',
                        justifyContent: 'center',
                        alignItems: 'center'
                      },
                      text: {
                        color: 'white',
                        fontFamily: 'manrope-extrabold',
                        fontSize: 14
                      }
                    }
                  }
                }}
                theme={{
                  backgroundColor: '#ffffff',
                  calendarBackground: '#ffffff',
                  textSectionTitleColor: '#9CA3AF',
                  dayTextColor: '#111827',
                  textDisabledColor: '#D1D5DB',
                  textDayFontFamily: 'manrope-medium',
                  textDayHeaderFontFamily: 'manrope-bold',
                  textDayFontSize: 13.5,
                  textDayHeaderFontSize: 10,
                  'stylesheet.calendar.header': {
                    header: {
                      height: 0,
                      opacity: 0,
                    },
                    dayHeader: {
                      marginTop: 6,
                      marginBottom: 8,
                      width: 32,
                      textAlign: 'center',
                      fontSize: 10,
                      fontFamily: 'manrope-bold',
                      color: '#9CA3AF'
                    }
                  }
                }}
              />
            </View>
          </View>

          {/* Select Time Slot */}
          <View className="mb-7">
            <Text className="text-[14px] font-manrope-bold text-[#111827] mb-4">Select Time Slot</Text>

            {slotSetupLoading || slotsLoading ? (
              <View className="py-8 items-center justify-center">
                <ActivityIndicator size="small" color="#4A43EC" />
                <Text className="text-[12px] font-manrope text-[#6B7280] mt-3">
                  {slotSetupLoading ? "Preparing visit slots..." : "Checking available slots..."}
                </Text>
              </View>
            ) : futureAvailableSlots.length > 0 ? (
              <>
                {slotGroups.morning.length > 0 && renderSlotSection("MORNING", "sunrise", slotGroups.morning)}
                {slotGroups.afternoon.length > 0 && renderSlotSection("AFTERNOON", "sun", slotGroups.afternoon)}
                {slotGroups.evening.length > 0 && renderSlotSection("EVENING", "sunset", slotGroups.evening)}
              </>
            ) : (
              <View className="border border-dashed border-gray-200 rounded-2xl p-5 items-center bg-gray-50">
                <Text className="text-[13px] font-manrope-bold text-[#111827]">
                  {emptySlotTitle}
                </Text>
                <Text className="text-[11px] font-manrope text-[#6B7280] text-center mt-1">
                  {emptySlotMessage}
                </Text>
              </View>
            )}
          </View>

          {selectedTime.length > 0 && (
            <View className="mb-7">
              <Text className="text-[14px] font-manrope-bold text-[#111827] mb-4">Select Sales Officer</Text>
              <Pressable
                onPress={() => {
                  const nextValue = !usePreviousSalesOfficer;
                  setUsePreviousSalesOfficer(nextValue);
                  setSelectedSalesOfficerId(null);
                  setIsOfficerDropdownOpen(false);
                }}
                className={`mb-3 rounded-2xl border px-4 py-3 flex-row items-center ${usePreviousSalesOfficer ? 'bg-[#F8F7FF] border-[#B2A7FF]' : 'bg-white border-gray-200'}`}
              >
                <View className={`w-[22px] h-[22px] rounded-md border items-center justify-center mr-3 ${usePreviousSalesOfficer ? 'bg-[#4A43EC] border-[#4A43EC]' : 'border-gray-300 bg-white'}`}>
                  {usePreviousSalesOfficer && <Feather name="check" size={14} color="white" />}
                </View>
                <View className="flex-1">
                  <Text className="text-[13px] font-manrope-bold text-[#111827]">
                    Use previous sales officer
                  </Text>
                  <Text className="text-[11px] font-manrope text-[#6B7280] mt-0.5" numberOfLines={1}>
                    {PREVIOUS_SALES_OFFICER.name} • {PREVIOUS_SALES_OFFICER.role}
                  </Text>
                </View>
              </Pressable>
              <View className="relative">
                <Pressable
                  onPress={() => {
                    if (usePreviousSalesOfficer) return;
                    setIsOfficerDropdownOpen((value) => !value);
                  }}
                  disabled={usePreviousSalesOfficer}
                  className={`bg-white border rounded-2xl px-4 py-3.5 flex-row items-center justify-between ${selectedSalesOfficer ? 'border-[#B2A7FF]' : 'border-gray-200'} ${usePreviousSalesOfficer ? 'opacity-60' : ''}`}
                >
                  <View className="flex-row items-center flex-1 pr-3">
                    <View className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${selectedSalesOfficer ? 'bg-[#F2EFFF]' : 'bg-gray-100'}`}>
                      <Feather name="user-check" size={16} color={selectedSalesOfficer ? "#4A43EC" : "#9CA3AF"} />
                    </View>
                    <View className="flex-1">
                      <Text className={`text-[13px] font-manrope-bold ${selectedSalesOfficer ? 'text-[#111827]' : 'text-[#9CA3AF]'}`} numberOfLines={1}>
                        {selectedSalesOfficer?.name || "Choose sales officer"}
                      </Text>
                      <Text className="text-[11px] font-manrope text-[#6B7280] mt-0.5" numberOfLines={1}>
                        {selectedSalesOfficer?.role || "Required before booking"}
                      </Text>
                    </View>
                  </View>
                  <Feather name={isOfficerDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#6B7280" />
                </Pressable>

                {isOfficerDropdownOpen && !usePreviousSalesOfficer && (
                  <View className="mt-2 bg-white border border-gray-200 rounded-2xl overflow-hidden">
                    {STATIC_SALES_OFFICERS.map((officer, index) => {
                      const isSelectedOfficer = officer.id === selectedSalesOfficerId;
                      return (
                        <Pressable
                          key={officer.id}
                          onPress={() => {
                            setSelectedSalesOfficerId(officer.id);
                            setIsOfficerDropdownOpen(false);
                          }}
                          className={`px-4 py-3.5 flex-row items-center justify-between ${index !== STATIC_SALES_OFFICERS.length - 1 ? 'border-b border-gray-100' : ''} ${isSelectedOfficer ? 'bg-[#F8F7FF]' : 'bg-white'}`}
                        >
                          <View className="flex-1 pr-3">
                            <Text className="text-[13px] font-manrope-bold text-[#111827]">{officer.name}</Text>
                            <Text className="text-[11px] font-manrope text-[#6B7280] mt-0.5">{officer.role}</Text>
                          </View>
                          {isSelectedOfficer && <Feather name="check-circle" size={17} color="#4A43EC" />}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Number of Visitors */}
          <View className="bg-[#F8F9FB] rounded-[18px] p-4 flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-[13px] font-manrope-bold text-[#111827] mb-0.5">Number of Visitors</Text>
              <Text className="text-[11px] font-manrope text-[#9CA3AF]">Including children</Text>
            </View>
            <View className="flex-row items-center bg-white border border-gray-200 rounded-full p-[2px]">
              <Pressable
                onPress={() => setVisitors(Math.max(1, visitors - 1))}
                className="w-7 h-7 items-center justify-center rounded-full border border-gray-200 bg-white"
              >
                <Feather name="minus" size={13} color={visitors > 1 ? "#4A43EC" : "#D1D5DB"} />
              </Pressable>
              <Text className="text-[13px] font-manrope-bold text-[#111827] w-7 text-center">{visitors}</Text>
              <Pressable
                onPress={() => setVisitors(visitors + 1)}
                className="w-7 h-7 bg-[#4A43EC] rounded-full items-center justify-center"
              >
                <Feather name="plus" size={13} color="white" />
              </Pressable>
            </View>
          </View>


          {/* Notes */}
          <View className="mb-4">
            <Text className="text-[13px] font-manrope-bold text-[#4B5563] mb-3">Notes / Special Requests</Text>
            <View className="bg-[#F8F9FB] rounded-[14px] p-3.5">
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="e.g. Would like to see the penthouse floor, coming with senior citizens..."
                placeholderTextColor="#9CA3AF"
                className="text-[13px] font-manrope text-[#111827] h-16"
                textAlignVertical="top"
                value={notes}
                onChangeText={setNotes}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 150);
                }}
              />
            </View>
          </View>
          <Pressable
            onPress={handleConfirmVisit}
            disabled={creating}
            className={`rounded-[16px] py-[15px] flex-row items-center justify-center mt-2 mb-2 ${creating ? 'bg-gray-400' : 'bg-[#4A43EC]'}`}
          >
            {creating ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Text className="text-white font-manrope-bold text-[15px] mr-2">
                  Confirm Site Visit
                </Text>
                <Feather name="arrow-right" size={16} color="white" />
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <PropertyDetailModal
        visible={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        project={detailModalData?.project}
        variant={detailModalData?.variant}
        readOnly
      />
    </View>
  );
}
