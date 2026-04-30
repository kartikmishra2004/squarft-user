import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ScrollView, ImageBackground, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { setPassword, setConfirmPassword, setOtpFlow, clearError, setMobile, clearAuthInputs } from "../../store/slices/authSlice";
import { registerThunk } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

export default function Register() {
    const dispatch = useDispatch();
    const { password, confirmPassword, loading, error, mobile } = useSelector((state) => state.auth);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        dispatch(clearError());
        dispatch(clearAuthInputs());
    }, []);

    const handleRegister = async () => {
        dispatch(clearError());
        if (password !== confirmPassword) {
            return;
        }
        const result = await dispatch(registerThunk({
            phone: mobile,
            password,
            first_name: firstName,
            last_name: lastName,
        }));
        if (registerThunk.fulfilled.match(result)) {
            // Registration successful, go directly to login
            router.push("/login");
        }
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
                        style={{ paddingTop: 64, paddingBottom: 40, paddingHorizontal: 24, backgroundColor: '#4A43EC' }}
                        resizeMode="cover"
                    >
                        <View style={{ width: 60, height: 60, overflow: 'hidden', marginBottom: 1 }}>
                            <Image source={logo} style={{ width: 110, height: 110, margin: -26, }} resizeMode="contain" />
                        </View>
                        <Text className="text-white text-[26px] font-manrope-bold mb-5">Register</Text>
                        <Link href="/login">
                            <Text className="text-white/80 text-[14px] underline">Log in</Text>
                        </Link>
                    </ImageBackground>

                    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ padding: 24, paddingTop: 32 }} keyboardShouldPersistTaps="handled">

                        <Text className="text-gray-500 text-[13px] mb-1.5">First Name</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-2 mb-5">
                            <TextInput
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder=""
                                placeholderTextColor="#aaa"
                                className="text-[15px] text-black"
                            />
                        </View>

                        <Text className="text-gray-500 text-[13px] mb-1.5">Last Name</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-2 mb-5">
                            <TextInput
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder=""
                                placeholderTextColor="#aaa"
                                className="text-[15px] text-black"
                            />
                        </View>

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

                        {error && (
                            <Text className="text-red-500 text-[13px] mb-4 text-center">{error}</Text>
                        )}

                        <TouchableOpacity
                            onPress={handleRegister}
                            disabled={loading}
                            className="bg-[#4A43EC] rounded-2xl py-4 items-center"
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text className="text-white text-[16px] font-semibold">Register</Text>
                            }
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
