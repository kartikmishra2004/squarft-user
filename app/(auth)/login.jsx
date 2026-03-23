import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import { setMobile, setPassword, toggleRememberMe, setLoggedIn } from "../../store/slices/authSlice";
const logo = require("../../assets/icons/app-icon.png");

export default function Login() {
    const dispatch = useDispatch();
    const { mobile, password, rememberMe } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = () => {
       
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
                <Text className="text-white text-[36px] font-bold mb-1">Login</Text>
                <View className="flex-row items-center">
                    <Text className="text-white/80 text-[14px]">Don't have an account? </Text>
                    <Link href="/register">
                        <Text className="text-white text-[14px] font-semibold underline">Sign Up</Text>
                    </Link>
                </View>
            </View>

            <View className="flex-1 bg-white px-6 pt-8">

             
                <Text className="text-gray-500 text-[13px] mb-1.5">Mobile Number</Text>
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

                {/* Password */}
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

        
                <TouchableOpacity
                    onPress={handleLogin}
                    className="bg-[#4A43EC] rounded-2xl py-4 items-center mb-8"
                >
                    <Text className="text-white text-[16px] font-lato-bold">Log In</Text>
                </TouchableOpacity>

        
              <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 rounded-3xl py-4 mb-4 relative">
    <Image 
        source={require('../../assets/icons/google.png')} 
        style={{ width: 20, height: 20, position: 'absolute', left: 20 }} 
        resizeMode="contain"
    />
    <Text className="text-black text-[15px] font-semibold">Continue With Google</Text>
</TouchableOpacity>

                <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 rounded-3xl py-4 mb-4 relative">
                       <Image 
        source={require('../../assets/icons/apple-logo.png')} 
        style={{ width: 20, height: 20, position: 'absolute', left: 20 }} 
        resizeMode="contain"
    />
                    <Text className="text-black text-[15px] font-semibold">Continue With Apple</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}
