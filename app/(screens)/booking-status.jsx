import { View, Text, Pressable, Image, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { StatusBar } from "expo-status-bar";
import SuccessCheck from "../../components/SuccessCheck";
import { Audio } from 'expo-av';

export default function BookingStatus() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { date, time, propertyName: paramPropertyName, propertyId: paramPropertyId } = useLocalSearchParams();
  const upcomingVisits = useSelector((state) => state.properties.upcomingSiteVisits);

  const propertyObj = upcomingVisits?.find(v => v.projectId === paramPropertyId);
  const propertyName = paramPropertyName || propertyObj?.title || "The Grand Atrium";
  
  const imageSource = propertyObj?.image 
    ? (typeof propertyObj.image === 'string' ? { uri: propertyObj.image } : propertyObj.image)
    : { uri: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" };

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : "October 24, 2023";

  const displayTime = time || "10:00 AM - 12:00 PM";
  const bookingId = paramPropertyId ? `#SQFT-${paramPropertyId.toString().padStart(5, '0')}` : "#SQFT-88291";

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingTop: Platform.OS === "ios" ? insets.top : 40, backgroundColor: "white" }}>
        <View className="flex-row items-center justify-between px-6 py-2 bg-white">
          <Pressable
            onPress={() => router.replace('/home')}
            className="w-10 h-10 justify-center"
          >
            <Feather name="x" size={24} color="#111827" />
          </Pressable>

          <Text className="text-[16px] font-manrope-bold text-[#111827]">
            Booking Status
          </Text>

          <View className="w-10 h-10" />
        </View>
      </View>

      <View className="flex-1 bg-white px-6">
        {/* Success Icon */}
        <View className="items-center mb-8 mt-2">
          <SuccessCheck />
        </View>

        {/* Messaging */}
        <Text className="text-center text-[20px] font-manrope-extrabold text-[#111827] mb-8">
          Booking Successful
        </Text>
        <Text className="text-center text-[13px] font-manrope-medium text-[#6B7280] leading-[18px] mb-10">
          Your reservation at {propertyName} has been confirmed.{"\n"}A confirmation email is on its way.
        </Text>

        {/* Property Card */}
        <View
          className="bg-white rounded-[18px] border border-gray-100 shadow-sm overflow-hidden mb-5"
        >
          <Image source={imageSource} className="w-full h-[150px]" resizeMode="cover" />
          <View className="p-4">
            <View className="flex-row justify-between items-start mb-1.5">
              <Text className="text-[15px] font-manrope-extrabold text-[#111827] flex-1 mr-2" numberOfLines={1}>
                {propertyName}
              </Text>
              <View className="bg-[#EEEBFF] px-2.5 py-[3px] rounded-full">
                <Text className="text-[#4A43EC] text-[9px] font-manrope-bold uppercase">
                  CONFIRMED
                </Text>
              </View>
            </View>

            <Text className="text-[#4A43EC] text-[11px] font-manrope-medium mb-4">
              Booking ID: {bookingId}
            </Text>

            <View className="h-[1px] bg-gray-50 mb-4" />

            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Feather name="calendar" size={13} color="#9CA3AF" />
                <Text className="text-[12px] font-manrope-medium text-[#6B7280] ml-2">Date</Text>
              </View>
              <Text className="text-[12px] font-manrope-bold text-[#111827]">{formattedDate}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Feather name="clock" size={13} color="#9CA3AF" />
                <Text className="text-[12px] font-manrope-medium text-[#6B7280] ml-2">Time</Text>
              </View>
              <Text className="text-[12px] font-manrope-bold text-[#111827]">{displayTime}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-2.5 pb-8">
          
          <Pressable
            onPress={() => router.replace('/(tabs)/home')}
            className="bg-[#F1F5F9] rounded-[14px] py-[14px] items-center justify-center"
          >
            <Text className="text-[#111827] font-manrope-bold text-[14px]">Back to Home</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
