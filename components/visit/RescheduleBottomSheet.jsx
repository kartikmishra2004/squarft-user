import React, { useMemo, useCallback } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Link } from "expo-router";

const RescheduleBottomSheet = React.forwardRef(({ sheetContent, setSheetContent, visitData }, ref) => {
  const snapPoints = useMemo(() => ["75%"], []);

  const closeModal = useCallback(() => {
    ref?.current?.dismiss();
  }, [ref]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#E5E7EB", width: 40, height: 4 }}
      backgroundStyle={{ backgroundColor: 'white', borderRadius: 24 }}
    >
      <View className="bg-white rounded-t-[24px] overflow-hidden flex-1">
        <View className="pb-3 px-5 relative mt-1">
          <View className="flex-row items-center justify-center">
            <Pressable onPress={closeModal} className="absolute left-0">
              <Feather name="x" size={20} color="#4B5563" />
            </Pressable>
            <Text className="text-[15px] font-manrope-extrabold text-[#111827]">
              {sheetContent === 'edit' ? 'Edit Visit' : 'Filters'}
            </Text>
          </View>
        </View>
        <View className="w-full h-[1px] bg-gray-100" />
        
        <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            <View className="px-5 py-4">
              {sheetContent === 'edit' ? (
                <>
                  <View className="border border-gray-100 rounded-[12px] overflow-hidden mb-3 bg-white">
                    <Image 
                      source={{ uri: visitData?.image || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }} 
                      className="w-full h-[90px]" 
                      resizeMode="cover" 
                    />
                    <View className="p-3">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-[14px] font-manrope-extrabold text-[#111827]">
                          {visitData?.title || "The Grand Atrium"}
                        </Text>
                        <View className="bg-[#EEECFF] px-[8px] py-[3px] rounded-full">
                          <Text className="text-[#4A43EC] text-[8px] font-manrope-extrabold tracking-widest uppercase">
                            {visitData?.status || "CONFIRMED"}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mb-1.5">
                        <Feather name="calendar" size={12} color="#6B7280" />
                        <Text className="text-[12px] text-[#4B5563] font-manrope ml-2">
                          {visitData?.dateFull || "Oct 24, 2023 • 10:00 AM"}
                        </Text>
                      </View>
                      <View className="flex-row items-center mb-3">
                        <Feather name="map-pin" size={12} color="#6B7280" />
                        <Text className="text-[12px] text-[#4B5563] font-manrope ml-2">
                          {visitData?.location || "452 Luxury Way, Penthouse Suite"}
                        </Text>
                      </View>
                      <Pressable className="bg-[#5A50ED] rounded-[8px] py-2.5 flex-row items-center justify-center">
                        <Feather name="map" size={12} color="white" />
                        <Text className="text-white text-[12px] font-manrope-extrabold ml-1.5">
                          View on Map
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <View className="border border-gray-100 rounded-[12px] px-3 py-1 mb-3 bg-white">
                    <View className="flex-row justify-between items-center py-2.5 border-b border-gray-50">
                      <Text className="text-[10px] text-[#9CA3AF] font-manrope-extrabold tracking-[1px] uppercase">
                        BOOKING ID
                      </Text>
                      <Text className="text-[12px] font-manrope-extrabold text-[#111827]">
                        {visitData?.bookingId}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center py-2.5 border-b border-gray-50">
                      <Text className="text-[10px] text-[#9CA3AF] font-manrope-extrabold tracking-[1px] uppercase">
                        VISITOR
                      </Text>
                      <Text className="text-[12px] font-manrope-extrabold text-[#111827]">
                        {visitData?.visitorName}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center py-2.5">
                      <Text className="text-[10px] text-[#9CA3AF] font-manrope-extrabold tracking-[1px] uppercase">
                        DURATION
                      </Text>
                      <Text className="text-[12px] font-manrope-extrabold text-[#111827] text-right">
                        {visitData?.duration}
                      </Text>
                    </View>
                  </View>

                  <Pressable 
                    className="bg-[#111827] rounded-[10px] py-3 flex-row items-center justify-center mb-2"
                    onPress={() => setSheetContent('success')}
                  >
                    <Feather name="calendar" size={16} color="white" />
                    <Text className="text-white font-manrope-extrabold text-[13px] ml-2">
                      Reschedule Visit
                    </Text>
                  </Pressable>

                  <Pressable className="bg-[#FFF1F2] rounded-[10px] py-3 flex-row items-center justify-center mb-4">
                    <Feather name="x-circle" size={16} color="#EF4444" />
                    <Text className="text-[#EF4444] font-manrope-extrabold text-[13px] ml-2">
                      Cancel Visit
                    </Text>
                  </Pressable>

                  <View className="flex-row justify-center items-center">
                    <Feather name="info" size={12} color="#9CA3AF" />
                    <Text className="text-[#6B7280] font-manrope text-[11px] ml-1.5">
                      Need help? <Text className="text-[#4A43EC]" style={{ textDecorationLine: 'underline' }}>Contact Support</Text>
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View className="w-[48px] h-[48px] bg-[#EEECFF] rounded-full items-center justify-center self-center mb-3 mt-1">
                    <View className="w-[30px] h-[30px] bg-[#4A43EC] rounded-full items-center justify-center">
                      <Feather name="check" size={14} color="white" style={{ strokeWidth: 3 }} />
                    </View>
                  </View>

                  <Text className="text-[18px] font-manrope-extrabold text-[#111827] text-center mb-1.5">
                    Success!
                  </Text>
                  <Text className="text-center text-[13px] text-[#6B7280] font-manrope leading-[18px] px-4 mb-4">
                    Your visit to SquarFT has been successfully rescheduled.
                  </Text>

                  <View className="border border-gray-100 rounded-[12px] py-3 px-4 mb-4 bg-white">
                    <Text className="text-[14px] font-manrope-extrabold text-[#111827] mb-2">
                      New Appointment Details
                    </Text>
                    <View className="h-[1px] bg-gray-50 w-full mb-3" />
                    
                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 bg-[#F8F7FF] rounded-[10px] items-center justify-center mr-3 border border-[#F0EEFF]">
                        <Feather name="calendar" size={16} color="#4A43EC" />
                      </View>
                      <View>
                        <Text className="text-[13px] font-manrope-extrabold text-[#111827] mb-[1px]">
                          October 26, 2023
                        </Text>
                        <Text className="text-[11px] font-manrope text-[#9CA3AF]">
                          Date
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mb-3">
                      <View className="w-10 h-10 bg-[#F8F7FF] rounded-[10px] items-center justify-center mr-3 border border-[#F0EEFF]">
                        <Feather name="clock" size={16} color="#4A43EC" />
                      </View>
                      <View>
                        <Text className="text-[13px] font-manrope-extrabold text-[#111827] mb-[1px]">
                          2:00 PM - 4:00 PM
                        </Text>
                        <Text className="text-[11px] font-manrope text-[#9CA3AF]">
                          Time
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-[#F8F7FF] rounded-[10px] items-center justify-center mr-3 border border-[#F0EEFF]">
                        <Feather name="map-pin" size={16} color="#4A43EC" />
                      </View>
                      <View>
                        <Text className="text-[13px] font-manrope-extrabold text-[#111827] mb-[1px]">
                          742 Evergreen Terrace
                        </Text>
                        <Text className="text-[11px] font-manrope text-[#9CA3AF]">
                          Location
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Pressable className="w-full bg-[#4A43EC] rounded-[10px] py-3 flex-row items-center justify-center mb-2.5">
                    <Feather name="calendar" size={16} color="white" />
                    <Text className="text-white font-manrope-extrabold text-[13px] ml-2">
                      Add to Calendar
                    </Text>
                  </Pressable>

                  <Link href="/(tabs)/home" asChild>
                    <Pressable 
                      className="w-full bg-white border border-[#4A43EC] rounded-[10px] py-3 flex-row items-center justify-center"
                      onPress={closeModal}
                    >
                      <Feather name="home" size={16} color="#4A43EC" />
                      <Text className="text-[#4A43EC] font-manrope-extrabold text-[13px] ml-2">
                        Back to Home
                      </Text>
                    </Pressable>
                  </Link>
                </>
              )}
            </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
});

export default RescheduleBottomSheet;
