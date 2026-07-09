import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { userVerificationApi } from "../../services/userVerificationApi";
import { fetchProfileThunk } from "../../store/slices/authSlice";

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

const REQUIRED_DOCUMENT_TYPES = DOCUMENTS.map((item) => item.key);
const APPROVED_STATUSES = ["approved", "verified"];

const getStatusMeta = (status, completed = false) => {
    if (completed) {
        return { label: "Verification Completed", color: "#10B981", bg: "#ECFDF5", icon: "check-circle" };
    }

    const normalized = String(status || "").toLowerCase();
    if (["approved", "verified", "fully_verified"].includes(normalized)) {
        return { label: "Verified", color: "#10B981", bg: "#ECFDF5", icon: "check-circle" };
    }
    if (["rejected"].includes(normalized)) {
        return { label: "Rejected", color: "#EF4444", bg: "#FEF2F2", icon: "x-circle" };
    }
    if (["pending", "under_review", "partially_verified"].includes(normalized)) {
        return { label: "Pending Review", color: "#F59E0B", bg: "#FFFBEB", icon: "clock" };
    }
    return { label: "Not Submitted", color: "#6B7280", bg: "#F9FAFB", icon: "upload-cloud" };
};

const isLockedStatus = (status) => APPROVED_STATUSES.includes(String(status || "").toLowerCase());

const getDocumentStatus = (verificationData, documentsByType, documentType) =>
    documentsByType[documentType]?.verification_status
    || verificationData?.documents_status?.[documentType]?.status
    || "not_uploaded";

const isVerificationComplete = (verificationData, documentsByType) => {
    if (verificationData?.is_kyc_verified) return true;
    if (Number(verificationData?.completion_percentage) >= 100) return true;

    return REQUIRED_DOCUMENT_TYPES.every((type) =>
        isLockedStatus(getDocumentStatus(verificationData, documentsByType, type))
    );
};

function DocumentPickerRow({ item, pickedFile, existingDocument, documentStatus, onPick, onView }) {
    const previewUri = pickedFile?.uri || existingDocument?.file_url;
    const statusMeta = getStatusMeta(documentStatus);
    const locked = isLockedStatus(documentStatus);
    const canView = Boolean(existingDocument?.file_url);

    return (
        <Pressable
            onPress={locked ? undefined : onPick}
            style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#fff",
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: pickedFile ? "#4A43EC" : locked ? "#D1FAE5" : "#EEF2F7",
                marginBottom: 12,
                opacity: locked ? 0.9 : 1,
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
                    {pickedFile ? "Selected on this device" : existingDocument ? statusMeta.label : item.subtitle}
                </Text>
                {existingDocument?.rejection_reason ? (
                    <Text style={{ fontSize: 11, color: "#EF4444", marginTop: 3 }}>{existingDocument.rejection_reason}</Text>
                ) : null}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {canView ? (
                    <TouchableOpacity
                        onPress={onView}
                        activeOpacity={0.8}
                        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" }}
                    >
                        <Feather name="eye" size={16} color="#4A43EC" />
                    </TouchableOpacity>
                ) : null}
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: statusMeta.bg, alignItems: "center", justifyContent: "center" }}>
                    <Feather name={locked ? "check" : previewUri ? "edit-2" : "upload"} size={16} color={locked ? "#10B981" : "#111827"} />
                </View>
            </View>
        </Pressable>
    );
}

