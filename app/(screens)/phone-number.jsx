import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { router } from "expo-router";

export default function PhoneNumber() {
    const { profile } = useSelector((state) => state.auth);
    const phoneNumber = profile?.user?.phone || "Not available";

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-14 pb-4 px-5 bg-white border-b border-gray-100">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="mr-3">
                        <Feather name="arrow-left" size={24} color="#111827" />
                    </Pressable>
                    <Text className="text-xl font-manrope-bold text-gray-900">Phone Number</Text>
                </View>
            </View>

            {/* Content */}
            <View className="flex-1 px-5 pt-8">
                <View className="items-center mb-8">
                    <View className="w-16 h-16 bg-[#EEF2FF] rounded-full items-center justify-center mb-4">
                        <Feather name="phone" size={28} color="#4A43EC" />
                    </View>
                    <Text className="text-sm text-gray-500 font-manrope mb-2">Your phone number</Text>
                    <Text className="text-2xl font-manrope-bold text-gray-900">{phoneNumber}</Text>
                </View>

                <View className="bg-[#F9FAFB] rounded-xl p-4 mb-6">
                    <View className="flex-row items-start">
                        <Feather name="info" size={16} color="#6B7280" style={{ marginTop: 2, marginRight: 8 }} />
                        <Text className="flex-1 text-sm text-gray-600 font-manrope">
                            To change your phone number, you'll need to verify your current number first for security purposes.
                        </Text>
                    </View>
                </View>

                <Pressable
                    onPress={() => router.push('/(screens)/verify-phone-change')}
                    className="bg-[#4A43EC] rounded-xl py-4 items-center"
                >
                    <Text className="text-white font-manrope-bold text-base">Edit Phone Number</Text>
                </Pressable>
            </View>
        </View>
    );
}
