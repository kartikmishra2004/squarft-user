import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const APP_ICON = require("../../assets/icons/app-icon.png");

export default function ContactUs() {
    const profile = useSelector((state) => state.auth.profile);
    const insets = useSafeAreaInsets();

    const startAiSupport = () => {
        const phoneNumber = profile?.user?.phone || profile?.user?.phone_number;
        const name = profile?.user?.full_name || "App User";

        if (!phoneNumber) {
            Alert.alert(
                "Phone number needed",
                "Please add your phone number to your profile before starting an AI support call."
            );
            return;
        }

        router.push({
            pathname: "/(screens)/voice-agent",
            params: { phoneNumber, name },
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
            <View style={{ paddingTop: 50, paddingBottom: 12, paddingHorizontal: 18, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EEF2F7" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginRight: 12 }}>
                        <Feather name="arrow-left" size={20} color="#111827" />
                    </Pressable>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>Contact Us</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 18, paddingTop: 26, paddingBottom: Math.max(insets.bottom, 24) }}>
                <Text style={{ fontSize: 19, lineHeight: 25, fontWeight: "700", color: "#111827", letterSpacing: -0.2 }}>
                    We’re here to help.
                </Text>
                <Text style={{ marginTop: 6, fontSize: 12.5, lineHeight: 18, color: "#64748B", maxWidth: 300 }}>
                    Reach our team by email, visit our corporate office, or speak with AI customer support.
                </Text>

                <View style={{ marginTop: 22, backgroundColor: "#fff", borderRadius: 14, borderWidth: 1, borderColor: "#E8ECF2", overflow: "hidden" }}>
                    <View style={{ flexDirection: "row", padding: 14 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" }}>
                            <Ionicons name="mail-outline" size={16} color="#4A43EC" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ fontSize: 10.5, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5 }}>EMAIL</Text>
                            <Text style={{ marginTop: 3, fontSize: 13, fontWeight: "700", color: "#111827" }}>support@squarft.com</Text>
                        </View>
                    </View>

                    <View style={{ height: 1, backgroundColor: "#EEF2F7", marginHorizontal: 14 }} />

                    <View style={{ flexDirection: "row", padding: 14 }}>
                        <View style={{ width: 32, height: 32, borderRadius: 9, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" }}>
                            <Ionicons name="location-outline" size={17} color="#4A43EC" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={{ fontSize: 10.5, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.5 }}>CORPORATE OFFICE</Text>
                            <Text style={{ marginTop: 3, fontSize: 13, lineHeight: 19, fontWeight: "600", color: "#111827" }}>
                                214/ Sadhguru Parinay, Vijay Nagar, Indore
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 14, padding: 16, borderRadius: 14, backgroundColor: "#111827" }}>
                    <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="call-outline" size={17} color="#fff" />
                    </View>
                    <Text style={{ marginTop: 12, fontSize: 15, fontWeight: "700", color: "#fff" }}>AI Customer Support</Text>
                    <Text style={{ marginTop: 5, fontSize: 12.5, lineHeight: 18, color: "#CBD5E1" }}>
                        Speak with our AI for customer support through our AI customer support service.
                    </Text>
                    <Pressable
                        onPress={startAiSupport}
                        style={({ pressed }) => ({ marginTop: 14, paddingVertical: 11, borderRadius: 10, backgroundColor: pressed ? "#E2E8F0" : "#fff", alignItems: "center" })}
                    >
                        <Text style={{ fontSize: 13, fontWeight: "700", color: "#111827" }}>Start support call</Text>
                    </Pressable>
                </View>

                <View style={{ flex: 1, minHeight: 56 }} />
                <View style={{ alignItems: "center" }}>
                    <Image source={APP_ICON} style={{ width: 48, height: 48, borderRadius: 12 }} resizeMode="contain" />
                    <Text style={{ marginTop: 7, fontSize: 10.5, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.6 }}>SQUARFT</Text>
                </View>
            </ScrollView>
        </View>
    );
}
