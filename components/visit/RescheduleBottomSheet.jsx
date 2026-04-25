import React, { useMemo, useCallback, useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Link, useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { addSiteVisit, cancelUpcomingVisit } from "../../store/slices/propertiesSlice";
import ConfirmationModal from "../ConfirmationModal";

const RescheduleBottomSheet = React.forwardRef(({ visitData }, ref) => {
  const snapPoints = useMemo(() => ["75%"], []);

  const dispatch = useDispatch();
  const router = useRouter();

  const closeModal = useCallback(() => {
    ref?.current?.dismiss();
  }, [ref]);

  const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);

  const handleCancelVisit = useCallback(() => {
    setIsCancelModalVisible(true);
  }, []);

  const confirmCancel = useCallback(() => {
    if (visitData?.id) {
      dispatch(cancelUpcomingVisit(visitData.id));
      setIsCancelModalVisible(false);
      closeModal();
    }
  }, [visitData, dispatch, closeModal]);

  const handleReschedule = useCallback(() => {
    if (visitData) {
      dispatch(addSiteVisit({
        ...visitData,
        id: visitData.projectId || visitData.id.replace(/_reschedule_.*/, "")
      }));
      closeModal();
      
      const parsedTime = visitData?.dateFull?.includes('·') ? visitData.dateFull.split('·')[1].trim() : visitData?.dateFull?.includes('|') ? visitData.dateFull.split('|')[1].trim() : "10:00 AM";

      router.push({
        pathname: "/(screens)/book-site-visit",
        params: {
          selectedIds: visitData.projectId || visitData.id.replace(/_reschedule_.*/, ""),
          initialDate: visitData.isoDate,
          initialTime: parsedTime,
          initialVisitors: visitData.visitors?.toString() || "1",
          initialNotes: visitData.notes || ""
        }
      });
    }
  }, [visitData, dispatch, router, closeModal]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
    ),
    []
  );

  const fallbackImage = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80";
  const imageSource = visitData?.image 
    ? (typeof visitData.image === 'string' ? { uri: visitData.image } : visitData.image)
    : { uri: fallbackImage };

  const parsedDate = visitData?.isoDate ? new Date(visitData.isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "";
  const parsedTime = visitData?.dateFull?.includes('·') ? visitData.dateFull.split('·')[1].trim() : visitData?.dateFull?.includes('|') ? visitData.dateFull.split('|')[1].trim() : "10:00 AM";
  const displayDate = parsedDate ? `${parsedDate} • ${parsedTime}` : visitData?.dateFull || "Oct 24, 2023 • 10:00 AM";

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
              Edit Visit
            </Text>
          </View>
        </View>
        <View className="w-full h-[1px] bg-gray-100" />
        
        <BottomSheetScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
            <View className="px-5 py-4">
                  <View className="border border-gray-100 rounded-[12px] overflow-hidden mb-3 bg-white">
                    <Image 
                      source={imageSource} 
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
                          {displayDate}
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
                    onPress={handleReschedule}
                  >
                    <Feather name="calendar" size={16} color="white" />
                    <Text className="text-white font-manrope-extrabold text-[13px] ml-2">
                      Reschedule Visit
                    </Text>
                  </Pressable>

                  <Pressable 
                    className="bg-[#FFF1F2] rounded-[10px] py-3 flex-row items-center justify-center mb-4"
                    onPress={handleCancelVisit}
                  >
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
            </View>
        </BottomSheetScrollView>
      </View>

      <ConfirmationModal
        visible={isCancelModalVisible}
        onClose={() => setIsCancelModalVisible(false)}
        onConfirm={confirmCancel}
        title="Cancel Site Visit?"
        message="Are you sure you want to cancel this site visit? This action cannot be undone."
        cancelText="No, Keep it"
        confirmText="Yes, Cancel"
        icon="alert-triangle"
        iconColor="#EF4444"
        iconBgColor="#FFF1F2"
        confirmButtonColor="bg-[#EF4444]"
      />

    </BottomSheetModal>
  );
});

export default RescheduleBottomSheet;