export default function IdVerification() {
    const dispatch = useDispatch();
    const { token, isLoggedIn } = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [pickedFiles, setPickedFiles] = useState({});
    const [verificationData, setVerificationData] = useState(null);

    const documentsByType = useMemo(() => {
        const documents = verificationData?.documents || [];
        return documents.reduce((acc, document) => {
            acc[document.document_type] = document;
            return acc;
        }, {});
    }, [verificationData]);

    const verificationComplete = useMemo(
        () => isVerificationComplete(verificationData, documentsByType),
        [verificationData, documentsByType]
    );

    const statusMeta = useMemo(
        () => getStatusMeta(verificationData?.overall_status, verificationComplete),
        [verificationData?.overall_status, verificationComplete]
    );

    const loadVerification = useCallback(async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const response = await userVerificationApi.getDocuments(token);
            setVerificationData(response.data);
        } catch (error) {
            Alert.alert("Unable to load verification", error.message || "Please try again.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        loadVerification();
    }, [loadVerification]);

    const pickImage = async (key) => {
        const documentStatus = getDocumentStatus(verificationData, documentsByType, key);
        if (isLockedStatus(documentStatus)) {
            Alert.alert("Already verified", "This document has already been verified.");
            return;
        }

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

    const viewDocument = async (fileUrl) => {
        if (!fileUrl) return;

        try {
            const canOpen = await Linking.canOpenURL(fileUrl);
            if (!canOpen) {
                Alert.alert("Cannot open document", "No app is available to preview this document.");
                return;
            }
            await Linking.openURL(fileUrl);
        } catch (_error) {
            Alert.alert("Cannot open document", "Please try again.");
        }
    };

    const submitDocuments = async () => {
        if (!isLoggedIn || !token) {
            Alert.alert("Login required", "Please login before uploading verification documents.");
            return;
        }

        if (Object.keys(pickedFiles).length === 0) {
            Alert.alert("Choose documents", "Select at least one document to upload.");
            return;
        }

        const uploads = Object.entries(pickedFiles).filter(([documentType]) => {
            const existingDocument = documentsByType[documentType];
            return !isLockedStatus(existingDocument?.verification_status);
        });

        if (uploads.length === 0) {
            Alert.alert("Nothing to upload", "Verified documents cannot be replaced from the app.");
            return;
        }

        try {
            setSubmitting(true);
            for (const [documentType, file] of uploads) {
                const existingDocument = documentsByType[documentType];
                if (existingDocument?.id) {
                    await userVerificationApi.updateDocument(token, {
                        documentId: existingDocument.id,
                        documentType,
                        file,
                    });
                } else {
                    await userVerificationApi.uploadDocument(token, {
                        documentType,
                        file,
                    });
                }
            }

            setPickedFiles({});
            await loadVerification();
            dispatch(fetchProfileThunk());
            Alert.alert("Submitted", "Your documents have been sent for verification.");
        } catch (error) {
            Alert.alert("Upload failed", error.message || "Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const completionPercentage = verificationData?.completion_percentage ?? 0;
    const nextStepText = verificationComplete
        ? "All required documents are verified."
        : verificationData?.next_steps?.[0] || "Upload the required documents to start verification.";

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
                            {loading ? "Checking verification status..." : `${completionPercentage}% complete. ${nextStepText}`}
                        </Text>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator color="#4A43EC" style={{ marginVertical: 24 }} />
                ) : (
                    DOCUMENTS.map((item) => {
                        const existingDocument = documentsByType[item.key];
                        return (
                            <DocumentPickerRow
                                key={item.key}
                                item={item}
                                pickedFile={pickedFiles[item.key]}
                                existingDocument={existingDocument}
                                documentStatus={getDocumentStatus(verificationData, documentsByType, item.key)}
                                onPick={() => pickImage(item.key)}
                                onView={() => viewDocument(existingDocument?.file_url)}
                            />
                        );
                    })
                )}

                {!verificationComplete ? (
                    <Pressable
                        onPress={submitDocuments}
                        disabled={submitting || loading}
                        style={{
                            marginTop: 8,
                            backgroundColor: submitting || loading ? "#9CA3AF" : "#4A43EC",
                            borderRadius: 14,
                            paddingVertical: 16,
                            alignItems: "center",
                        }}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "800" }}>Submit Documents</Text>
                        )}
                    </Pressable>
                ) : null}
            </ScrollView>
        </View>
    );
}
