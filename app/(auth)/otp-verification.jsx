import { Text, View, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ImageBackground, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOtpDigit, clearOtp, setLoggedIn, clearError, clearAuthInputs } from "../../store/slices/authSlice";
import { verifyOtpThunk, sendOtpThunk } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

export default function OtpVerification() {
    const dispatch = useDispatch();
    const { otp, otpFlow, otpToken, mobile, loading, error } = useSelector((state) => state.auth);
    const inputs = useRef([]);

    useEffect(() => {
        dispatch(clearError());
        dispatch(clearAuthInputs());
    }, []);

    const handleChange = (text, index) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        dispatch(setOtpDigit({ index, value: digit }));
        if (digit && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        dispatch(clearError());
        const otpString = otp.join('');
        const result = await dispatch(verifyOtpThunk({ otp_token: otpToken, otp: otpString }));
        
        if (verifyOtpThunk.fulfilled.match(result)) {
            dispatch(clearOtp());
            if (otpFlow === 'reset_password') {
                router.push("/change-password");
            } else {
                dispatch(setLoggedIn(true));
                router.replace("/(tabs)/home");
            }
        }
    };

    const handleResend = async () => {
        dispatch(clearError());
        dispatch(clearOtp());
        const purpose = otpFlow === 'reset_password' ? 'reset_password' : 'register';
        await dispatch(sendOtpThunk({ phone: mobile, purpose }));
        inputs.current[0]?.focus();
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
                            <Image source={logo} style={{ width: 110, height: 110, margin: -26,  }} resizeMode="contain" />
                        </View>
                        <Text className="text-white text-[26px] font-manrope-bold mb-5 ">OTP Verification</Text>
                        <Text className="text-white/80 text-[14px] font-lato-regular">OTP has been sent to your registered mobile number</Text>
                    </ImageBackground>

                    <View className="flex-1 bg-white px-8 pt-10 ">
                        <View className="flex-row justify-center mb-10" style={{ gap: 12 }}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => (inputs.current[index] = ref)}
                                    value={digit}
                                    onChangeText={(text) => handleChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="number-pad"
                                    maxLength={1}
                                    style={{
                                        marginTop: 10,
                                        marginBottom: 10,
                                        width: 48, height: 56,
                                        borderWidth: 1,
                                        borderColor: digit ? '#4A43EC' : '#E5E7EB',
                                        borderRadius: 12,
                                        textAlign: 'center',
                                        fontSize: 18,
                                        color: '#000',
                                    }}
                                />
                            ))}
                        </View>

                        {error && (
                            <Text className="text-red-500 text-[13px] mb-4 text-center">{error}</Text>
                        )}

                        <TouchableOpacity 
                            onPress={handleVerify} 
                            disabled={loading}
                            className="bg-[#4A43EC] rounded-2xl py-4 items-center mb-10"
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text className="text-white text-[15px] font-semibold">Submit</Text>
                            }
                        </TouchableOpacity>

                        <View className="flex-row justify-center items-center">
                            <Text className="text-gray-500 text-[14px]">Didn't get the OTP?  </Text>
                            <TouchableOpacity onPress={handleResend}>
                                <Text className="text-[#4A43EC] text-[14px] font-semibold">Resend OTP</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
