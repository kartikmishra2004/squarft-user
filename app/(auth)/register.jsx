import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ScrollView, ImageBackground } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { setName, setMobile, setPassword, setConfirmPassword, setOtpFlow } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

export default function Register() {
    const dispatch = useDispatch();
    const { name, mobile, password, confirmPassword } = useSelector((state) => state.auth);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleRegister = () => {
        dispatch(setOtpFlow('register'));
        router.push("/otp-verification");
    };

    return (
        <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1">
                    <StatusBar style="light" />

                    <ImageBackground
                        source={require('../../assets/images/auth_grid_bg.png')}
                        style={{ paddingTop: 64, paddingBottom: 40, paddingHorizontal: 28, backgroundColor: '#4A43EC' }}
                        resizeMode="cover"
                    >
                        <View style={{ width: 60, height: 60, overflow: 'hidden', marginBottom: 20, marginTop: 16 }}>
                            <Image source={logo} style={{ width: 110, height: 110, margin: -30 }} resizeMode="contain" />
                        </View>
                        <Text className="text-white text-[36px] font-bold mb-1">Register</Text>
                        <Link href="/login">
                            <Text className="text-white text-[14px] underline">Log in</Text>
                        </Link>
                    </ImageBackground>

                    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 32 }} keyboardShouldPersistTaps="handled">

                        <Text className="text-gray-500 text-[13px] mb-1.5">Enter Your Name</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-2 mb-5">
                            <TextInput
                                value={name}
                                onChangeText={(val) => dispatch(setName(val))}
                                placeholder="Name"
                                placeholderTextColor="#aaa"
                                className="text-[15px] text-black"
                            />
                        </View>

                        <Text className="text-gray-500 text-[13px] mb-1.5">Enter Your Mobile Number</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-2 mb-5">
                            <TextInput
                                value={mobile}
                                onChangeText={(val) => dispatch(setMobile(val))}
                                placeholder="Number"
                                placeholderTextColor="#aaa"
                                keyboardType="phone-pad"
                                className="text-[15px] text-black"
                            />
                        </View>

                        <Text className="text-gray-500 text-[13px] mb-1.5">Password</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-2 flex-row items-center mb-5">
                            <TextInput
                                value={password}
                                onChangeText={(val) => dispatch(setPassword(val))}
                                placeholder="••••••••"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showConfirm}
                                className="flex-1 text-[15px] text-black"
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color="#aaa" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 text-[13px] mb-1.5">Confirm Password</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-2 flex-row items-center mb-8">
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
                            onPress={handleRegister}
                            className="bg-[#4A43EC] rounded-2xl py-4 items-center"
                        >
                            <Text className="text-white text-[16px] font-semibold">Register</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
