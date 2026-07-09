import {
    View, Text, Image, TouchableOpacity,
    ScrollView, Switch, Alert, ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { router, useFocusEffect } from "expo-router";
import { logout, fetchProfileThunk, updateProfilePictureThunk } from "../../store/slices/authSlice";
import { currentUser } from "../../data/user";
import { ProfileSkeleton } from "../../components/SkeletonLoader";
import { userVerificationApi } from "../../services/userVerificationApi";

const cardShadow = {
    shadowColor: "#7a7878ff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
};

function SectionLabel({ text }) {
    return (
        <Text style={{
            fontSize: 11, fontWeight: '700', color: '#9CA3AF',
            letterSpacing: 1, marginHorizontal: 20,
            marginTop: 24, marginBottom: 8,
        }}>
            {text}
        </Text>
    );
}

function SettingsCard({ children, style }) {
    return (
        <View style={[{
            marginHorizontal: 16,
            backgroundColor: '#ffffffff',
            borderRadius: 16,
            overflow: 'hidden',
            ...cardShadow,
        }, style]}>
            {children}
        </View>
    );
}

function RowDivider() {
    return <View style={{ height: 2, backgroundColor: '#F3F4F6', marginLeft: 20, marginRight: 20 }} />;
}

function SettingsRow({ icon, iconBg, label, sublabel, sublabelColor, right, onPress, isLast }) {
    return (
        <>
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 }}
            >
                <View style={{
                    width: 36, height: 36, borderRadius: 10,
                    backgroundColor: iconBg ?? '#EEF2FF',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 12,
                }}>
                    {icon}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{label}</Text>
                    {sublabel ? (
                        <Text style={{ fontSize: 12, color: sublabelColor ?? '#9CA3AF', marginTop: 1 }}>{sublabel}</Text>
                    ) : null}
                </View>
                {right ?? <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />}
            </TouchableOpacity>
            {!isLast && <RowDivider />}
        </>
    );
}

const formatVerificationStatus = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (["fully_verified", "verified", "approved"].includes(normalized)) return "Verified";
    if (normalized === "rejected") return "Rejected";
    if (normalized === "partially_verified") return "Partially Verified";
    if (["pending", "under_review"].includes(normalized)) return "Pending Review";
    return "Not Submitted";
};

const isKycStatusVerified = (data) => {
    if (data?.is_kyc_verified) return true;
    if (Number(data?.completion_percentage) >= 100) return true;

    const requiredDocuments = data?.required_documents || ["profile_photo", "aadhaar_front", "pan_card"];
    const documentsStatus = data?.documents_status || {};

    return requiredDocuments.every((type) => {
        const status = String(documentsStatus[type]?.status || "").toLowerCase();
        return ["approved", "verified"].includes(status);
    });
};

