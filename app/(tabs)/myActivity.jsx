import React, { useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";

import SavedTabContent from "../../components/myActivity/SavedTabContent";
import SeenTabContent from "../../components/myActivity/SeenTabContent";
import ContactedTabContent from "../../components/myActivity/ContactedTabContent";
import RecentTabContent from "../../components/myActivity/RecentTabContent";

export default function Favourite() {
  const [activeTab, setActiveTab] = useState("SAVED");
  const { properties } = useSelector((state) => state.properties);
  const savedCount = properties.filter((p) => p.isFavourite).length;

  const TABS = [
    { id: "SAVED", title: "SAVED", icon: "heart", badge: savedCount.toString().padStart(2, '0') },
    { id: "SEEN", title: "SEEN", icon: "eye", badge: "06" },
    { id: "CONTACTED", title: "CONTACTED", icon: "phone-call", badge: "02" },
    { id: "RECENT", title: "RECENT", icon: "clock", badge: "10" },
  ];

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
          {activeTab === "SAVED" && <SavedTabContent />}
          {activeTab === "SEEN" && <SeenTabContent />}
          {activeTab === "CONTACTED" && <ContactedTabContent />}
          {activeTab === "RECENT" && <RecentTabContent />}
        </View>
      </View>
    </View>
  );
}