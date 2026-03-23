import React, { useMemo, useCallback } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";

const RescheduleBottomSheet = React.forwardRef(({ sheetContent, setSheetContent }, ref) => {
  const snapPoints = useMemo(() => ["82%"], []);

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
      handleIndicatorStyle={{ backgroundColor: "#E5E7EB", width: 48, height: 5 }}
      backgroundStyle={{ backgroundColor: 'white', borderRadius: 32 }}
    >
      <View className="bg-white rounded-t-[32px] overflow-hidden flex-1">
        <View className="pb-3 px-6 relative">
          <View className="flex-row items-center justify-center mt-1">
            <Pressable onPress={closeModal} className="absolute left-0">
              <Feather name="x" size={22} color="#4B5563" />
            </Pressable>
            <Text className="text-[17px] font-manrope-extrabold text-[#111827]">
              {sheetContent === 'edit' ? 'Edit Visit' : 'Filters'}
            </Text>
          </View>
        </View>
        <View className="w-full h-[1px] bg-gray-100" />
        
        <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <View className="px-6 py-4">
              {sheetContent === 'edit' ? (
                <>
                  <View className="border border-gray-100 rounded-[16px] overflow-hidden mb-3">
                    <Image 
                      source={{ uri: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" }} 
                      className="w-full h-[120px]" 
                      resizeMode="cover" 
                    />
                    <View className="p-4">
                      <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-[17px] font-manrope-extrabold text-[#111827]">
                          The Grand Atrium
                        </Text>
                        <View className="bg-[#EEECFF] px-[10px] py-[4px] rounded-full">
                          <Text className="text-[#4A43EC] text-[9px] font-manrope-extrabold tracking-widest uppercase">
                            CONFIRMED
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center mb-2">
                        <Feather name="calendar" size={14} color="#6B7280" />
                        <Text className="text-[13px] text-[#4B5563] font-manrope ml-2">
                          Oct 24, 2023 • 10:00 AM
                        </Text>
                      </View>
                      <View className="flex-row items-center mb-4">
                        <Feather name="map-pin" size={14} color="#6B7280" />
                        <Text className="text-[13px] text-[#4B5563] font-manrope ml-2">
                          452 Luxury Way, Penthouse Suite
                        </Text>
                      </View>
                      <Pressable className="bg-[#5A50ED] rounded-[10px] py-3 flex-row items-center justify-center">
                        <Feather name="map" size={14} color="white" />
                        <Text className="text-white text-[13px] font-manrope-extrabold ml-2">
                          View on Map
                        </Text>
                      </Pressable>
                    </View>
                  </View>

                  <View className="border border-gray-100 rounded-[16px] px-4 py-1 mb-4">
                    <View className="flex-row justify-between items-center py-3 border-b border-gray-50">
                      <Text className="text-[12px] text-[#9CA3AF] font-manrope-extrabold tracking-[1px] uppercase">
                        BOOKING ID
                      </Text>
                      <Text className="text-[14px] font-manrope-extrabold text-[#111827]">
                        SQF-88291
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center py-3 border-b border-gray-50">
                      <Text className="text-[12px] text-[#9CA3AF] font-manrope-extrabold tracking-[1px] uppercase">
                        VISITOR
                      </Text>
                      <Text className="text-[14px] font-manrope-extrabold text-[#111827]">
                        John Doe
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center py-3">
                      <Text className="text-[12px] text-[#9CA3AF] font-manrope-extrabold tracking-[1px] uppercase">
                        DURATION
                      </Text>
                      <Text className="text-[14px] font-manrope-extrabold text-[#111827] text-right">
                        60{"\n"}Minutes
                      </Text>
                    </View>
                  </View>

                  <Pressable 
                    className="bg-[#111827] rounded-[14px] py-[15px] flex-row items-center justify-center mb-2"
                    onPress={() => setSheetContent('success')}
                  >
                    <Feather name="calendar" size={18} color="white" />
                    <Text className="text-white font-manrope-extrabold text-[15px] ml-2">
                      Reschedule Visit
                    </Text>
                  </Pressable>

                  <Pressable className="bg-[#FFF1F2] rounded-[14px] py-[15px] flex-row items-center justify-center mb-4">
                    <Feather name="x-circle" size={18} color="#EF4444" />
                    <Text className="text-[#EF4444] font-manrope-extrabold text-[15px] ml-2">
                      Cancel Visit
                    </Text>
                  </Pressable>

                  <View className="flex-row justify-center items-center">
                    <Feather name="info" size={14} color="#9CA3AF" />
                    <Text className="text-[#6B7280] font-manrope text-[13px] ml-2">
                      Need help? <Text className="text-[#4A43EC]" style={{ textDecorationLine: 'underline' }}>Contact Support</Text>
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View className="w-[56px] h-[56px] bg-[#EEECFF] rounded-full items-center justify-center self-center mb-4 mt-2">
                    <View className="w-[36px] h-[36px] bg-[#4A43EC] rounded-full items-center justify-center">
                      <Feather name="check" size={18} color="white" style={{ strokeWidth: 3 }} />
                    </View>
                  </View>

                  <Text className="text-[22px] font-manrope-extrabold text-[#111827] text-center mb-2">
                    Success!
                  </Text>
                  <Text className="text-center text-[14px] text-[#6B7280] font-manrope leading-[20px] px-6 mb-5">
                    Your visit to SquarFT has been successfully rescheduled.
                  </Text>

                  <View className="border border-gray-100 rounded-[16px] py-4 px-5 mb-5">
                    <Text className="text-[15px] font-manrope-extrabold text-[#111827] mb-3">
                      New Appointment Details
                    </Text>
                    <View className="h-[1px] bg-gray-50 w-full mb-4" />
                    
                    <View className="flex-row items-center mb-4">
                      <View className="w-12 h-12 bg-[#F8F7FF] rounded-[12px] items-center justify-center mr-4 border border-[#F0EEFF]">
                        <Feather name="calendar" size={20} color="#4A43EC" />
                      </View>
                      <View>
                        <Text className="text-[15px] font-manrope-extrabold text-[#111827] mb-[2px]">
                          October 26, 2023
                        </Text>
                        <Text className="text-[12px] font-manrope text-[#9CA3AF]">
                          Date
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center mb-4">
                      <View className="w-12 h-12 bg-[#F8F7FF] rounded-[12px] items-center justify-center mr-4 border border-[#F0EEFF]">
                        <Feather name="clock" size={20} color="#4A43EC" />
                      </View>
                      <View>
                        <Text className="text-[15px] font-manrope-extrabold text-[#111827] mb-[2px]">
                          2:00 PM - 4:00 PM
                        </Text>
                        <Text className="text-[12px] font-manrope text-[#9CA3AF]">
                          Time
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <View className="w-12 h-12 bg-[#F8F7FF] rounded-[12px] items-center justify-center mr-4 border border-[#F0EEFF]">
                        <Feather name="map-pin" size={20} color="#4A43EC" />
                      </View>
                      <View>
                        <Text className="text-[15px] font-manrope-extrabold text-[#111827] mb-[2px]">
                          742 Evergreen Terrace
                        </Text>
                        <Text className="text-[12px] font-manrope text-[#9CA3AF]">
                          Location
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Pressable className="w-full bg-[#4A43EC] rounded-[14px] py-[15px] flex-row items-center justify-center mb-3">
                    <Feather name="calendar" size={18} color="white" />
                    <Text className="text-white font-manrope-extrabold text-[15px] ml-2">
                      Add to Calendar
                    </Text>
                  </Pressable>

                  <Pressable 
                    className="w-full bg-white border-[1.5px] border-[#4A43EC] rounded-[14px] py-[15px] flex-row items-center justify-center"
                    onPress={closeModal}
                  >
                    <Feather name="home" size={18} color="#4A43EC" />
                    <Text className="text-[#4A43EC] font-manrope-extrabold text-[15px] ml-2">
                      Back to Home
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
        </BottomSheetScrollView>
      </View>
    </BottomSheetModal>
  );
});

export default RescheduleBottomSheet;
