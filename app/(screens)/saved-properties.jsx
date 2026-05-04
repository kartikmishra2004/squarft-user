import React, { useEffect } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { router } from "expo-router";
import { fetchSavedPropertiesThunk } from "../../store/slices/propertiesSlice";
import { PropertyCardSkeleton } from "../../components/SkeletonLoader";

export default function SavedProperties() {
  const dispatch = useDispatch();
  const { savedProperties, loading } = useSelector((state) => state.properties);
  const { isLoggedIn, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn && token) {
      dispatch(fetchSavedPropertiesThunk());
    }
  }, [isLoggedIn, token, dispatch]);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="pt-14 pb-4 px-5 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3">
            <Feather name="arrow-left" size={24} color="#111827" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-xl font-manrope-bold text-gray-900">Saved Projects</Text>
            {!loading && (
              <Text className="text-sm text-gray-500 font-manrope">
                {savedProperties.length} {savedProperties.length === 1 ? 'property' : 'properties'}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4 pt-4">
          {loading ? (
            [1, 2, 3].map(i => <PropertyCardSkeleton key={i} />)
          ) : savedProperties.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Feather name="bookmark" size={64} color="#D1D5DB" />
              <Text className="text-gray-900 text-lg font-manrope-bold mt-4">No Saved Properties</Text>
              <Text className="text-gray-500 text-center mt-2 font-manrope px-8">
                Start saving properties you like to view them here
              </Text>
              <Pressable
                onPress={() => router.push('/(tabs)/home')}
                className="mt-6 bg-[#4A43EC] px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-manrope-bold">Explore Properties</Text>
              </Pressable>
            </View>
          ) : (
            savedProperties.map((property, index) => (
              <View key={property.id + index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
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
                    {property.images && property.images.length > 1 ? (
                      <Image source={{ uri: property.images[1] }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <View className="w-full h-full bg-gray-100 items-center justify-center">
                        <Feather name="image" size={24} color="#D1D5DB" />
                      </View>
                    )}
                    <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-[2px] rounded">
                      <Text className="text-white text-[10px] font-manrope">1/{property.total_images || 1}</Text>
                    </View>
                  </View>
                </View>
                <View className="px-3 pt-3 pb-2">
                  <Text className="text-[10px] text-[#6B7280] font-manrope mb-[4px]">
                    {property.area}, {property.city}  •  {property.bedrooms} BHK
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
                      {property.bedrooms} BHK • {property.total_area_sqft} sqft
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
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
