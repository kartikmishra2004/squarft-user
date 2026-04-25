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
  const reduxUpcomingVisits = useSelector((state) => state.properties.upcomingSiteVisits || []);
  const dispatch = useDispatch();

  useEffect(() => {
    if (tab === "Book visit") {
      setActiveTab("Book visit");
    } else {
      setActiveTab("Upcoming");
    }
  }, [tab]);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const reduxProjectIds = reduxUpcomingVisits.map(v => v.projectId);

  const validMockVisits = ALL_VISITS.filter(v => {
    const isMockUpcoming = new Date(v.isoDate) >= now;
    // Suppress ONLY the upcoming mock versions of properties that have live Redux upcoming schedules
    if (isMockUpcoming && reduxProjectIds.includes(v.projectId || v.id)) {
      return false;
    }
    return true;
  });

  const allCombinedVisits = [...reduxUpcomingVisits, ...validMockVisits];

  // Filter and sort for upcoming
  const upcomingVisits = allCombinedVisits
    .filter((v) => new Date(v.isoDate) >= now)
    .sort((a, b) => new Date(a.isoDate) - new Date(b.isoDate));

  // Filter and sort for past
  const pastVisits = allCombinedVisits
    .filter((v) => new Date(v.isoDate) < now)
    .sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));

  const bottomSheetModalRef = useRef(null);

  const openModal = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const [selectedVisit, setSelectedVisit] = useState(null);

  const [selectedProjectForRebook, setSelectedProjectForRebook] = useState(null);
  const [isRebookModalVisible, setIsRebookModalVisible] = useState(false);

  const [selectedForBooking, setSelectedForBooking] = useState([]);

  useEffect(() => {
    // Keep selectedForBooking in sync if properties are removed
    setSelectedForBooking(prev => prev.filter(id => bookedSiteVisits.some(v => v.id === id)));
  }, [bookedSiteVisits]);

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
                    const isSelected = selectedForBooking.includes(visit.id);
                    return (
                      <View key={visit.id} className={`mx-4 mt-3 bg-white rounded-xl border relative overflow-hidden ${isSelected ? 'border-[#4A43EC] bg-[#F8F7FF]' : 'border-gray-200'}`}>
                        <View className="flex-row items-center p-3 pl-4">
                          <Pressable
                            className="flex-1 flex-row items-center"
                            onPress={() => {
                              if (isSelected) {
                                setSelectedForBooking(selectedForBooking.filter(id => id !== visit.id));
                              } else {
                                setSelectedForBooking([...selectedForBooking, visit.id]);
                              }
                            }}
                          >
                            <View className={`w-[22px] h-[22px] rounded-full border items-center justify-center mr-3 ${isSelected ? 'bg-[#4A43EC] border-[#4A43EC]' : 'border-gray-300'}`}>
                              {isSelected && <Feather name="check" size={12} color="white" />}
                            </View>
                            <Image
                              source={
                                visit.image
                                  ? (typeof visit.image === 'string' ? { uri: visit.image } : visit.image)
                                  : (typeof visit.imageMain === 'string' ? { uri: visit.imageMain } : visit.imageMain)
                              }
                              className="w-[70px] h-[70px] rounded-lg mr-3"
                              resizeMode="cover"
                            />
                            <View className="flex-1 justify-between h-[70px] py-1 pr-2">
                              <View>
                                <Text className="text-[14px] font-manrope-bold text-gray-900 mb-0.5" numberOfLines={1}>
                                  {visit.title || visit.name}
                                </Text>
                                <Text className="text-[#6B7280] text-[11px] font-manrope" numberOfLines={1}>
                                  {visit.location}
                                </Text>
                              </View>
                              <Text className="text-[12px] font-manrope-bold text-[#4A43EC]">
                                {visit.price || visit.priceINR || (visit.variants && visit.variants[0]?.priceRange)}
                              </Text>
                            </View>
                          </Pressable>

                          <Link href={`/project-detail?id=${visit.projectId || fallbackId}&from=visit`} asChild>
                            <Pressable className="items-center justify-center pl-2 pr-1 z-20">
                              <Feather name="chevron-right" size={20} color="#9CA3AF" />
                              <Text className="text-[10px] font-manrope-bold text-[#9CA3AF] uppercase mt-1">VIEW</Text>
                            </Pressable>
                          </Link>
                        </View>
                      </View>
                    );
                  })}

                  <Link href="/(tabs)/myActivity" asChild>
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
              <EmptyState 
                icon="map-pin" 
                title="No Properties Added" 
                message="You haven't added any properties to visit yet. Explore our listings and add some to your itinerary."
              >
                <Link href="/(tabs)/myActivity" asChild>
                  <Pressable className="w-full border border-dashed border-[#CBD5E1] rounded-xl py-4 flex-row justify-center items-center bg-slate-50/50 mt-2">
                    <Feather name="plus-circle" size={18} color="#94A3B8" />
                    <Text className="text-[#64748B] font-manrope-bold text-[14px] ml-2">
                      Add properties to visit
                    </Text>
                  </Pressable>
                </Link>
              </EmptyState>
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
                        source={typeof visit.image === 'string' ? { uri: visit.image } : visit.image}
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
                          {new Date(visit.isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {visit.dateFull?.includes('·') ? visit.dateFull.split('·')[1].trim() : visit.dateFull?.includes('|') ? visit.dateFull.split('|')[1].trim() : "10:00 AM"}
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
                        className="flex-1 bg-[#4A43EC1A] rounded-lg py-2.5 flex-row items-center justify-center"
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
              <EmptyState 
                icon="calendar" 
                title="No Upcoming Visits" 
                message="You don't have any site visits scheduled right now. Book a visit to see your favorite properties in person."
              />
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
                          source={typeof visit.image === 'string' ? { uri: visit.image } : visit.image}
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
                          {new Date(visit.isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {visit.dateFull?.includes('·') ? visit.dateFull.split('·')[1].trim() : visit.dateFull?.includes('|') ? visit.dateFull.split('|')[1].trim() : "10:00 AM"}
                        </Text>
                      </View>

                      {isCompleted ? (
                        <View className="flex-col gap-2">
                          <Link href={{ pathname: "/review", params: { title: visit.title, image: visit.image, location: visit.location, dateFull: visit.dateFull } }} asChild>
                            <Pressable className="w-full bg-[#4A43EC] rounded-lg py-3 flex-row items-center justify-center">
                              <Feather name="edit-3" size={14} color="white" />
                              <Text className="text-white font-manrope-bold text-[13px] ml-2">
                                Write Review
                              </Text>
                            </Pressable>
                          </Link>

                          <Link href={`/project-detail?id=${visit.projectId || visit.id.replace(/\d{13}$/, "")}&from=visit`} asChild>
                            <Pressable className="w-full border border-gray-200 rounded-lg py-3 flex-row items-center justify-center bg-white">
                              <Feather name="eye" size={14} color="#6B7280" />
                              <Text className="text-[#111827] font-manrope-bold text-[13px] ml-2">
                                View Property Details
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
              <EmptyState 
                icon="clock" 
                title="No Past Visits" 
                message="Your site visit history will appear here once you've completed a visit to a property."
              />
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
              <View className="flex-row items-center">
                <Text className="text-[16px] font-manrope-bold text-gray-900">
                  {selectedForBooking.length} Stops • {selectedForBooking.length * 1.5} hrs
                </Text>
                {selectedForBooking.length > 0 && (
                  <Pressable
                    onPress={() => {
                      selectedForBooking.forEach(id => dispatch(removeSiteVisit(id)));
                      setSelectedForBooking([]);
                    }}
                    className="ml-3 w-8 h-8 rounded-full bg-[#FEE2E2] items-center justify-center border border-[#FECACA]"
                  >
                    <Feather name="trash-2" size={14} color="#EF4444" />
                  </Pressable>
                )}
              </View>
            </View>
            <Link href={{ pathname: "/(screens)/book-site-visit", params: { selectedIds: selectedForBooking.join(",") } }} asChild>
              <Pressable
                className={`rounded-xl py-3.5 px-6 flex-row items-center justify-center ${selectedForBooking.length > 0 ? 'bg-[#6C3BFF]' : 'bg-gray-300'}`}
                disabled={selectedForBooking.length === 0}
              >
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

function EmptyState({ icon, title, message, children }) {
  return (
    <View className="flex-1 items-center justify-center pt-20 px-8">
      <View className="w-24 h-24 bg-[#F8F7FF] rounded-full items-center justify-center mb-6 border-8 border-white shadow-sm">
        <View className="w-16 h-16 bg-[#EEECFF] rounded-full items-center justify-center">
          <Feather name={icon} size={28} color="#4A43EC" />
        </View>
      </View>
      <Text className="text-[20px] font-manrope-extrabold text-gray-900 text-center mb-2">
        {title}
      </Text>
      <Text className="text-[14px] font-manrope text-gray-500 text-center mb-8 leading-relaxed">
        {message}
      </Text>
      {children}
    </View>
  );
}