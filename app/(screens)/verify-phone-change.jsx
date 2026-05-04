import React, { useState, useRef, useEffect } from "react";
import { View, Text, Pressable, TextInput, Alert, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { router } from "expo-router";
import { sendOtpThunk, verifyOtpThunk, setOtpDigit, clearOtp } from "../../store/slices/authSlice";

export default function VerifyPhoneChange() {
    const dispatch = useDispatch();
    const { profile, otp, otpToken, loading } = useSelector((state) => state.auth);
    const phoneNumber = profile?.user?.phone || "";
    
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    
    const inputRefs = useRef([]);

    useEffect(() => {
        // Send OTP when component mounts
        if (phoneNumber) {
            dispatch(sendOtpThunk({ phone: phoneNumber, purpose: 'phone_change' }));
        }
    }, [phoneNumber, dispatch]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleOtpChange = (index, value) => {
        if (value.length > 1) {
            value = value.slice(-1);
        }
        
        dispatch(setOtpDigit({ index, value }));

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (index, key) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            Alert.alert('Error', 'Please enter complete OTP');
            return;
        }

        try {
            const result = await dispatch(verifyOtpThunk({ otp_token: otpToken, otp: otpCode })).unwrap();
            dispatch(clearOtp());
            router.push('/(screens)/change-phone-number');
        } catch (error) {
            Alert.alert('Error', error || 'Invalid OTP');
        }
    };

    const handleResend = () => {
        if (canResend && phoneNumber) {
            dispatch(sendOtpThunk({ phone: phoneNumber, purpose: 'phone_change' }));
            setTimer(60);
            setCanResend(false);
            dispatch(clearOtp());
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="pt-14 pb-4 px-5 bg-white border-b border-gray-100">
                <View className="flex-row items-center">
                    <Pressable onPress={() => router.back()} className="mr-3">
                        <Feather name="arrow-left" size={24} color="#111827" />
                    </Pressable>
                    <Text className="text-xl font-manrope-bold text-gray-900">Verify Phone</Text>
                </View>
            </View>

            {/* Content */}
            <View className="flex-1 px-5 pt-8">
                <View className="items-center mb-8">
                    <View className="w-16 h-16 bg-[#EEF2FF] rounded-full items-center justify-center mb-4">
                        <Feather name="lock" size={28} color="#4A43EC" />
                    </View>
                    <Text className="text-2xl font-manrope-bold text-gray-900 mb-2">Enter OTP</Text>
                    <Text className="text-sm text-gray-500 font-manrope text-center">
                        We've sent a verification code to{'\n'}
                        <Text className="font-manrope-bold text-gray-900">{phoneNumber}</Text>
                    </Text>
                </View>

                {/* OTP Input */}
                <View className="flex-row justify-center mb-6" style={{ gap: 12 }}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(index, value)}
                            onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
                            keyboardType="number-pad"
                            maxLength={1}
                            className="w-12 h-14 bg-gray-50 border-2 border-gray-200 rounded-xl text-center text-xl font-manrope-bold text-gray-900"
                            style={{ borderColor: digit ? '#4A43EC' : '#E5E7EB' }}
                        />
                    ))}
                </View>

                {/* Timer/Resend */}
                <View className="items-center mb-8">
                    {canResend ? (
                        <Pressable onPress={handleResend}>
                            <Text className="text-[#4A43EC] font-manrope-bold text-sm">Resend OTP</Text>
                        </Pressable>
                    ) : (
                        <Text className="text-gray-500 font-manrope text-sm">
                            Resend OTP in {timer}s
                        </Text>
                    )}
                </View>

                {/* Verify Button */}
                <Pressable
                    onPress={handleVerify}
                    disabled={loading || otp.join('').length !== 6}
                    className="bg-[#4A43EC] rounded-xl py-4 items-center"
                    style={{ opacity: loading || otp.join('').length !== 6 ? 0.5 : 1 }}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-manrope-bold text-base">Verify & Continue</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}
