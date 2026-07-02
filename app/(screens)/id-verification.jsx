import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const DOCUMENTS = [
    {
        key: "profile_photo",
        title: "Profile Photo",
        subtitle: "Clear face photo",
        icon: "account-circle-outline",
    },
    {
        key: "aadhaar_front",
        title: "Aadhaar Card",
        subtitle: "Front side photo",
        icon: "card-account-details-outline",
    },
    {
        key: "pan_card",
        title: "PAN Card",
        subtitle: "Full card photo",
        icon: "credit-card-outline",
    },
];

const getStatusMeta = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (["approved", "verified"].includes(normalized)) {
        return { label: "Verified", color: "#10B981", bg: "#ECFDF5", icon: "check-circle" };
    }
    if (normalized === "rejected") {
        return { label: "Rejected", color: "#EF4444", bg: "#FEF2F2", icon: "x-circle" };
    }
    return { label: "Pending Review", color: "#F59E0B", bg: "#FFFBEB", icon: "clock" };
};

function DocumentPickerRow({ item, pickedFile, onPick }) {
    const previewUri = pickedFile?.uri;

    return (
        <Pressable
            onPress={onPick}
            style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: pickedFile ? "#4A43EC" : "#EEF2F7",
                marginBottom: 12,
            }}
        >
            <View style={{ width: 54, height: 54, borderRadius: 12, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {previewUri ? (
                    <Image source={{ uri: previewUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : (
                    <MaterialCommunityIcons name={item.icon} size={25} color="#4A43EC" />
                )}
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 14, color: "#111827", fontWeight: "800" }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                    {pickedFile ? "Selected on this device" : item.subtitle}
                </Text>
            </View>

            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" }}>
                <Feather name={previewUri ? "edit-2" : "upload"} size={16} color="#111827" />
            </View>
        </Pressable>
    );
}

export default function IdVerification() {
    const [submitting, setSubmitting] = useState(false);
    const [pickedFiles, setPickedFiles] = useState({});

    const statusMeta = useMemo(
        () => getStatusMeta("pending"),
        []
    );

    const pickImage = async (key) => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert("Permission needed", "Allow photo access to upload your verification documents.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
            quality: 0.85,
        });

        if (result.canceled) return;

        const asset = result.assets?.[0];
        if (!asset?.uri) return;

        setPickedFiles((current) => ({
            ...current,
            [key]: {
                uri: asset.uri,
                name: asset.fileName || `${key}.jpg`,
                type: asset.mimeType || "image/jpeg",
            },
        }));
    };

    const submitDocuments = async () => {
        if (Object.keys(pickedFiles).length === 0) {
            Alert.alert("Choose documents", "Select at least one document to upload.");
            return;
        }

        setSubmitting(true);
        setTimeout(() => {
            setPickedFiles({});
            setSubmitting(false);
            Alert.alert("Saved locally", "Document upload is not connected to the backend right now.");
        }, 300);
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
            <View style={{ paddingTop: 54, paddingBottom: 16, paddingHorizontal: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#EEF2F7" }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Pressable onPress={() => router.back()} style={{ marginRight: 14 }}>
                        <Feather name="arrow-left" size={24} color="#111827" />
                    </Pressable>
                    <Text style={{ fontSize: 20, color: "#111827", fontWeight: "800" }}>ID Verification</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
                <View style={{ backgroundColor: statusMeta.bg, borderRadius: 14, padding: 14, marginBottom: 18, flexDirection: "row", alignItems: "center" }}>
                    <Feather name={statusMeta.icon} size={20} color={statusMeta.color} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={{ fontSize: 14, color: statusMeta.color, fontWeight: "800" }}>{statusMeta.label}</Text>
                        <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                            Backend upload is currently disconnected.
                        </Text>
                    </View>
                </View>

                {DOCUMENTS.map((item) => (
                    <DocumentPickerRow
                        key={item.key}
                        item={item}
                        pickedFile={pickedFiles[item.key]}
                        onPick={() => pickImage(item.key)}
                    />
                ))}

                <Pressable
                    onPress={submitDocuments}
                    disabled={submitting}
                    style={{
                        marginTop: 8,
                        backgroundColor: submitting ? "#9CA3AF" : "#4A43EC",
                        borderRadius: 14,
                        paddingVertical: 16,
                        alignItems: "center",
                    }}
                >
                    {submitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>Save Selection</Text>
                    )}
                </Pressable>
            </ScrollView>
        </View>
    );
}
