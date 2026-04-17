import { View, Text, Pressable, Animated, Modal, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef, useEffect, useState } from 'react';
import { Easing } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { documentsData } from "../../data/my-deals";

function ProgressBar({ percentage }) {
    const animatedValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        animatedValue.setValue(0);
        Animated.timing(animatedValue, {
            toValue: percentage,
            duration: 1000,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    }, [percentage]);
    const width = animatedValue.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
    return (
        <View className="h-[6px] bg-[#E5E7EB] rounded-full overflow-hidden w-full">
            <Animated.View style={{ width, height: '100%', borderRadius: 9999 }}>
                <LinearGradient colors={['#434EEC', '#434EEC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ flex: 1, borderRadius: 9999 }} />
            </Animated.View>
        </View>
    );
}

const getDocStyles = (status) => {
    switch (status) {
        case "Verified": return { badgeBg: "bg-[#E6F6ED]", badgeText: "text-[#22A559]", borderClass: "border-[#F3F4F6]" };
        case "Pending":  return { badgeBg: "bg-[#FFF8E6]",  badgeText: "text-[#F59E0B]", borderClass: "border-[#F3F4F6]" };
        case "Required": return { badgeBg: "bg-[#FEF2F2]",  badgeText: "text-[#EF4444]", borderClass: "border-[#EF4444]" };
        default:         return { badgeBg: "bg-[#F3F4F6]",  badgeText: "text-[#6B7280]", borderClass: "border-[#F3F4F6]" };
    }
};

export default function TabDocuments() {
    // uploaded: { [docId]: { uri, name, type } }
    const [uploaded, setUploaded] = useState({});
    const [viewer, setViewer] = useState(null); // { uri, name, type }

    const handleUpload = async (docId) => {
        try {
            // Try image picker first for KYC docs (images common), fallback to doc picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: false,
                quality: 1,
            });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                setUploaded((prev) => ({
                    ...prev,
                    [docId]: { uri: asset.uri, name: asset.fileName ?? 'document', type: asset.type ?? 'image' },
                }));
            }
        } catch {
            // fallback to document picker
            const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
            if (!result.canceled && result.assets?.[0]) {
                const asset = result.assets[0];
                setUploaded((prev) => ({
                    ...prev,
                    [docId]: { uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/pdf' },
                }));
            }
        }
    };

    const handleView = (docId) => {
        const file = uploaded[docId];
        if (file) setViewer(file);
    };

    return (
        <View className="mb-4">
            {/* Completion card */}
            <View className="bg-white rounded-[12px] px-4 py-4 mb-3 shadow-sm border border-[#F3F4F6]"
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-[14px] font-manrope-bold text-[#111827]">Document Completion</Text>
                    <Text className="text-[11px] font-manrope-bold text-[#22A559]">7 / 10 Verified</Text>
                </View>
                <ProgressBar percentage={70} />
            </View>

            {documentsData.map((section, sIndex) => {
                const isKYC = section.sectionTitle === "IDENTITY & KYC";
                return (
                    <View key={`doc-section-${sIndex}`}>
                        <Text className="text-[10px] font-manrope-bold text-[#9CA3AF] uppercase tracking-widest mt-4 mb-2">
                            {section.sectionTitle}
                        </Text>
                        {section.documents.map((doc) => {
                            const styles = getDocStyles(doc.status);
                            const file = uploaded[doc.id];
                            return (
                                <View key={`doc-item-${doc.id}`}
                                    className={`flex-row items-center p-3 bg-white rounded-[12px] mb-2.5 border ${styles.borderClass}`}>
                                    <View className="w-[36px] h-[36px] rounded-[8px] bg-[#EAF2FF] items-center justify-center mr-3">
                                        <Ionicons name={doc.icon} size={18} color="#8DA4D4" />
                                    </View>
                                    <View className="flex-1 justify-center">
                                        <Text className="text-[13px] font-manrope-bold text-[#111827] mb-0.5">
                                            {file ? file.name : doc.title}
                                        </Text>
                                        <Text className="text-[11px] font-manrope-medium text-[#9CA3AF] mb-1">
                                            {file ? 'Uploaded' : doc.meta}
                                        </Text>
                                        <View className={`self-start px-2 py-[2px] rounded-[4px] ${file ? 'bg-[#E6F6ED]' : styles.badgeBg}`}>
                                            <Text className={`text-[9px] font-manrope-bold ${file ? 'text-[#22A559]' : styles.badgeText}`}>
                                                {file ? 'Uploaded' : doc.status}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center gap-[4px]">
                                        {/* Eye — only active if file uploaded */}
                                        <Pressable
                                            onPress={() => handleView(doc.id)}
                                            className="w-[28px] h-[28px] rounded-[8px] items-center justify-center"
                                            style={{ backgroundColor: file ? '#EEF2FF' : '#F1F3FF' }}
                                        >
                                            <Ionicons name="eye" size={14} color={file ? '#4A43EC' : '#6B7280'} />
                                        </Pressable>
                                        {/* Upload (KYC) or Download (Agreement) */}
                                        {isKYC ? (
                                            <Pressable
                                                onPress={() => handleUpload(doc.id)}
                                                className="w-[28px] h-[28px] bg-[#F1F3FF] rounded-[8px] items-center justify-center"
                                            >
                                                <Ionicons name="cloud-upload-outline" size={15} color={file ? '#22A559' : '#8DA4D4'} />
                                            </Pressable>
                                        ) : (
                                            <Pressable className="w-[28px] h-[28px] bg-[#F1F3FF] rounded-[8px] items-center justify-center">
                                                <Ionicons name="arrow-down-circle" size={16} color="#8DA4D4" />
                                            </Pressable>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                );
            })}

            {/* Document viewer modal */}
            <Modal visible={!!viewer} transparent animationType="fade" onRequestClose={() => setViewer(null)}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.88)', justifyContent: 'center', alignItems: 'center' }}>
                    <TouchableOpacity
                        onPress={() => setViewer(null)}
                        style={{ position: 'absolute', top: 52, right: 20, zIndex: 10,
                            width: 36, height: 36, borderRadius: 18,
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Ionicons name="close" size={20} color="#fff" />
                    </TouchableOpacity>
                    {viewer && (
                        viewer.type?.startsWith('image') || viewer.uri?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                            <Image
                                source={{ uri: viewer.uri }}
                                style={{ width: '90%', height: '70%', borderRadius: 12 }}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={{ alignItems: 'center', gap: 12 }}>
                                <Ionicons name="document-text" size={64} color="#fff" />
                                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{viewer.name}</Text>
                                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>PDF preview not supported</Text>
                            </View>
                        )
                    )}
                </View>
            </Modal>
        </View>
    );
}
