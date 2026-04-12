import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

const EmptyState = ({ type }) => {
  let titleText = "saved any";
  let iconName = "heart";
  let descriptionText = "Start exploring and save projects you love to see them here.";
  if (type === "CONTACTED") {
    titleText = "contacted any";
    iconName = "phone-call";
    descriptionText = "Start exploring and connect with projects you love to see them here.";
  } else if (type === "RECENT") {
    titleText = "viewed recent";
    iconName = "clock";
    descriptionText = "Start exploring to build your history of projects you love.";
  } else if (type === "SEEN") {
    titleText = "seen any";
    iconName = "eye";
    descriptionText = "Start exploring and view projects you love to see them here.";
  }
  return (
    <View className="flex-1 items-center justify-center px-6 -mt-40">
      <View className="relative w-48 h-48 items-center justify-center mb-4">
        <View
          className="absolute top-2 right-0 w-8 h-8 bg-[#E0D7FF] opacity-50 rounded-xl z-10"
          style={{ transform: [{ rotate: "15deg" }] }}
        />
        <View className="absolute bottom-4 left-4 w-[36px] h-[36px] bg-[#EAE2FF] opacity-50 rounded-full z-10" />
        <View
          className="w-[130px] h-[130px] bg-white rounded-full items-center justify-center"
          style={{ shadowColor: "#4A43EC", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 24, elevation: 8 }}
        >
          <Feather name={iconName} size={48} color="#4A43EC" style={{ strokeWidth: 1.5 }} />
          <View className="w-8 h-1 bg-[#E2DAFF] rounded-full mt-4" />
        </View>
      </View>
      <Text className="text-[17px] font-manrope-extrabold text-[#111827] text-center mb-2 leading-6">
        You haven’t {titleText}{"\n"}projects yet
      </Text>
      <Text className="text-[13px] font-manrope font-medium text-[#9CA3AF] text-center mb-8 leading-[18px] px-2">
        {descriptionText}
      </Text>
      <Pressable
        className="w-[70%] bg-[#4A43EC] rounded-2xl py-[14px] flex-row justify-center items-center"
        activeOpacity={0.8}
        style={{ shadowColor: "#4A43EC", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
      >
        <Feather name="compass" size={16} color="white" />
        <Text className="text-white font-manrope-extrabold text-[14px] font-bold ml-2">Start Exploring</Text>
      </Pressable>
    </View>
  );
};

export default EmptyState;
