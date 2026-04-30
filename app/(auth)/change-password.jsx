import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ImageBackground, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { setNewPassword, setConfirmPassword, clearError, clearAuthInputs } from "../../store/slices/authSlice";
import { resetPasswordThunk } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

export default function ChangePassword() {
    const dispatch = useDispatch();
    const { newPassword, confirmPassword, verifiedToken, loading, error } = useSelector((state) => state.auth);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        dispatch(clearError());
        dispatch(clearAuthInputs());
    }, []);

    const handleSubmit = async () => {
        dispatch(clearError());
        if (newPassword !== confirmPassword) {
            return;
        }
        const result = await dispatch(resetPasswordThunk({ 
            verified_token: verifiedToken, 
            new_password: newPassword 
        }));
        
        if (resetPasswordThunk.fulfilled.match(result)) {
            router.push("/login");
        }
    };

    return (
        <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1">
                    <StatusBar style="light" />
                    <ImageBackground
                        source={require('../../assets/images/auth_grid_bg.png')}
                        style={{ paddingTop: 64, paddingBottom: 40, paddingHorizontal: 24, backgroundColor: '#4A43EC' }}
                        resizeMode="cover"
                    >
                        <View style={{ width: 60, height: 60, overflow: 'hidden', marginBottom: 1 }}>
                            <Image source={logo} style={{ width: 110, height: 110, margin: -26, }} resizeMode="contain" />
                        </View>
                        <Text className="text-white text-[26px] font-manrope-bold mb-5">Change Password</Text>
                        <Text className="text-white/80 text-[14px]">Set your new password</Text>
                    </ImageBackground>

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
                        <View className="border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center mb-4">
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

                        {error && (
                            <Text className="text-red-500 text-[13px] mb-4 text-center">{error}</Text>
                        )}

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className="bg-[#4A43EC] rounded-2xl py-4 items-center"
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text className="text-white text-[16px] font-semibold">Reset Password</Text>
                            }
                        </TouchableOpacity>

                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
