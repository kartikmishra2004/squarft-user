import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

const EmptyState = ({ type }) => {
  let titleText = "saved any";
  let iconName = "heart";
  let descriptionText = "Start exploring and save projects you love to see them here.";
  if (type === "CONTACTED") {
    titleText = "contacted any";
    iconName = "phone-call";
    descriptionText = "Start exploring and connect with projects you love to see them here.";
  } else if (type === "RECENT") {
    titleText = "viewed recent";
    iconName = "clock";
    descriptionText = "Start exploring to build your history of projects you love.";
  } else if (type === "SEEN") {
    titleText = "seen any";
    iconName = "eye";
    descriptionText = "Start exploring and view projects you love to see them here.";
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

export default EmptyState;
