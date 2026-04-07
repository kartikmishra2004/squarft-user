import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Image, Dimensions } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import RescheduleBottomSheet from "../../components/visit/RescheduleBottomSheet";
import BookVisitModal from "../../components/projectDetail/BookVisitModal";
import { Link, useLocalSearchParams } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { removeSiteVisit, addSiteVisit } from "../../store/slices/propertiesSlice";
import { ALL_VISITS } from "../../data/visits";
import { allProjects } from "../../data/projects";

const { width } = Dimensions.get('window');

export default function Visit() {
  const { tab } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("Book visit");
  const bookedSiteVisits = useSelector((state) => state.properties.bookedSiteVisits);
  const dispatch = useDispatch();

  useEffect(() => {
    if (tab === "Book visit") {
      setActiveTab("Book visit");
    } else {
      setActiveTab("Upcoming");
    }
  }, [tab]);

  const now = new Date();
  const upcomingVisits = ALL_VISITS.filter((v) => new Date(v.isoDate) >= now);
  const pastVisits = ALL_VISITS.filter((v) => new Date(v.isoDate) < now);

  const bottomSheetModalRef = useRef(null);

  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const [selectedVisit, setSelectedVisit] = useState(null);

  const [selectedProjectForRebook, setSelectedProjectForRebook] = useState(null);
  const [isRebookModalVisible, setIsRebookModalVisible] = useState(false);

  const tabs = ["Book visit", "Upcoming", "Past"];

  return (
    <View className="flex-1 bg-[#ffffff]">
      <StatusBar style="dark" />

      {/* Header Tabs */}
      <View className="px-4 pt-6 pb-4">
        <View className="flex-row gap-2">
          {tabs.map((tabItem) => {
            const isActive = activeTab === tabItem;
            return (
              <Pressable
                key={tabItem}
                className={`flex-1 items-center py-2 rounded-lg border ${isActive ? "bg-[#4A43EC] border-[#4A43EC]" : "bg-white border-gray-100"}`}
                onPress={() => setActiveTab(tabItem)}
              >
                <Text
                  className={`text-[12px] font-manrope-bold ${isActive ? "text-white" : "text-[#6B7280]"}`}
                >
                  {tabItem}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* Book visit Tab */}
        {activeTab === "Book visit" && (
          <View className="flex-1 mt-1">
            {bookedSiteVisits.length > 0 ? (
              <>
                <View className="flex-1 pb-[100px]">
                  {bookedSiteVisits.map((visit) => {
                    const fallbackId = visit.id.replace(/\d{13}$/, "");
                    return (
                      <View key={visit.id} className="mx-4 mt-3 bg-white rounded-xl border border-gray-200 relative">
                        <Link href={`/project-detail?id=${visit.projectId || fallbackId}&from=visit`} asChild>
                          <Pressable className="p-4 flex-row items-center">
                            <Image
                              source={
                                visit.image
                                  ? (typeof visit.image === 'string' ? { uri: visit.image } : visit.image)
                                  : (typeof visit.imageMain === 'string' ? { uri: visit.imageMain } : visit.imageMain)
                              }
                              className="w-[80px] h-[80px] rounded-lg mr-4"
                              resizeMode="cover"
                            />
                            <View className="flex-1 justify-center pr-2">
                              <Text className="text-[15px] font-manrope-bold text-gray-900 mb-0.5" numberOfLines={1}>
                                {visit.title || visit.name}
                              </Text>
                              <Text className="text-[#6B7280] text-[12px] font-manrope mb-2" numberOfLines={1}>
                                {visit.location}
                              </Text>
                              <Text className="text-[13px] font-manrope-bold text-[#4A43EC]">
                                {visit.price || visit.priceINR || (visit.variants && visit.variants[0]?.priceRange)}
                              </Text>
                            </View>
                            <View className="items-center justify-center pl-2 pr-1">
                              <Feather name="chevron-right" size={20} color="#9CA3AF" />
                              <Text className="text-[10px] font-manrope-bold text-[#9CA3AF] uppercase mt-1">VIEW</Text>
                            </View>
                          </Pressable>
                        </Link>

                        <Pressable
                          onPress={() => dispatch(removeSiteVisit(visit.id))}
                          className="absolute right-0 top-0 w-8 h-8 items-center justify-center bg-gray-50 rounded-tr-xl rounded-bl-xl border-b border-l border-gray-200 z-10"
                        >
                          <Feather name="x" size={14} color="#6B7280" />
                        </Pressable>
                      </View>
                    );
                  })}

                  <Link href="/(tabs)/home" asChild>
                    <Pressable className="mx-4 mt-6 border border-dashed border-[#CBD5E1] rounded-xl py-4 flex-row justify-center items-center bg-slate-50/50">
                      <Feather name="plus-circle" size={18} color="#94A3B8" />
                      <Text className="text-[#64748B] font-manrope-bold text-[14px] ml-2">
                        Add more properties to visit
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              </>
            ) : (
              <View className="flex-1 items-center justify-center pt-24 px-4">
                <Text className="text-[14px] font-manrope-bold text-gray-900 text-center mb-4">No properties added for site visit yet</Text>
                <Link href="/(tabs)/home" asChild>
                  <Pressable className="w-full border border-dashed border-[#CBD5E1] rounded-xl py-4 flex-row justify-center items-center bg-slate-50/50">
                    <Feather name="plus-circle" size={18} color="#94A3B8" />
                    <Text className="text-[#64748B] font-manrope-bold text-[14px] ml-2">
                      Add properties to visit
                    </Text>
                  </Pressable>
                </Link>
              </View>
            )}
          </View>
        )}

        {/* Upcoming VISITS */}
        {activeTab === "Upcoming" && (
          <View className="mt-1">
            {upcomingVisits.length > 0 ? (
              upcomingVisits.map((visit) => (
                <View key={visit.id} className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                  <View className="p-3.5">
                    <View className="flex-row mb-3">
                      <Image
                        source={{ uri: visit.image }}
                        className="w-16 h-16 rounded-lg mr-3"
                        resizeMode="cover"
                      />
                      <View className="flex-1 justify-center">
                        <View className="bg-[#EEECFF] self-start px-2 py-0.5 rounded-md mb-1.5">
                          <Text className="text-[#4A43EC] text-[9px] font-manrope-bold tracking-wider uppercase">
                            {visit.status}
                          </Text>
                        </View>
                        <Text className="text-[14px] font-manrope-bold text-gray-900 mb-0.5" numberOfLines={1}>
                          {visit.title}
                        </Text>
                        <View className="flex-row items-center">
                          <Ionicons name="location-outline" size={11} color="#9CA3AF" />
                          <Text className="text-[#6B7280] text-[11px] font-manrope ml-1" numberOfLines={1}>
                            {visit.location}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View className="h-[1px] bg-gray-50 mb-3" />

                    <View className="flex-row justify-between items-center mb-3 bg-gray-50 p-2.5 rounded-lg">
                      <View>
                        <Text className="text-[9px] text-[#9CA3AF] font-manrope-bold tracking-wider uppercase mb-1">
                          DATE & TIME
                        </Text>
                        <Text className="text-[12px] font-manrope-bold text-gray-700">
                          {visit.dateFull}
                        </Text>
                      </View>
                      <View className="w-7 h-7 rounded-full bg-white items-center justify-center border border-gray-100">
                        <Feather name="calendar" size={13} color="#4A43EC" />
                      </View>
                    </View>

                    <View className="flex-row gap-2">
                      <Pressable className="flex-1 bg-[#4A43EC] rounded-lg py-2.5 flex-row items-center justify-center shadow-md shadow-indigo-200">
                        <Feather name="map" size={13} color="white" />
                        <Text className="text-white font-manrope-bold text-[12px] ml-2">
                          Directions
                        </Text>
                      </Pressable>
                      <Pressable
                        className="flex-1 bg-white border border-gray-100 rounded-lg py-2.5 flex-row items-center justify-center"
                        onPress={() => {
                          setSelectedVisit(visit);
                          openModal();
                        }}
                      >
                        <Feather name="edit-3" size={13} color="#4A43EC" />
                        <Text className="text-[#4A43EC] font-manrope-bold text-[12px] ml-2">
                          Reschedule
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <EmptyState icon="calendar" message="No upcoming visits scheduled" />
            )}
          </View>
        )}

        {/* Past VISITS */}
        {activeTab === "Past" && (
          <View className="mt-1">
            {pastVisits.length > 0 ? (
              pastVisits.map((visit) => {
                const isCompleted = visit.status === "COMPLETED";
                return (
                  <View key={visit.id} className="mx-4 mt-3 bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                    <View className="p-3.5">
                      <View className="flex-row mb-3">
                        <Image
                          source={{ uri: visit.image }}
                          className="w-16 h-16 rounded-lg mr-3"
                          resizeMode="cover"
                        />
                        <View className="flex-1 justify-center">
                          <View className={`self-start px-2 py-0.5 rounded-md mb-1.5 ${isCompleted ? 'bg-[#E5F7F1]' : 'bg-[#FEE2E2]'}`}>
                            <Text className={`text-[9px] font-manrope-bold tracking-wider uppercase ${isCompleted ? 'text-[#00B67A]' : 'text-[#EF4444]'}`}>
                              {visit.status}
                            </Text>
                          </View>
                          <Text className="text-[14px] font-manrope-bold text-gray-900 mb-0.5" numberOfLines={1}>
                            {visit.title}
                          </Text>
                          <View className="flex-row items-center">
                            <Ionicons name="location-outline" size={11} color="#9CA3AF" />
                            <Text className="text-[#6B7280] text-[11px] font-manrope ml-1" numberOfLines={1}>
                              {visit.location}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="h-[1px] bg-gray-50 mb-3" />

                      <View className="mb-3 bg-gray-50 p-2.5 rounded-lg">
                        <Text className="text-[9px] text-[#9CA3AF] font-manrope-bold tracking-wider uppercase mb-1">
                          VISITED ON
                        </Text>
                        <Text className="text-[12px] font-manrope-bold text-gray-700">
                          {visit.dateFull}
                        </Text>
                      </View>

                      {isCompleted ? (
                        <View className="flex-row gap-2">
                          <Link href={{ pathname: "/review", params: { title: visit.title, image: visit.image, location: visit.location, dateFull: visit.dateFull } }} asChild>
                            <Pressable className="flex-1 bg-[#4A43EC] rounded-lg py-2.5 flex-row items-center justify-center">
                              <Feather name="star" size={13} color="white" />
                              <Text className="text-white font-manrope-bold text-[12px] ml-2">
                                Rate Visit
                              </Text>
                            </Pressable>
                          </Link>

                        </View>
                      ) : (
                        <Pressable
                          onPress={() => {
                            const fullProject = allProjects.find((p) => p.id === (visit.projectId || visit.id.replace(/\d{13}$/, "")));
                            if (fullProject) {
                              setSelectedProjectForRebook(fullProject);
                              setIsRebookModalVisible(true);
                            }
                          }}
                          className="w-full bg-[#F4F2FF] rounded-lg py-2.5 flex-row items-center justify-center"
                        >
                          <Feather name="refresh-cw" size={13} color="#4A43EC" />
                          <Text className="text-[#4A43EC] font-manrope-bold text-[12px] ml-2">
                            Re-book Site Visit
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })
            ) : (
              <EmptyState icon="clock" message="No past visits found" />
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky Footer for Book visit tab */}
      {activeTab === "Book visit" && bookedSiteVisits.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white px-4 py-4 border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] pt-6 pb-[110px]">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-manrope-bold text-[#94A3B8] tracking-wider uppercase mb-0.5">
                TOTAL SELECTION
              </Text>
              <Text className="text-[16px] font-manrope-bold text-gray-900">
                {bookedSiteVisits.length} Stops • {bookedSiteVisits.length * 1.5} hrs
              </Text>
            </View>
            <Link href="/(screens)/book-site-visit" asChild>
              <Pressable className="bg-[#4A43EC] rounded-xl py-3.5 px-6 flex-row items-center justify-center">
                <Text className="text-white font-manrope-bold text-[14px] mr-2">
                  Book Site Visit
                </Text>
                <Feather name="calendar" size={16} color="white" />
              </Pressable>
            </Link>
          </View>
        </View>
      )}

      <RescheduleBottomSheet
        ref={bottomSheetModalRef}
        visitData={selectedVisit}
      />

      {selectedProjectForRebook && (
        <BookVisitModal 
          visible={isRebookModalVisible} 
          onClose={() => setIsRebookModalVisible(false)} 
          project={selectedProjectForRebook} 
        />
      )}
    </View>
  );
}

function EmptyState({ icon, message, subline }) {
  return (
    <View className="items-center justify-center py-16 px-8">
      <View className="w-12 h-12 bg-gray-50 rounded-full items-center justify-center mb-3">
        <Feather name={icon} size={18} color="#9CA3AF" />
      </View>
      <Text className="text-[14px] font-manrope-bold text-gray-900 text-center mb-1.5">{message}</Text>
      {subline && (
        <Text className="text-[11px] font-manrope text-gray-400 text-center px-4">{subline}</Text>
      )}
    </View>
  );
}