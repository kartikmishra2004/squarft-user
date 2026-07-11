import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSelector } from "react-redux";

const APP_ICON = require("../../assets/icons/app-icon.png");

export default function ContactUs() {
    const profile = useSelector((state) => state.auth.profile);

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
            <View style={{ paddingTop: 54, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EEF2F7" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Pressable onPress={() => router.back()} hitSlop={10} style={{ marginRight: 14 }}>
                        <Feather name="arrow-left" size={24} color="#111827" />
                    </Pressable>
                    <Text style={{ fontSize: 20, fontWeight: "800", color: "#111827" }}>Contact Us</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingTop: 38, paddingBottom: 32 }}>
                <Text style={{ fontSize: 26, lineHeight: 34, fontWeight: "800", color: "#111827", letterSpacing: -0.5 }}>
                    We’re here to help.
                </Text>
                <Text style={{ marginTop: 10, fontSize: 14, lineHeight: 22, color: "#64748B", maxWidth: 310 }}>
                    Reach our team by email, visit our corporate office, or speak with AI customer support.
                </Text>

                <View style={{ marginTop: 34, backgroundColor: "#fff", borderRadius: 18, borderWidth: 1, borderColor: "#E8ECF2", overflow: "hidden" }}>
                    <View style={{ flexDirection: "row", padding: 18 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" }}>
                            <Ionicons name="mail-outline" size={20} color="#4A43EC" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={{ fontSize: 12, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.6 }}>EMAIL</Text>
                            <Text style={{ marginTop: 5, fontSize: 15, fontWeight: "700", color: "#111827" }}>support@squarft.com</Text>
                        </View>
                    </View>

                    <View style={{ height: 1, backgroundColor: "#EEF2F7", marginHorizontal: 18 }} />

                    <View style={{ flexDirection: "row", padding: 18 }}>
                        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" }}>
                            <Ionicons name="location-outline" size={21} color="#4A43EC" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={{ fontSize: 12, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.6 }}>CORPORATE OFFICE</Text>
                            <Text style={{ marginTop: 5, fontSize: 15, lineHeight: 23, fontWeight: "600", color: "#111827" }}>
                                214/ Sadhguru Parinay, Vijay Nagar, Indore
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: 18, padding: 20, borderRadius: 18, backgroundColor: "#111827" }}>
                    <View style={{ width: 42, height: 42, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="call-outline" size={21} color="#fff" />
                    </View>
                    <Text style={{ marginTop: 16, fontSize: 18, fontWeight: "800", color: "#fff" }}>AI Customer Support</Text>
                    <Text style={{ marginTop: 7, fontSize: 14, lineHeight: 21, color: "#CBD5E1" }}>
                        Speak with our AI for customer support through our AI customer support service.
                    </Text>
                    <Pressable
                        onPress={startAiSupport}
                        style={({ pressed }) => ({ marginTop: 18, paddingVertical: 13, borderRadius: 12, backgroundColor: pressed ? "#E2E8F0" : "#fff", alignItems: "center" })}
                    >
                        <Text style={{ fontSize: 14, fontWeight: "800", color: "#111827" }}>Start support call</Text>
                    </Pressable>
                </View>

                <View style={{ flex: 1, minHeight: 72 }} />
                <View style={{ alignItems: "center" }}>
                    <Image source={APP_ICON} style={{ width: 64, height: 64, borderRadius: 16 }} resizeMode="contain" />
                    <Text style={{ marginTop: 9, fontSize: 12, fontWeight: "700", color: "#94A3B8", letterSpacing: 0.8 }}>SQUARFT</Text>
                </View>
            </ScrollView>
        </View>
    );
}
