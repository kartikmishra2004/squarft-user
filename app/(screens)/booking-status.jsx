import { View, Text, Pressable, Image, Platform } from "react-native";
import { Link, useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import { StatusBar } from "expo-status-bar";

export default function BookingStatus() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { date, time } = useLocalSearchParams();

  // Get property details from state (same as book-site-visit)
  const bookedSiteVisits = useSelector((state) => state.properties.bookedSiteVisits);
  const property = bookedSiteVisits && bookedSiteVisits.length > 0 ? bookedSiteVisits[0] : null;

  const propertyName = property?.title || property?.name || "The Grand Atrium";
  const imageObj = property?.image || property?.imageMain;
  const imageSource = imageObj
    ? (typeof imageObj === "string" ? { uri: imageObj } : imageObj)
    : { uri: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" };

  // Format the date passed from params
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : "October 24, 2023";

  const displayTime = time || "10:00 AM - 12:00 PM";
  const bookingId = property?.id ? `#SQFT-${property.id.toString().padStart(5, '0')}` : "#SQFT-88291";

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingTop: Platform.OS === "ios" ? insets.top : 40, backgroundColor: "white" }}>
        <View className="flex-row items-center justify-between px-6 py-0.5 bg-white border-b border-[#dbdce0]">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 justify-center"
          >
            <Feather name="arrow-left" size={24} color="#111827" />
          </Pressable>

          <Text className="text-[16px] font-manrope-bold text-[#111827]">
            Booking Status
          </Text>

          <View className="w-10 h-10" />
        </View>
      </View>

      <View className="flex-1 bg-white px-5 pt-6">
        {/* Success Icon */}
        <View className="items-center mb-4 mt-2">
          <View className="w-[64px] h-[64px] bg-[#F2EFFF] rounded-full items-center justify-center">
            <View className="w-[40px] h-[40px] bg-[#4A43EC] rounded-full items-center justify-center shadow-sm">
              <Feather name="check" size={20} color="white" />
            </View>
          </View>
        </View>

        {/* Messaging */}
        <Text className="text-center text-[18px] font-manrope-extrabold text-[#111827] mb-4">
          Booking Successful
        </Text>
        <Text className="text-center text-[12px] font-manrope font-medium text-[#6B7280] px-4 leading-[18px] mb-10">
          Your reservation at {propertyName} has been confirmed. A confirmation email is on its way.
        </Text>

        {/* Property Card */}
        <View
          className="bg-white rounded-[16px] border border-gray-100 overflow-hidden mb-6"
        >
          <Image source={imageSource} className="w-full h-[120px]" resizeMode="cover" />
          <View className="p-4">
            <View className="flex-row justify-between items-start mb-1.5">
              <Text className="text-[14px] font-manrope-extrabold text-[#111827] flex-1 mr-2" numberOfLines={1}>
                {propertyName}
              </Text>
              <View className="bg-[#F2EFFF] px-2 py-[4px] rounded-[6px]">
                <Text className="text-[#4A43EC] text-[9px] font-manrope-bold uppercase tracking-[0.5px]">
                  Confirmed
                </Text>
              </View>
            </View>

            <Text className="text-[#4A43EC] text-[11px] font-manrope-medium mb-4">
              Booking ID: {bookingId}
            </Text>

            <View className="h-[1px] bg-gray-100 mb-4" />

            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Feather name="calendar" size={13} color="#9CA3AF" />
                <Text className="text-[12px] font-manrope-medium text-[#6B7280] ml-1.5">Date</Text>
              </View>
              <Text className="text-[12px] font-manrope-bold text-[#111827]">{formattedDate}</Text>
            </View>

            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Feather name="clock" size={13} color="#9CA3AF" />
                <Text className="text-[12px] font-manrope-medium text-[#6B7280] ml-1.5">Time</Text>
              </View>
              <Text className="text-[12px] font-manrope-bold text-[#111827]">{displayTime}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-auto pb-10">
          <Pressable className="bg-[#4A43EC] rounded-[12px] py-[14px] flex-row items-center justify-center mb-3">
            <Feather name="calendar" size={15} color="white" className="mr-2" />
            <Text className="text-white font-manrope-bold text-[14px] ml-2">Add to Calendar</Text>
          </Pressable>
          <Pressable
            onPress={() => router.replace('/(tabs)/home')}
            className="bg-[#F1F5F9] rounded-[12px] py-[14px] items-center justify-center"
          >
            <Text className="text-[#111827] font-manrope-bold text-[14px]">Back to Home</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
