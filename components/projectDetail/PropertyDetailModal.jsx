import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addSiteVisit,
  toggleFavourite,
} from "../../store/slices/propertiesSlice";
import ZoomableImage from "./ZoomableImage";

const naksha = require("../../assets/images/building_naksha.png");

const { width } = Dimensions.get("window");

const cardShadow = {
  shadowColor: "#6B7280",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.07,
  shadowRadius: 4,
  elevation: 2,
};

const AMENITY_ICONS = {
  Gymnasium: { icon: "dumbbell", color: "#4A43EC" },
  "Swimming Pool": { icon: "pool", color: "#4A43EC" },
  "24/7 Security": { icon: "shield-check-outline", color: "#4A43EC" },
  "Power Backup": { icon: "lightning-bolt", color: "#4A43EC" },
  Landscaping: { icon: "tree-outline", color: "#4A43EC" },
  "Car Parking": { icon: "car-outline", color: "#4A43EC" },
  "Sports Court": { icon: "tennis", color: "#4A43EC" },
  "Wi-Fi Zone": { icon: "wifi", color: "#4A43EC" },
  Clubhouse: { icon: "home-group", color: "#4A43EC" },
  Garden: { icon: "flower-outline", color: "#4A43EC" },
};

function AmenityItem({ label }) {
  const config = AMENITY_ICONS[label] ?? {
    icon: "star-outline",
    color: "#003D9B",
  };
  return (
    <View className="flex-row items-center gap-3 w-[50%] mb-4">
      <View className="w-10 h-10 rounded-[14px] bg-[#F1F3FF] items-center justify-center">
        <MaterialCommunityIcons
          name={config.icon}
          size={18}
          color={config.color}
        />
      </View>
      <Text className="text-[13px] font-manrope-medium text-[#101010] flex-1">
        {label}
      </Text>
    </View>
  );
}