export default function Settings() {
    const dispatch = useDispatch();
    const [notificationsOn, setNotificationsOn] = useState(true);
    const [idVerificationStatus, setIdVerificationStatus] = useState(null);
    
    const { profile, loading, isLoggedIn, token, profilePictureLoading } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(fetchProfileThunk());
        }
    }, [isLoggedIn, dispatch]);

    const loadIdVerificationStatus = useCallback(async () => {
        if (!isLoggedIn || !token) {
            setIdVerificationStatus(null);
            return;
        }

        try {
            const response = await userVerificationApi.getStatus(token);
            setIdVerificationStatus(
                isKycStatusVerified(response.data)
                    ? "Verified"
                    : formatVerificationStatus(response.data?.overall_status)
            );
        } catch (_error) {
            setIdVerificationStatus(null);
        }
    }, [isLoggedIn, token]);

    useEffect(() => {
        loadIdVerificationStatus();
    }, [loadIdVerificationStatus]);

    useFocusEffect(
        useCallback(() => {
            loadIdVerificationStatus();
            return () => undefined;
        }, [loadIdVerificationStatus])
    );

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive', onPress: () => {
                    dispatch(logout());
                    router.replace('/(auth)/login');
                },
            },
        ]);
    };

    const handleProfilePicturePick = async () => {
        if (!isLoggedIn || !token) {
            Alert.alert("Login required", "Please login before updating your profile photo.");
            return;
        }

        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
                Alert.alert("Permission needed", "Allow photo access to update your profile picture.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.85,
            });

            if (result.canceled) return;

            const asset = result.assets?.[0];
            if (!asset?.uri) return;

            await dispatch(updateProfilePictureThunk({
                uri: asset.uri,
                name: asset.fileName || "profile-picture.jpg",
                type: asset.mimeType || "image/jpeg",
            })).unwrap();
            await dispatch(fetchProfileThunk()).unwrap();

            Alert.alert("Profile updated", "Your profile photo has been updated.");
        } catch (error) {
            Alert.alert("Upload failed", error?.message || "Please try again.");
        }
    };

    const startCustomerSupportCall = () => {
        const phoneNumber = profile?.user?.phone || profile?.user?.phone_number || currentUser.phone;
        const name = profile?.user?.full_name || currentUser.name || 'App User';

        if (!phoneNumber) {
            Alert.alert(
                'Phone number needed',
                'Please complete your profile phone number before starting a support call.'
            );
            return;
        }

        router.push({
            pathname: '/(screens)/voice-agent',
            params: {
                phoneNumber,
                name,
            },
        });
    };

    // Use profile data if available, otherwise fallback to currentUser
    const displayName = profile?.user?.full_name || currentUser.name;
    const displayEmail = profile?.user?.email || currentUser.email;
    const displayPhone = profile?.user?.phone || currentUser.phone;
    const displayRole = profile?.user?.role || 'PROPERTY OWNER';
    const displayVerification = idVerificationStatus || profile?.user?.verification_status || 'Not Submitted';
    const displayAvatar = profile?.user?.profilePictureUrl
        || profile?.user?.avatar_url
        || profile?.user?.avatarUrl
        || null;
    // const listingsCount = profile?.activity?.listings_count || 12;
    // const subscription = profile?.subscription;

    if (loading && !profile) {
        return <ProfileSkeleton />;
    }

    return (

        <View style={{ flex: 1, backgroundColor: '#F3F4F6' }}>
            <View
                style={{
                    height: 1,
                    backgroundColor: '#e3dfdfff',
                    width: '100%',
                    marginVertical: 1,
                }}
            />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >

                <View style={{ alignItems: 'center', paddingTop: 30, paddingBottom: 2 }}>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleProfilePicturePick}
                        disabled={profilePictureLoading}
                        style={{ position: 'relative', marginBottom: 12, borderWidth: 5, borderColor: '#FFFFFF', borderRadius: 50, shadowColor: "#949193ff", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 30, elevation: 16 }}
                    >
                        <Image
                            source={displayAvatar ? { uri: displayAvatar } : currentUser.avatar}
                            style={{ width: 80, height: 80, borderRadius: 40 }}
                            resizeMode="cover"
                        />
                        <View style={{
                            position: 'absolute', bottom: 0, right: 0,
                            width: 24, height: 24, borderRadius: 12,
                            backgroundColor: '#4A43EC',
                            alignItems: 'center', justifyContent: 'center',
                            borderWidth: 2, borderColor: '#F3F4F6',
                        }}>
                            {profilePictureLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Feather name="camera" size={11} color="#fff" />
                            )}
                        </View>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#0F172A', marginBottom: 6 }}>
                        {displayName}
                    </Text>
                    <View style={{
                        backgroundColor: '#dee4f7ff', borderRadius: 25,
                        paddingHorizontal: 12, paddingVertical: 4, marginBottom: 6,
                    }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A43EC', letterSpacing: 0.5 }}>
                            {displayRole}
                        </Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#64748B' }}>{displayEmail}</Text>
                </View>

                {/* Personal Information */}
                <SectionLabel text="PERSONAL INFORMATION" />
                <SettingsCard>
                    <SettingsRow
                        icon={<Ionicons name="person-outline" size={18} color="#4A43EC" />}
                        label="Legal Name"
                        sublabel={displayName}
                        right={<View />}
                    />
                    <SettingsRow
                        icon={<Feather name="phone" size={17} color="#4A43EC" />}
                        label="Phone Number"
                        sublabel={displayPhone}
                        right={<View />}
                    />
                    <SettingsRow
                        icon={<MaterialCommunityIcons name="card-account-details-outline" size={18} color="#4A43EC" />}
                        label="ID Verification"
                        sublabel={displayVerification}
                        sublabelColor={String(displayVerification).toLowerCase().includes('reject') ? '#EF4444' : String(displayVerification).toLowerCase().includes('pending') ? '#F59E0B' : '#10B981'}
                        onPress={() => router.push('/(screens)/id-verification')}
                        isLast
                    />
                </SettingsCard>

                {/* My Activity */}
                <SectionLabel text="MY ACTIVITY" />
                <SettingsCard>
                             
                    <SettingsRow
                        icon={<Ionicons name="heart-outline" size={18} color="#4A43EC" />}
                        label="Saved Projects"
                        onPress={() => router.push('/(screens)/saved-properties')}
                    />
                    <SettingsRow
                        icon={<MaterialCommunityIcons name="history" size={18} color="#4A43EC" />}
                        label="Recent Searches"
                        onPress={() => router.push('/(screens)/recent-searches')}
                        isLast
                    />
                </SettingsCard>

                {/* App Settings */}
                <SectionLabel text="APP SETTINGS" />
                <SettingsCard>
                    <SettingsRow
                        icon={<Ionicons name="notifications-outline" size={18} color="#475569" />}
                        label="Notifications"
                        onPress={() => router.push("/(screens)/notifications")}
                        right={
                            <Switch
                                value={notificationsOn}
                                onValueChange={setNotificationsOn}
                                trackColor={{ false: '#E5E7EB', true: '#4A43EC' }}
                                thumbColor="#fff"
                            />
                        }
                    />
                    <SettingsRow
                        icon={<MaterialCommunityIcons name="fingerprint" size={18} color="#475569" />}
                        label="Biometric Lock"
                    />

                </SettingsCard>

                {/* Support */}
                <SectionLabel text="SUPPORT" />
                <SettingsCard>
                    <SettingsRow
                        icon={<Ionicons name="call-outline" size={18} color="#475569" />}
                        label="Customer Support"
                        onPress={startCustomerSupportCall}
                    />
                    <SettingsRow
                        icon={<MaterialCommunityIcons name="email-outline" size={18} color="#475569" />}
                        label="Contact Us"
                        isLast
                    />
                </SettingsCard>

                {/* Logout */}
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleLogout}
                    style={{
                        marginHorizontal: 16, marginTop: 28,
                        backgroundColor: '#1A1A1A',
                        borderRadius: 16, paddingVertical: 16,
                        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
                    }}
                >
                    <MaterialCommunityIcons name="logout" size={20} color="#fff" />
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Logout</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
