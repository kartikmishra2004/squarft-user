import { useEffect } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSelector, useDispatch } from "react-redux";
import { router } from "expo-router";
import EmptyState from "./EmptyState";
import { fetchContactedPropertiesThunk } from "../../store/slices/propertiesSlice";
import { PropertyCardSkeleton } from "../SkeletonLoader";

const STATUS_COLORS = {
  pending:   { bg: '#FEF3C7', text: '#92400E' },
  confirmed: { bg: '#D1FAE5', text: '#065F46' },
  completed: { bg: '#DBEAFE', text: '#1E40AF' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B' },
};

const ContactedTabContent = () => {
  const dispatch = useDispatch();
  const { contactedProperties, loading } = useSelector((state) => state.properties);
  const { isLoggedIn, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn && token) {
      dispatch(fetchContactedPropertiesThunk());
    }
  }, [isLoggedIn, token, dispatch]);

  if (loading) {
    return (
      <View className="flex-1 bg-white pt-10 px-4">
        {[1, 2, 3].map(i => <PropertyCardSkeleton key={i} />)}
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Feather name="log-in" size={48} color="#D1D5DB" />
        <Text className="text-gray-900 text-lg font-bold mt-4">Login Required</Text>
        <Text className="text-gray-500 text-center mt-2">Please login to view your contacted properties</Text>
        <Pressable
          onPress={() => router.push('/(auth)/login')}
          className="mt-6 bg-[#4A43EC] px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold">Login Now</Text>
        </Pressable>
      </View>
    );
  }

  if (contactedProperties.length === 0) {
    return <EmptyState type="CONTACTED" />;
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />
      <View className="mt-10 px-4 mb-6">
        {contactedProperties.map((property, index) => {
          const statusStyle = STATUS_COLORS[property.booking_status] || STATUS_COLORS.pending;
          return (
            <View key={property.id + index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-10">
              <View className="flex-row h-36 w-full">
                <View className="flex-[2] relative bg-gray-200 border-r-2 border-white">
                  {property.cover_image ? (
                    <Image source={{ uri: property.cover_image }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <View className="w-full h-full bg-gray-200 items-center justify-center">
                      <Feather name="image" size={32} color="#9CA3AF" />
                    </View>
                  )}
                  <View className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded">
                    <Text className="text-white text-[10px] font-manrope">{property.type || 'Property'}</Text>
                  </View>
                </View>
                <View className="flex-[1] relative bg-gray-200">
                  <View className="w-full h-full bg-gray-100 items-center justify-center">
                    <Feather name="image" size={24} color="#D1D5DB" />
                  </View>
                  {/* Booking status badge */}
                  {property.booking_status && (
                    <View className="absolute top-2 right-2 px-2 py-1 rounded" style={{ backgroundColor: statusStyle.bg }}>
                      <Text className="text-[9px] font-manrope-extrabold capitalize" style={{ color: statusStyle.text }}>
                        {property.booking_status}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View className="px-3 pt-3 pb-2">
                <Text className="text-[10px] text-[#6B7280] font-manrope mb-[4px]">
                  {property.area}, {property.city}
                  {property.bedrooms ? `  •  ${property.bedrooms} BHK` : ''}
                </Text>
                <View className="flex-row items-center mb-1">
                  <Text className="text-[15px] font-manrope-extrabold text-[#111827]">{property.title}</Text>
                  {property.rera_id && (
                    <View className="flex-row items-center bg-[#E5F7F1] px-[6px] py-[2px] rounded ml-2">
                      <Text className="text-[#00B67A] text-[8px] font-manrope-extrabold mr-1">RERA</Text>
                      <View className="w-[8px] h-[8px] bg-[#00B67A] rounded-full items-center justify-center">
                        <Feather name="check" size={6} color="white" />
                      </View>
                    </View>
                  )}
                </View>
                <Text className="text-[11px] text-[#9CA3AF] font-manrope">{property.pincode}</Text>
              </View>

              <View className="mx-3 mb-2" style={{ borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#E5E7EB' }} />

              <View className="flex-row justify-between px-3 pb-3">
                <View>
                  <Text className="text-[9px] text-[#9CA3AF] font-manrope-extrabold uppercase tracking-wide">
                    {property.bedrooms ? `${property.bedrooms} BHK` : property.type || 'Property'}
                    {property.total_area_sqft ? ` • ${property.total_area_sqft} sqft` : ''}
                  </Text>
                  <Text className="text-[14px] font-manrope-extrabold text-[#111827] mt-1">
                    {property.min_price ? `₹${(property.min_price / 100000).toFixed(1)}L` : 'Price on request'}
                  </Text>
                </View>
              </View>

              <View className="px-3 pb-3">
                <Pressable
                  onPress={() => router.push({ pathname: "/(screens)/project-detail", params: { id: property.id, slug: property.slug } })}
                  className="w-full border border-[#4A43EC] rounded-xl py-2 items-center justify-center"
                >
                  <Text className="text-[#4A43EC] font-manrope-extrabold text-[13px]">View details</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      <View className="px-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[15px] font-manrope-extrabold text-[#111827]">{contactedProperties.length} Contacted Properties</Text>
          <Pressable className="w-[32px] h-[32px] rounded-full border border-gray-200 items-center justify-center">
            <Feather name="share-2" size={14} color="#4B5563" />
          </Pressable>
        </View>
        <View className="bg-[#F4F2FF] rounded-xl p-4 mb-6">
          <Text className="text-[14px] font-manrope-extrabold text-[#111827] mb-1">Personalise your home search journey!</Text>
          <Text className="text-[12px] text-[#6B7280] font-manrope leading-[16px] mb-4 w-[85%]">
            Enhance your search{"\n"}experience with just 3 quick{"\n"}answers.
          </Text>
          <Pressable className="self-start border border-[#4A43EC] rounded-xl px-4 py-[8px] bg-white">
            <Text className="text-[#4A43EC] font-manrope-extrabold text-[12px]">Let's begin</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default ContactedTabContent;
