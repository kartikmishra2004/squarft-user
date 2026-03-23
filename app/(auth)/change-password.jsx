import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { setNewPassword, setConfirmPassword, setLoggedIn } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

export default function ChangePassword() {
    const dispatch = useDispatch();
    const { newPassword, confirmPassword } = useSelector((state) => state.auth);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = () => {
        // 
        dispatch(setLoggedIn(true));
        router.replace("/(tabs)/home");
    };

    return (
        <View className="flex-1">
            <StatusBar style="light" />

            {/*  */}
            <View className="bg-[#4A43EC] pt-16 pb-10 px-6">
                <View style={{ width: 60, height: 60, overflow: 'hidden' }} className="mb-6">
                    <Image source={logo} style={{ width: 110, height: 110, margin: -20 }} resizeMode="contain" />
                </View>
                <Text className="text-white text-[36px] font-bold mb-1">Change Password</Text>
                <Text className="text-white/80 text-[14px]">Set your new password</Text>
            </View>

            {/* */}
            <View className="flex-1 bg-white px-6 pt-8">

                <Text className="text-gray-500 text-[13px] mb-1.5">New Password</Text>
                <View className="border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center mb-5">
                    <TextInput
                        value={newPassword}
                        onChangeText={(val) => dispatch(setNewPassword(val))}
                        placeholder="••••••••"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!showNew}
                        className="flex-1 text-[15px] text-black"
                    />
                    <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                        <Ionicons name={showNew ? "eye-outline" : "eye-off-outline"} size={20} color="#aaa" />
                    </TouchableOpacity>
                </View>

                <Text className="text-gray-500 text-[13px] mb-1.5">Confirm Password</Text>
                <View className="border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center mb-8">
                    <TextInput
                        value={confirmPassword}
                        onChangeText={(val) => dispatch(setConfirmPassword(val))}
                        placeholder="••••••••"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!showConfirm}
                        className="flex-1 text-[15px] text-black"
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                        <Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color="#aaa" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    className="bg-[#4A43EC] rounded-2xl py-4 items-center"
                >
                    <Text className="text-white text-[16px] font-semibold">Log In</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}
