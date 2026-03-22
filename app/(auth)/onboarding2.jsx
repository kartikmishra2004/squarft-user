import { Text, View, Image, Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from 'expo-router';

export default function Onboarding2() {
    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="absolute top-16 right-5 z-10">
                <Link href="/login">
                    <View className="bg-[#4A43EC] px-5 py-1.5 rounded-full">
                        <Text className="text-white text-[15px] font-light">Skip</Text>
                    </View>
                </Link>
            </View>
            <View className="pt-32 px-7">
                <Text className="text-[18px] text-black/60 font-normal mb-2.5">
                    Sell your property faster and smarter
                </Text>
                <Text className="text-[32px] text-black font-bold mb-4 tracking-tight">
                    List & Sell
                </Text>
                <Text className="text-[15px] text-black/40 font-normal leading-6 mb-7">
                    List & Sell fast with trusted listings that attract real buyers.
                </Text>
                <View className="flex-row items-center mb-8">
                    <View className="w-12 h-[5px] bg-[#D0CFEF] rounded-l-full" />
                    <View className="w-12 h-[5px] rounded-l-full rounded-r-full bg-[#4A43EC]" />
                    <View className="w-12 h-[5px] rounded-r-full bg-[#D0CFEF]" />
                </View>
                <Link href="/onboarding3">
                    <View className="bg-[#4A43EC] rounded-2xl py-5 items-center w-[55%]">
                        <Text className="text-white text-[16px] font-semibold tracking-widest">
                            NEXT
                        </Text>
                    </View>
                </Link>
            </View>
            <View className="absolute bottom-3 left-0 right-0 overflow-hidden h-[50%] w-[100%]">
                <Image
                    source={require("../../assets/images/onboarding/onboarding2.png")}
                    className="w-full h-full"
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}