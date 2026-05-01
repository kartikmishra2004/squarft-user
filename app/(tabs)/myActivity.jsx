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
  const { properties, savedProperties } = useSelector((state) => state.properties);
  const savedCount = savedProperties.length; // Use API data
  const seenCount = properties.filter((p) => p.isSeen).length;
  const contactedCount = properties.filter((p) => p.isContacted).length;
  const recentCount = properties.filter((p) => p.isRecent).length;

  const TABS = [
    { id: "SAVED", title: "SAVED", icon: "heart", badge: savedCount.toString().padStart(2, '0'), count: savedCount },
    { id: "SEEN", title: "SEEN", icon: "eye", badge: seenCount.toString().padStart(2, '0'), count: seenCount },
    { id: "CONTACTED", title: "CONTACTED", icon: "phone-call", badge: contactedCount.toString().padStart(2, '0'), count: contactedCount },
    { id: "RECENT", title: "RECENT", icon: "clock", badge: recentCount.toString().padStart(2, '0'), count: recentCount },
  ];

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-2 pt-8">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            const primaryColor = "#4A43EC";
            const inactiveColor = "#D1D5DB";
            return (
              <Pressable
                key={tab.id}
                className="items-center pb-2 w-1/4 relative"
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.6}
              >
                <View className="relative">
                  <Feather name={tab.icon} size={20} color={isActive ? primaryColor : inactiveColor} />
                  {tab.count > 0 && (
                    <View
                      className="absolute -top-[4px] -right-[8px] bg-[#FF8A8A] rounded-full items-center justify-center z-10"
                      style={{ minWidth: 16, height: 16, paddingHorizontal: 4 }}
                    >
                      <Text className="text-white text-[8px] font-bold" style={{ lineHeight: 10, marginTop: Platform.OS === 'ios' ? 1 : 0 }}>{tab.badge}</Text>
                    </View>
                  )}
                </View>
                <Text
                  className="mt-1 text-[9px] font-bold tracking-widest"
                  style={{ color: isActive ? primaryColor : inactiveColor }}
                >
                  {tab.title}
                </Text>
                {isActive && <View className="absolute bottom-0 h-[2px] rounded-t-sm bg-[#4A43EC]" style={{ width: "65%" }} />}
              </Pressable>
            );
          })}
        </View>
        <View className="w-full h-[1px] bg-gray-100/30 " />
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