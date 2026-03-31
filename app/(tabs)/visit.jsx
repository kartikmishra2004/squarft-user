import React, { useState, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import RescheduleBottomSheet from "../../components/visit/RescheduleBottomSheet";
import { Link } from "expo-router";

const PAST_VISITS_DATA = [
  {
    id: "p1",
    status: "COMPLETED",
    title: "SquarFT Prestige Towers",
    location: "Sector 62, Gurgaon",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    dateFull: "Mon, 5th June | 11:00 AM",
  },
  {
    id: "p2",
    status: "CANCELLED",
    title: "The Zenith Residency",
    location: "Golf Course Road, Gurgaon",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    dateFull: "Sat, 1st June | 02:30 PM",
  }
];

const VISITS_DATA = [
  {
    id: "v1",
    status: "SCHEDULED",
    title: "SquarFT Prestige Towers",
    location: "Sector 62, Gurgaon",
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    dateFull: "Wed, 12th June | 10:30 AM",
  },
  {
    id: "v2",
    status: "CONFIRMED",
    title: "The Zenith Residency",
    location: "Golf Course Road, Gurgaon",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    dateFull: "Fri, 14th June | 04:00 PM",
  }
];

export default function Visit() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const bottomSheetModalRef = useRef(null);

  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const [sheetContent, setSheetContent] = useState('edit');

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-row items-center pt-2 mx-4">
        {["Upcoming", "Past"].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              className="flex-1 items-center py-3 relative"
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`text-[14px] font-manrope-bold ${isActive ? "text-[#4A43EC]" : "text-[#9CA3AF]"
                  }`}
              >
                {tab}
              </Text>
              {isActive && (
                <View className="absolute bottom-0 h-[2px] w-full bg-[#4A43EC]" />
              )}
            </Pressable>
          );
        })}
      </View>
      <View className="mx-4 h-[1px] bg-gray-100" />

      <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {activeTab === "Upcoming" && (
          <>
            <View className="mx-4 mt-4 bg-[#F8F7FF] rounded-[16px] border border-[#EBE9FF] p-[10px] flex-row items-center mb-1">
              <View className="w-[40px] h-[40px] bg-[#4A43EC] rounded-[12px] items-center justify-center mr-3">
                <Feather name="award" size={20} color="white" />
              </View>
              <View className="flex-1 justify-center">
                <Text className="text-[14px] font-manrope-extrabold text-[#4A43EC] mb-[2px]">
                  1 Property in deal
                </Text>
                <Text className="text-[11px] font-manrope font-medium text-[#948FF2]">
                  See the update
                </Text>
              </View>
              <Pressable className="bg-[#6A64F1] px-4 py-[8px] rounded-xl">
                <Text className="text-white text-[11px] font-manrope-extrabold">VIEW</Text>
              </Pressable>
            </View>

            {VISITS_DATA.map((visit) => (
              <View key={visit.id} className="mx-4 mt-4 bg-white rounded-[16px] border border-gray-200 overflow-hidden shadow-sm" style={{ elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }}>
                <View className="p-[14px]">
                  <View className="flex-row mb-3">
                    <Image
                      source={{ uri: visit.image }}
                      className="w-[72px] h-[72px] rounded-[8px] mr-3"
                      resizeMode="cover"
                    />
                    <View className="flex-1 justify-center py-1">
                      <View className="bg-[#EEECFF] self-start px-[8px] py-[4px] rounded-lg mb-[6px]">
                        <Text className="text-[#4A43EC] text-[9px] font-manrope-extrabold tracking-widest uppercase">
                          {visit.status}
                        </Text>
                      </View>
                      <Text className="text-[15px] font-manrope-extrabold text-[#111827] mb-[2px] leading-5" numberOfLines={1}>
                        {visit.title}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Feather name="map-pin" size={12} color="#9CA3AF" />
                        <Text className="text-[#6B7280] text-[11px] font-manrope ml-1" numberOfLines={1}>
                          {visit.location}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View className="mx-[-14px] mb-3" style={{ height: 1, backgroundColor: '#F3F4F6' }} />

                  <View className="mb-[12px]">
                    <Text className="text-[10px] text-[#9CA3AF] font-manrope-extrabold tracking-[1px] uppercase mb-[2px]">
                      DATE & TIME
                    </Text>
                    <Text className="text-[13px] font-manrope-extrabold text-[#374151]">
                      {visit.dateFull}
                    </Text>
                  </View>

                  <View className="flex-row justify-between w-full">
                    <Pressable className="flex-1 bg-[#4A43EC] rounded-xl py-[10px] flex-row items-center justify-center mr-2">
                      <Feather name="corner-up-right" size={14} color="white" />
                      <Text className="text-white font-manrope-extrabold text-[13px] ml-2">
                        Get Directions
                      </Text>
                    </Pressable>
                    <Pressable
                      className="flex-1 bg-[#F4F2FF] rounded-xl py-[10px] flex-row items-center justify-center ml-2"
                      onPress={() => {
                        setSheetContent('edit');
                        openModal();
                      }}
                    >
                      <Feather name="calendar" size={14} color="#4A43EC" />
                      <Text className="text-[#4A43EC] font-manrope-extrabold text-[13px] ml-2">
                        Reschedule
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {activeTab === "Past" && (
          <View className="mt-1">
            {PAST_VISITS_DATA.map((visit) => {
              const isCompleted = visit.status === "COMPLETED";
              return (
                <View key={visit.id} className="mx-4 mt-4 bg-white rounded-[16px] border border-gray-200 overflow-hidden shadow-sm" style={{ elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } }}>
                  <View className="p-[14px]">
                    <View className="flex-row mb-3">
                      <Image
                        source={{ uri: visit.image }}
                        className="w-[72px] h-[72px] rounded-[8px] mr-3"
                        resizeMode="cover"
                      />
                      <View className="flex-1 justify-center py-1">
                        <View className={`self-start px-[8px] py-[4px] rounded-lg mb-[6px] ${isCompleted ? 'bg-[#E5F7F1]' : 'bg-[#FEE2E2]'
                          }`}>
                          <Text className={`text-[9px] font-manrope-extrabold tracking-widest uppercase ${isCompleted ? 'text-[#00B67A]' : 'text-[#EF4444]'
                            }`}>
                            {visit.status}
                          </Text>
                        </View>
                        <Text className="text-[15px] font-manrope-extrabold text-[#111827] mb-[2px] leading-5" numberOfLines={1}>
                          {visit.title}
                        </Text>
                        <View className="flex-row items-center mt-1">
                          <Feather name="map-pin" size={12} color="#9CA3AF" />
                          <Text className="text-[#6B7280] text-[11px] font-manrope ml-1" numberOfLines={1}>
                            {visit.location}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="mx-[-14px] mb-3" style={{ height: 1, backgroundColor: '#F3F4F6' }} />

                    <View className="mb-[12px]">
                      <Text className="text-[10px] text-[#9CA3AF] font-manrope-extrabold tracking-[1px] uppercase mb-[2px]">
                        DATE & TIME
                      </Text>
                      <Text className="text-[13px] font-manrope-extrabold text-[#374151]">
                        {visit.dateFull}
                      </Text>
                    </View>

                    {isCompleted ? (
                      <View className="w-full">
                        <Link href="/review" asChild>
                          <Pressable className="w-full bg-[#4A43EC] rounded-xl py-[10px] flex-row items-center justify-center mb-2">
                            <Feather name="message-square" size={14} color="white" />
                            <Text className="text-white font-manrope-extrabold text-[13px] ml-2">
                              Write Review
                            </Text>
                          </Pressable>
                        </Link>
                        <Pressable className="w-full bg-white border border-gray-200 rounded-xl py-[10px] flex-row items-center justify-center">
                          <Feather name="eye" size={14} color="#374151" />
                          <Text className="text-[#374151] font-manrope-extrabold text-[13px] ml-2">
                            View Property Details
                          </Text>
                        </Pressable>
                      </View>
                    ) : (
                      <View className="w-full">
                        <Pressable className="w-full bg-[#F4F2FF] rounded-xl py-[10px] flex-row items-center justify-center">
                          <Feather name="calendar" size={14} color="#4A43EC" />
                          <Text className="text-[#4A43EC] font-manrope-extrabold text-[13px] ml-2">
                            Re-book Site Visit
                          </Text>
                        </Pressable>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <RescheduleBottomSheet
        ref={bottomSheetModalRef}
        sheetContent={sheetContent}
        setSheetContent={setSheetContent}
      />
    </View>
  );
}