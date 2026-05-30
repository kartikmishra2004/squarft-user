import {
    View, Text, Image, TouchableOpacity,
    ScrollView, Switch, Alert,
} from "react-native";
import { useState, useEffect } from "react";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { router } from "expo-router";
import { logout, fetchProfileThunk } from "../../store/slices/authSlice";
import { currentUser } from "../../data/user";
import { ProfileSkeleton } from "../../components/SkeletonLoader";

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

export default function Settings() {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const [notificationsOn, setNotificationsOn] = useState(true);
    
    const { profile, loading, isLoggedIn } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isLoggedIn) {
            dispatch(fetchProfileThunk());
        }
    }, [isLoggedIn, dispatch]);

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

    // Use profile data if available, otherwise fallback to currentUser
    const displayName = profile?.user?.full_name || currentUser.name;
    const displayEmail = profile?.user?.email || currentUser.email;
    const displayPhone = profile?.user?.phone || currentUser.phone;
    const displayRole = profile?.user?.role || 'PROPERTY OWNER';
    const displayVerification = profile?.user?.verification_status || 'Verified Level 2';
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
                    <View style={{ position: 'relative', marginBottom: 12, borderWidth: 5, borderColor: '#FFFFFF', borderRadius: 50, shadowColor: "#949193ff", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 30, elevation: 16 }}>
                        <Image
                            source={currentUser.avatar}
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
                            <Feather name="camera" size={11} color="#fff" />
                        </View>
                    </View>
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
                    />
                    <SettingsRow
                        icon={<Feather name="phone" size={17} color="#4A43EC" />}
                        label="Phone Number"
                        sublabel={displayPhone}
                        onPress={() => router.push('/(screens)/phone-number')}
                    />
                    <SettingsRow
                        icon={<MaterialCommunityIcons name="card-account-details-outline" size={18} color="#4A43EC" />}
                        label="ID Verification"
                        sublabel={displayVerification}
                        sublabelColor="#10B981"
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
                        icon={<MaterialCommunityIcons name="help-circle-outline" size={18} color="#475569" />}
                        label="Help Center"
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