export default function PropertyDetailModal({
  visible,
  onClose,
  project,
  variant,
}) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const bookedVisits = useSelector((s) => s.properties.bookedSiteVisits);
  const savedProjects = useSelector((s) => s.properties.favouriteProjects);
  const isSaved = savedProjects.includes(project?.id);
  const [floorPlanVisible, setFloorPlanVisible] = useState(false);
  const [zoomVisible, setZoomVisible] = useState(false);
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) {
          Animated.timing(translateY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  if (!project || !variant) return null;

  // Safety check for variant.type
  const variantType = variant.type || variant.title || "Property";
  const variantId = `${project.id}_${variantType.replace(/\s+/g, "_")}`;
  const isAdded = bookedVisits.some((v) => v.id === variantId);
  
  // Handle amenities - can be array of strings or array of objects
  const amenitiesList = project.amenities 
    ? project.amenities.map(a => typeof a === 'string' ? a : a.name)
    : ["Gymnasium", "Swimming Pool", "24/7 Security", "Power Backup"];

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          <TouchableOpacity
            className="flex-1"
            activeOpacity={1}
            onPress={onClose}
          />
          <Animated.View
            className="bg-white rounded-t-3xl"
            style={{ maxHeight: "88%", transform: [{ translateY }] }}
          >
            {/* Handle - swipe target */}
            <View
              {...panResponder.panHandlers}
              className="items-center pt-4 pb-6"
            >
              <View className="w-20 h-1.5 bg-gray-300 rounded-full" />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              className="mx-5 rounded-2xl mb-5 border border-gray-300"
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {/* Hero Image - full width, no padding */}
              <View style={{ height: 145, overflow: "hidden" }}>
                {/* Split: main image left, thumb right */}
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <Image
                    source={project.imageMain}
                    style={{ flex: 1.4, height: 145 }}
                    resizeMode="cover"
                  />
                  <View style={{ width: 2, backgroundColor: "#fff" }} />
                  <View style={{ flex: 1, height: 145, position: "relative" }}>
                    <Image
                      source={project.imageThumb ?? project.imageMain}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="cover"
                    />
                    <View
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        backgroundColor: "rgba(0,0,0,0.55)",
                        borderRadius: 6,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 10,
                          fontWeight: "700",
                        }}
                      >
                        1/{project.totalImages ?? 10}
                      </Text>
                    </View>
                  </View>
                </View>
                {/* Squarft Verified badge */}
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderRadius: 30,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    gap: 3,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={16}
                    color="#0052CC"
                  />
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: "#0052CC",
                      letterSpacing: 0.2,
                    }}
                  >
                    SQUARFT VERIFIED
                  </Text>
                </View>
                {/* Save icon */}
                <TouchableOpacity
                  onPress={() => dispatch(toggleFavourite(project.id))}
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 20,
                    padding: 6,
                  }}
                >
                  <Ionicons
                    name={isSaved ? "heart" : "heart-outline"}
                    size={24}
                    color={isSaved ? "#EF4444" : "#fff"}
                  />
                </TouchableOpacity>
              </View>

              {/* Possession + Avg price */}
              <View className="flex-row items-center gap-5 mx-5 mt-3 mb-3.5">
                <Text className="text-[12px] font-manrope-regular text-gray-500">
                  Possession: {project.possession}
                </Text>

                <Text className="text-[12px] font-manrope-regular text-gray-500">
                  • Avg Price per sq ft: {project.avgPricePerSqft}
                </Text>
              </View>
              <View
                style={{
                  marginHorizontal: 20,
                  marginBottom: 9,
                  borderBottomWidth: 1,
                  borderBottomColor: "#D1D5DB",
                  borderStyle: "dashed",
                }}
              />

              {/* BHK + Price + Floor Plan toggle */}
              <View className="mx-5 mb-2">
                <View className="flex-row items-center justify-between mb-2">
                  <View>
                    <Text className="text-[12px] font-manrope-bold text-gray-500">
                      {variantType}
                    </Text>
                    <Text className="text-[16px] font-manrope-extrabold text-[#0F172A]">
                      {variant.priceRange || variant.price || "Contact for price"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setFloorPlanVisible((v) => !v)}
                    className="flex-row items-center gap-1.5 rounded-xl px-3 py-3"
                    style={{
                      backgroundColor: floorPlanVisible ? "#4A43EC" : "#DAE2FF",
                    }}
                  >
                    <MaterialCommunityIcons
                      name="floor-plan"
                      size={14}
                      color={floorPlanVisible ? "#fff" : "#4A43EC"}
                    />
                    <Text
                      className="text-[12px] font-manrope-bold"
                      style={{ color: floorPlanVisible ? "#fff" : "#4A43EC" }}
                    >
                      {floorPlanVisible ? "Hide Floor Plan" : "See Floor Plan"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Inline floor plan */}
                {floorPlanVisible && (
                  <View
                    className="mt-2 rounded-2xl overflow-hidden bg-[#F8FAFC] items-center py-5"
                    style={{ borderWidth: 1, borderColor: "#E0E8FF" }}
                  >
                    <TouchableOpacity
                      onPress={() => setZoomVisible(true)}
                      activeOpacity={0.85}
                    >
                      <Image
                        source={naksha}
                        style={{ width: width * 0.75, height: 200 }}
                        resizeMode="contain"
                      />
                      <View
                        style={{
                          position: "absolute",
                          bottom: 6,
                          right: 6,
                          backgroundColor: "rgba(0,0,0,0.45)",
                          borderRadius: 12,
                          padding: 5,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="magnify-plus-outline"
                          size={16}
                          color="#fff"
                        />
                      </View>
                    </TouchableOpacity>
                    <Text className="text-[11px] font-manrope-regular text-gray-400 mt-2">
                      {variantType} · {project.areaSqft} sq.ft.
                    </Text>
                  </View>
                )}
              </View>

              <ZoomableImage
                visible={zoomVisible}
                onClose={() => setZoomVisible(false)}
                source={naksha}
              />

              {/* Stats grid */}
              <View className="flex-row flex-wrap mx-4 justify-between mb-3 mt-4">
                {[
                  { label: "AREA", value: `${project.areaSqft} sq.ft.` },
                  { label: "POSSESSION", value: project.possession },
                  { label: "TOWER", value: project.towers ?? "3" },
                  {
                    label: "INVENTORY",
                    value: project.inventory ?? `${project.units ?? 50} of 150`,
                  },
                ].map((item) => (
                  <View
                    key={item.label}
                    className="bg-[#F1F3FF] border border-[#E0E8FF] rounded-2xl p-4 py-4 mb-4"
                    style={{ width: (width - 68) / 2 - 6 }}
                  >
                    <Text className="text-[10px] font-manrope-bold text-gray-400 tracking-widest">
                      {item.label}
                    </Text>
                    <Text className="text-[16px] font-manrope-bold text-[#041B3C]">
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Amenities */}
              <View className="mx-4 bg-white border border-gray-100 rounded-2xl p-4 px-5 mb-2">
                <Text className="text-[15px] font-manrope-regular text-[#1A1A1A] mb-4">
                  World-Class Amenities
                </Text>
                <View className="flex-row flex-wrap">
                  {amenitiesList.map((a, i) => (
                    <AmenityItem key={i} label={a} />
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* CTA - fixed at bottom outside scroll */}
            <View
              className="px-5 pt-3 border-t border-gray-100"
              style={{ paddingBottom: 8 }}
            >
              <TouchableOpacity
                onPress={() => {
                  if (!isAdded) {
                    dispatch(
                      addSiteVisit({
                        id: variantId,
                        projectId: project.id,
                        name: project.name,
                        location: project.location,
                        image: project.imageMain,
                        variant: variantType,
                        price: variant.priceRange || variant.price,
                      }),
                    );
                  }
                  onClose();
                }}
                className="rounded-2xl py-4 items-center flex-row justify-center gap-2"
                style={{ backgroundColor: isAdded ? "#22C55E" : "#4A43EC" }}
              >
                <MaterialCommunityIcons
                  name={isAdded ? "check-circle-outline" : "calendar-plus"}
                  size={18}
                  color="#fff"
                />
                <Text className="text-white text-[15px] font-manrope-bold">
                  {isAdded ? "Added to Site Visit" : "Add To Site Visit"}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
}
