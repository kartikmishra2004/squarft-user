import { Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, Alert, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState } from "react";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { profileApi } from "../../services/profileApi";

export default function ChangePasswordProfile() {
    const { token } = useSelector((state) => state.auth);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            await profileApi.changePassword(token, currentPassword, newPassword);
            
            Alert.alert(
                "Success",
                "Your password has been changed successfully",
                [
                    {
                        text: "OK",
                        onPress: () => router.back()
                    }
                ]
            );
        } catch (err) {
            setError(err.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView className="flex-1 bg-white" behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="flex-1">
                    <StatusBar style="dark" />
                    
                    {/* Header */}
                    <View className="px-6 pt-16 pb-6 border-b border-gray-100">
                        <TouchableOpacity onPress={() => router.back()} className="mb-4">
                            <Ionicons name="arrow-back" size={24} color="#111827" />
                        </TouchableOpacity>
                        <Text className="text-gray-900 text-[26px] font-bold mb-2">Change Password</Text>
                        <Text className="text-gray-500 text-[14px]">Update your account password</Text>
                    </View>

                    <View className="flex-1 px-6 pt-8">
                        {/* Current Password */}
                        <Text className="text-gray-500 text-[13px] mb-1.5">Current Password</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center mb-5">
                            <TextInput
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Enter current password"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showCurrent}
                                className="flex-1 text-[15px] text-black"
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                                <Ionicons name={showCurrent ? "eye-outline" : "eye-off-outline"} size={20} color="#aaa" />
                            </TouchableOpacity>
                        </View>

                        {/* New Password */}
                        <Text className="text-gray-500 text-[13px] mb-1.5">New Password</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center mb-5">
                            <TextInput
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter new password"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showNew}
                                className="flex-1 text-[15px] text-black"
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                <Ionicons name={showNew ? "eye-outline" : "eye-off-outline"} size={20} color="#aaa" />
                            </TouchableOpacity>
                        </View>

                        {/* Confirm Password */}
                        <Text className="text-gray-500 text-[13px] mb-1.5">Confirm New Password</Text>
                        <View className="border border-gray-200 rounded-xl px-4 py-3.5 flex-row items-center mb-4">
                            <TextInput
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm new password"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showConfirm}
                                className="flex-1 text-[15px] text-black"
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <Ionicons name={showConfirm ? "eye-outline" : "eye-off-outline"} size={20} color="#aaa" />
                            </TouchableOpacity>
                        </View>

                        {error ? (
                            <Text className="text-red-500 text-[13px] mb-4 text-center">{error}</Text>
                        ) : null}

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className="bg-[#4A43EC] rounded-2xl py-4 items-center mt-2"
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white text-[16px] font-semibold">Change Password</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
