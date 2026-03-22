import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOtpDigit, clearOtp, setLoggedIn } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

export default function OtpVerification() {
    const dispatch = useDispatch();
    const { otp, otpFlow } = useSelector((state) => state.auth);
    const inputs = useRef([]);

    const handleChange = (text, index) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        dispatch(setOtpDigit({ index, value: digit }));
        if (digit && index < 3) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        dispatch(clearOtp());
        if (otpFlow === 'forgot-password') {
            router.push("/change-password");
        } else {
            dispatch(setLoggedIn(true));
            router.replace("/(tabs)/home");
        }
    };

    const handleResend = () => {
        dispatch(clearOtp());
        inputs.current[0]?.focus();
      
    };

    return (
        <View className="flex-1">
            <StatusBar style="light" />

            <View className="bg-[#4A43EC] pt-16 pb-10 px-6">
                <View style={{ width: 60, height: 60, overflow: 'hidden' }} className="mb-6">
                    <Image source={logo} style={{ width: 110, height: 110, margin: -20 }} resizeMode="contain" />
                </View>
                <Text className="text-white text-[36px] font-bold mb-1">OTP Verification</Text>
                <Text className="text-white/80 text-[14px]">OTP has been sent to your registered mobile number</Text>
            </View>

            <View className="flex-1 bg-white px-6 pt-10">

                <View className="flex-row justify-between mb-10">
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
                                width: 70,
                                height: 70,
                                borderWidth: 1,
                                borderColor: digit ? '#4A43EC' : '#E5E7EB',
                                borderRadius: 12,
                                textAlign: 'center',
                                fontSize: 22,
                                color: '#000',
                            }}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    onPress={handleVerify}
                    className="bg-[#4A43EC] rounded-2xl py-4 items-center mb-6"
                >
                    <Text className="text-white text-[16px] font-semibold">Submit</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center">
                    <Text className="text-gray-500 text-[14px]">Didn't get the OTP?  </Text>
                    <TouchableOpacity onPress={handleResend}>
                        <Text className="text-[#4A43EC] text-[14px] font-semibold">Resend OTP</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}
