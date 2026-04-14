import {
    View, Text, Image, TouchableOpacity,
    ScrollView, Switch, SafeAreaView, Alert,
} from "react-native";
import { useState } from "react";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { router } from "expo-router";
import { logout } from "../../store/slices/authSlice";
import { currentUser } from "../../data/user";

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
                        {currentUser.name}
                    </Text>
                    <View style={{
                        backgroundColor: '#dee4f7ff', borderRadius: 25,
                        paddingHorizontal: 12, paddingVertical: 4, marginBottom: 6,
                    }}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#4A43EC', letterSpacing: 0.5 }}>
                            PROPERTY OWNER
                        </Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#64748B' }}>{currentUser.email}</Text>
                </View>

                {/* Personal Information */}
                <SectionLabel text="PERSONAL INFORMATION" />
                <SettingsCard>
                    <SettingsRow
                        icon={<Ionicons name="person-outline" size={18} color="#4A43EC" />}
                        label="Legal Name"
                        sublabel={currentUser.name}
                    />
                    <SettingsRow
                        icon={<Feather name="phone" size={17} color="#4A43EC" />}
                        label="Phone Number"
                        sublabel={currentUser.phone}
                    />
                    <SettingsRow
                        icon={<MaterialCommunityIcons name="card-account-details-outline" size={18} color="#4A43EC" />}
                        label="ID Verification"
                        sublabel="Verified Level 2"
                        sublabelColor="#10B981"
                        isLast
                    />
                </SettingsCard>

                {/* My Activity */}
                <SectionLabel text="MY ACTIVITY" />
                <SettingsCard>
                    <SettingsRow
                        icon={<MaterialCommunityIcons name="format-list-bulleted" size={18} color="#4A43EC" />}
                        label="My Listings"
                        right={
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <View style={{ backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
                                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#4A43EC' }}>12</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                            </View>
                        }
                    />
                    <SettingsRow
                        icon={<Ionicons name="heart-outline" size={18} color="#4A43EC" />}
                        label="Saved Properties"
                    />
                    <SettingsRow
                        icon={<MaterialCommunityIcons name="history" size={18} color="#4A43EC" />}
                        label="Recent Searches"
                        isLast
                    />
                </SettingsCard>

                {/* Services & Subscriptions */}
                <SectionLabel text="SERVICES & SUBSCRIPTIONS" />
                <SettingsCard style={{
                    backgroundColor: '#eeedf5ff', shadowColor: "#4A43EC",
                    shadowOffset: { width: 1, height: 1 },
                    shadowRadius: 4,
                    elevation: 1,
                    borderWidth: 1,
                    borderColor: '#cac9f1ff',
                }}>
                    <TouchableOpacity
                        activeOpacity={0.8}
                        style={{
                            flexDirection: 'row', alignItems: 'center',
                            paddingHorizontal: 16, paddingVertical: 16,
                        }}
                    >
                        <View style={{
                            width: 36, height: 36, borderRadius: 10,
                            backgroundColor: '#4A43EC',
                            alignItems: 'center', justifyContent: 'center',
                            marginRight: 12,
                        }}>
                            <MaterialCommunityIcons name="shield-star-outline" size={18} color="#fff" />
                        </View>
                        <View style={{ flex: 1, }}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#4A43EC', }}>Premium Micro Area</Text>
                            <Text style={{ fontSize: 12, color: '#6b66f3ff', marginTop: 1 }}>Expires in 14 days</Text>
                        </View>
                        <View style={{
                            backgroundColor: '#4A43EC', borderRadius: 8,
                            paddingHorizontal: 12, paddingVertical: 5,
                        }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>RENEW</Text>
                        </View>
                    </TouchableOpacity>
                </SettingsCard>

                <SettingsCard style={{ marginTop: 10, paddingVertical: 2 }}>
                    <SettingsRow
                        icon={<MaterialCommunityIcons name="clipboard-text-outline" size={18} color="#475569" />}
                        label="Service History"
                        isLast
                    />
                </SettingsCard>

                {/* App Settings */}
                <SectionLabel text="APP SETTINGS" />
                <SettingsCard>
                    <SettingsRow
                        icon={<Ionicons name="notifications-outline" size={18} color="#475569" />}
                        label="Notifications"
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

                    <SettingsRow
                        icon={<Ionicons name="lock-closed-outline" size={18} color="#475569" />}
                        label="Change Password"
                        isLast
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
