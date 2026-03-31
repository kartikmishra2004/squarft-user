import React from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useSelector } from "react-redux";
import { router } from "expo-router";
import EmptyState from "./EmptyState";

const RecentTabContent = () => {
  const { properties } = useSelector((state) => state.properties);
  const RECENT_PROPERTIES = properties.filter((p) => p.isRecent);

  if (RECENT_PROPERTIES.length === 0) {
    return <EmptyState type="RECENT" />;
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />
      <View className="mt-4 px-4 mb-6">
        {RECENT_PROPERTIES.map((property, index) => (
          <View key={property.id + index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
            <View className="flex-row h-36 w-full">
              <View className="flex-[2] relative bg-gray-200 border-r-2 border-white">
                <Image source={property.image} className="w-full h-full" resizeMode="cover" />
                <View className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded">
                  <Text className="text-white text-[10px] font-manrope">{property.builder}</Text>
                </View>
                {property.zeroBrokerage && (
                  <View className="absolute bottom-2 left-2 bg-[#00B67A] px-2 py-[4px] rounded">
                    <Text className="text-white text-[10px] font-manrope-extrabold tracking-wide">ZERO BROKERAGE</Text>
                  </View>
                )}
              </View>
              <View className="flex-[1] relative bg-gray-200">
                <Image source={property.imageThumb} className="w-full h-full" resizeMode="cover" />
                <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-[2px] rounded">
                  <Text className="text-white text-[10px] font-manrope">1/{property.totalImages}</Text>
                </View>
              </View>
            </View>
            <View className="px-3 pt-3 pb-2">
              <Text className="text-[10px] text-[#6B7280] font-manrope mb-[4px]">
                Possession: {property.possession}  •  Avg Price: {property.avgPricePerSqft}
              </Text>
              <View className="flex-row items-center mb-1">
                <Text className="text-[15px] font-manrope-extrabold text-[#111827]">{property.title}</Text>
                {property.rera && (
                  <View className="flex-row items-center bg-[#E5F7F1] px-[6px] py-[2px] rounded ml-2">
                    <Text className="text-[#00B67A] text-[8px] font-manrope-extrabold mr-1">RERA</Text>
                    <View className="w-[8px] h-[8px] bg-[#00B67A] rounded-full items-center justify-center">
                      <Feather name="check" size={6} color="white" />
                    </View>
                  </View>
                )}
              </View>
              <Text className="text-[11px] text-[#9CA3AF] font-manrope">{property.location}</Text>
            </View>
            <View className="mx-3 mb-2" style={{ borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#E5E7EB' }} />
            <View className="flex-row justify-between px-3 pb-3">
              <View>
                <Text className="text-[9px] text-[#9CA3AF] font-manrope-extrabold uppercase tracking-wide">{property.variants[0]?.type}</Text>
                <Text className="text-[14px] font-manrope-extrabold text-[#111827] mt-1">{property.variants[0]?.priceRange}</Text>
              </View>
              {property.variants[1] && (
                <View className="items-end">
                  <Text className="text-[9px] text-[#9CA3AF] font-manrope-extrabold uppercase tracking-wide">{property.variants[1].type}</Text>
                  <Text className="text-[14px] font-manrope-extrabold text-[#111827] mt-1">{property.variants[1].priceRange}</Text>
                </View>
              )}
            </View>
            <View className="px-3 pb-3">
              <Pressable
                onPress={() => router.push({ pathname: "/(screens)/project-detail", params: { id: property.id } })}
                className="w-full border border-[#4A43EC] rounded-xl py-2 items-center justify-center"
              >
                <Text className="text-[#4A43EC] font-manrope-extrabold text-[13px]">View details</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      <View className="px-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-[15px] font-manrope-extrabold text-[#111827]">{RECENT_PROPERTIES.length} Recent Properties</Text>
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

export default RecentTabContent;
