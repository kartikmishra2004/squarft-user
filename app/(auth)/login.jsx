import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ScrollView, ImageBackground, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { setMobile, setPassword, toggleRememberMe, clearError, clearAuthInputs } from "../../store/slices/authSlice";
import { loginThunk } from "../../store/slices/authSlice";
const logo = require("../../assets/icons/app-icon.png");

export default function Login() {
    const dispatch = useDispatch();
    const { mobile, password, rememberMe, loading, error } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        dispatch(clearError());
        dispatch(clearAuthInputs());
    }, []);

    const handleLogin = async () => {
        dispatch(clearError());
        const result = await dispatch(loginThunk({ phone: mobile, password }));
        if (loginThunk.fulfilled.match(result)) {
            router.replace("/(tabs)/home");
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
                        <Text className="text-white text-[26px] font-manrope-bold mb-5">Login</Text>
                        <View className="flex-row items-center ">
                            <Text className="text-white/80 text-[14px]">Don&apos;t have an account? </Text>
                            <Link href="/register">
                                <Text className="text-white text-[14px] font-semibold underline">Sign Up</Text>
                            </Link>
                        </View>
                    </ImageBackground>

                    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 32 }} keyboardShouldPersistTaps="handled">


                        <Text className="text-gray-500 text-[13px] mb-1.5">Phone Number</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-2 mb-5">
                            <TextInput
                                value={mobile}
                                onChangeText={(val) => dispatch(setMobile(val))}
                                placeholder="Phone Number"
                                placeholderTextColor="#aaa"
                                keyboardType="phone-pad"
                                className="text-[15px] text-black"
                            />
                        </View>


                        <Text className="text-gray-500 text-[13px] mb-1.5">Password</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-2 flex-row items-center mb-4">
                            <TextInput
                                value={password}
                                onChangeText={(val) => dispatch(setPassword(val))}
                                placeholder="••••••••"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showPassword}
                                className="flex-1 text-[15px] text-black"
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color="#aaa"
                                />
                            </TouchableOpacity>
                        </View>


                        <View className="flex-row items-center justify-between mb-7">
                            <TouchableOpacity
                                className="flex-row items-center gap-2"
                                onPress={() => dispatch(toggleRememberMe())}
                            >
                                <View className={`w-4 h-4 border rounded-sm items-center justify-center ${rememberMe ? "bg-[#4A43EC] border-[#4A43EC]" : "border-gray-400"}`}>
                                    {rememberMe && <Ionicons name="checkmark" size={11} color="white" />}
                                </View>
                                <Text className="text-gray-500 text-[13px]">Remember me</Text>
                            </TouchableOpacity>
                            <Link href="/forgot-password">
                                <Text className="text-[#4A43EC] text-[13px]">Forgot Password ?</Text>
                            </Link>
                        </View>


                        {error && (
                            <Text className="text-red-500 text-[13px] mb-4 text-center">{error}</Text>
                        )}

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            className="bg-[#4A43EC] rounded-2xl py-4 items-center mb-8"
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text className="text-white text-[16px] font-lato-bold">Log In</Text>
                            }
                        </TouchableOpacity>


                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
