import React, { useState } from "react";
import { View, Text, Pressable, Platform, ScrollView, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

const TABS = [
  { id: "SAVED", title: "SAVED", icon: "heart", badge: "01" },
  { id: "SEEN", title: "SEEN", icon: "eye", badge: "06" },
  { id: "CONTACTED", title: "CONTACTED", icon: "phone-call", badge: "02" },
  { id: "RECENT", title: "RECENT", icon: "clock", badge: "10" },
];

const SEEN_PROPERTIES = [
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
  }
];

const SeenTabContent = () => {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />
      <View className="mt-4 px-4 mb-6">
        {SEEN_PROPERTIES.map((property) => (
          <View key={property.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
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
          <Text className="text-[16px] font-manrope-extrabold text-[#111827]">1 Saved Properties</Text>
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

const EmptyState = ({ type }) => {
  let titleText = "saved any";
  let iconName = "heart";
  let descriptionText = "Start exploring and save projects you loveto see them here.";
  if (type === "CONTACTED") {
    titleText = "contacted any";
    iconName = "phone-call";
    descriptionText = "Start exploring and connect with projects you loveto see them here.";
  } else if (type === "RECENT") {
    titleText = "viewed recent";
    iconName = "clock";
    descriptionText = "Start exploring to build your history ofprojects you love.";
  }
  return (
    <View className="flex-1 items-center justify-center px-6 -mt-40">
      <View className="relative w-64 h-64 items-center justify-center mb-6">
        <View
          className="absolute top-4 right-0 w-10 h-10 bg-[#E0D7FF] opacity-50 rounded-xl z-10"
          style={{ transform: [{ rotate: "15deg" }] }}
        />
        <View className="absolute bottom-6 left-4 w-[48px] h-[48px] bg-[#EAE2FF] opacity-50 rounded-full z-10" />
        <View
          className="w-[180px] h-[180px] bg-white rounded-full items-center justify-center"
          style={{ shadowColor: "#4A43EC", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.2, shadowRadius: 36, elevation: 10 }}
        >
          <Feather name={iconName} size={64} color="#4A43EC" style={{ strokeWidth: 1.5 }} />
          <View className="w-10 h-1 bg-[#E2DAFF] rounded-full mt-6" />
        </View>
      </View>
      <Text className="text-xl font-manrope-extrabold text-[#111827] text-center mb-3 leading-7">
        You haven’t {titleText}{"\n"}projects yet
      </Text>
      <Text className="text-md font-manrope font-medium text-[#9CA3AF] text-center mb-10 leading-[22px] px-2">
        {descriptionText}
      </Text>
      <Pressable
        className="w-[75%] bg-[#4A43EC] rounded-2xl py-[18px] flex-row justify-center items-center"
        activeOpacity={0.8}
        style={{ shadowColor: "#4A43EC", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 10 }}
      >
        <Feather name="compass" size={18} color="white" />
        <Text className="text-white font-manrope-extrabold text-[15px] font-bold ml-2">Start Exploring</Text>
      </Pressable>
    </View>
  );
};

export default function Favourite() {
  const [activeTab, setActiveTab] = useState("SEEN");
  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-2 pt-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const primaryColor = "#4A43EC";
            const inactiveColor = "#D1D5DB";
            return (
              <Pressable
                key={tab.id}
                className="items-center pb-3 w-1/4 relative"
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.6}
              >
                <View className="relative">
                  <Feather name={tab.icon} size={26} color={isActive ? primaryColor : inactiveColor} />
                  <View
                    className="absolute -top-[6px] -right-[12px] bg-[#FF8A8A] rounded-full items-center justify-center z-10"
                    style={{ minWidth: 20, height: 20, paddingHorizontal: 4 }}
                  >
                    <Text className="text-white text-[10px] font-bold" style={{ lineHeight: 12, marginTop: Platform.OS === 'ios' ? 2 : 0 }}>{tab.badge}</Text>
                  </View>
                </View>
                <Text
                  className="mt-3 text-[10px] font-bold tracking-widest"
                  style={{ color: isActive ? primaryColor : inactiveColor }}
                >
                  {tab.title}
                </Text>
                {isActive && <View className="absolute bottom-0 h-[2px] rounded-t-sm bg-[#4A43EC]" style={{ width: "65%" }} />}
              </Pressable>
            );
          })}
        </View>
        <View className="w-full h-[1px] bg-gray-100/60" />
        <View className="flex-1">
          {activeTab === "SEEN" ? <SeenTabContent /> : <EmptyState type={activeTab} />}
        </View>
      </View>
    </View>
  );
}