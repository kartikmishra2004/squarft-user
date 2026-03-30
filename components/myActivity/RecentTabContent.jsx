import React from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import EmptyState from "./EmptyState";

const RECENT_PROPERTIES = [
  {
    id: "serenity_1",
    builder: "Prakrati Realtors Private Limited",
    zeroBrokerage: true,
    mainImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    sideImage: "https://images.unsplash.com/photo-1756435292384-1bf32eff7baf?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    imageCount: 28,
    possession: "Apr, 2027",
    avgPrice: "₹9.25k",
    title: "Serenity Reserve",
    isRera: true,
    location: "Scheme No 140, Indore",
    options: [
      { type: "3 BHK APARTMENT", price: "₹2.5 Cr - ₹2.6 Cr" },
      { type: "4 BHK APARTMENT", price: "₹3.5 Cr" },
    ]
  },
];

const RecentTabContent = () => {
  if (RECENT_PROPERTIES.length === 0) {
    return <EmptyState type="RECENT" />;
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />
      <View className="mt-4 px-4 mb-6">
        {RECENT_PROPERTIES.map((property, index) => (
          <View key={property.id + index} className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
            <View className="flex-row h-44 w-full">
              <View className="flex-[2] relative bg-gray-200 border-r-2 border-white">
                <Image source={{ uri: property.mainImage }} className="w-full h-full" resizeMode="cover" />
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
                <Image source={{ uri: property.sideImage }} className="w-full h-full" resizeMode="cover" />
                <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-[2px] rounded">
                  <Text className="text-white text-[10px] font-manrope">1/{property.imageCount}</Text>
                </View>
              </View>
            </View>
            <View className="px-4 pt-4 pb-3">
              <Text className="text-[11px] text-[#6B7280] font-manrope mb-[6px]">
                Possession: {property.possession}  •  Avg Price per sq ft: {property.avgPrice}
              </Text>
              <View className="flex-row items-center mb-1">
                <Text className="text-[17px] font-manrope-extrabold text-[#111827]">{property.title}</Text>
                {property.isRera && (
                  <View className="flex-row items-center bg-[#E5F7F1] px-[6px] py-[2px] rounded ml-3">
                    <Text className="text-[#00B67A] text-[9px] font-manrope-extrabold mr-1">RERA</Text>
                    <View className="w-[10px] h-[10px] bg-[#00B67A] rounded-full items-center justify-center">
                      <Feather name="check" size={7} color="white" />
                    </View>
                  </View>
                )}
              </View>
              <Text className="text-[12px] text-[#9CA3AF] font-manrope">{property.location}</Text>
            </View>
            <View className="mx-4 mb-3" style={{ borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#E5E7EB' }} />
            <View className="flex-row justify-between px-4 pb-4">
              <View>
                <Text className="text-[10px] text-[#9CA3AF] font-manrope-extrabold uppercase tracking-wide">{property.options[0].type}</Text>
                <Text className="text-[15px] font-manrope-extrabold text-[#111827] mt-1">{property.options[0].price}</Text>
              </View>
              <View className="items-end">
                <Text className="text-[10px] text-[#9CA3AF] font-manrope-extrabold uppercase tracking-wide">{property.options[1].type}</Text>
                <Text className="text-[15px] font-manrope-extrabold text-[#111827] mt-1">{property.options[1].price}</Text>
              </View>
            </View>
            <View className="px-4 pb-4">
              <Pressable className="w-full border border-[#4A43EC] rounded-xl py-3 items-center justify-center">
                <Text className="text-[#4A43EC] font-manrope-extrabold text-[14px]">View details</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
      <View className="px-4">
        <View className="flex-row justify-between items-center mb-5">
          <Text className="text-[16px] font-manrope-extrabold text-[#111827]">{RECENT_PROPERTIES.length} Recent Properties</Text>
          <Pressable className="w-[36px] h-[36px] rounded-full border border-gray-200 items-center justify-center">
            <Feather name="share-2" size={16} color="#4B5563" />
          </Pressable>
        </View>
        <View className="bg-[#F4F2FF] rounded-2xl p-5 mb-8">
          <Text className="text-[15px] font-manrope-extrabold text-[#111827] mb-2">Personalise your home search journey!</Text>
          <Text className="text-[13px] text-[#6B7280] font-manrope leading-[18px] mb-5 w-[75%]">
            Enhance your search{"\n"}experience with just 3 quick{"\n"}answers.
          </Text>
          <Pressable className="self-start border border-[#4A43EC] rounded-xl px-5 py-[10px] bg-white">
            <Text className="text-[#4A43EC] font-manrope-extrabold text-[13px]">Let's begin</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default RecentTabContent;
