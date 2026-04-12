import { Text, View, Image, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from 'expo-router';

export default function Onboarding2() {
    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="absolute top-16 right-5 z-10">
                <Link href="/login">
                    <View className="bg-[#4A43EC] px-5 py-1 rounded-full min-w-[70px] items-center justify-center">
                        <Text className="text-white text-[15px] font-lato-light" adjustsFontSizeToFit numberOfLines={1}>Skip</Text>
                    </View>
                </Link>
            </View>
            <View className="pt-32 px-7">
                <Text className="text-[17px] text-black/60 font-lato-regular mb-2.5">
                    Sell your property faster and smarter
                </Text>
                <Text className="text-[30px] text-black font-lato-bold mb-4">
                    List & Sell
                </Text>
                <Text className="text-[15px] text-black/40 font-lato-regular leading-6 mb-7">
                    List & Sell fast with trusted listings that attract real buyers.
                </Text>
                <View className="flex-row items-center mb-8">
                    <View className="w-12 h-[5px] bg-[#D0CFEF] rounded-l-full" />
                    <View className="w-12 h-[5px] rounded-l-full rounded-r-full bg-[#4A43EC]" />
                    <View className="w-12 h-[5px] rounded-r-full bg-[#D0CFEF]" />
                </View>
                <Link href="/onboarding3" asChild>
                    <Pressable className="bg-[#4A43EC] rounded-2xl py-4 items-center w-[50%] min-w-[150px]">
                        <Text className="text-white text-[16px] font-lato-bold tracking-wider" adjustsFontSizeToFit numberOfLines={1}>
                            NEXT
                        </Text>
                    </Pressable>
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