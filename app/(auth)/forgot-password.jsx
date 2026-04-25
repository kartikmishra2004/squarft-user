import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ImageBackground, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMobile, setOtpFlow, clearError, clearAuthInputs } from "../../store/slices/authSlice";
import { sendOtpThunk } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

export default function ForgotPassword() {
    const dispatch = useDispatch();
    const { mobile, loading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(clearError());
        dispatch(clearAuthInputs());
    }, []);

    const handleSendOtp = async () => {
        dispatch(clearError());
        const result = await dispatch(sendOtpThunk({ phone: mobile, purpose: 'reset_password' }));
        if (sendOtpThunk.fulfilled.match(result)) {
            dispatch(setOtpFlow('reset_password'));
            router.push("/otp-verification");
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
                        <Text className="text-white text-[26px] font-manrope-bold mb-5">Forgot Password</Text>
                        <Text className="text-white/80 text-[14px]">Enter your registered mobile number</Text>
                    </ImageBackground>

                    <View className="flex-1 bg-white px-6 pt-10">

                        <Text className="text-gray-500 text-[13px] mb-1.5">Mobile Number</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-2 mb-4">
                            <TextInput
                                value={mobile}
                                onChangeText={(val) => dispatch(setMobile(val))}
                                placeholder="Phone Number"
                                placeholderTextColor="#aaa"
                                keyboardType="phone-pad"
                                className="text-[15px] text-black"
                            />
                        </View>

                        {error && (
                            <Text className="text-red-500 text-[13px] mb-4 text-center">{error}</Text>
                        )}

                        <TouchableOpacity
                            onPress={handleSendOtp}
                            disabled={loading}
                            className="bg-[#4A43EC] rounded-2xl py-4 items-center"
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text className="text-white text-[15px] font-semibold">Send OTP</Text>
                            }
                        </TouchableOpacity>

                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
