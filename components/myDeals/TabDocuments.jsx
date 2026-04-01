import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { documentsData } from "../../data/my-deals";

const getDocStyles = (status) => {
    switch (status) {
        case "Verified":
            return { badgeBg: "bg-[#E6F6ED]", badgeText: "text-[#22A559]", borderClass: "border-[#F3F4F6]" };
        case "Pending":
            return { badgeBg: "bg-[#FFF8E6]", badgeText: "text-[#F59E0B]", borderClass: "border-[#F3F4F6]" };
        case "Required":
            return { badgeBg: "bg-[#FEF2F2]", badgeText: "text-[#EF4444]", borderClass: "border-[#EF4444]" };
        default:
            return { badgeBg: "bg-[#F3F4F6]", badgeText: "text-[#6B7280]", borderClass: "border-[#F3F4F6]" };
    }
}

export default function TabDocuments() {
    return (
        <View className="mb-4">
            <View className="bg-white rounded-[12px] px-4 py-4 mb-3 shadow-sm border border-[#F3F4F6]" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 }}>
                <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-[14px] font-manrope-bold text-[#111827]">Document Completion</Text>
                    <Text className="text-[11px] font-manrope-bold text-[#22A559]">7 / 10 Verified</Text>
                </View>
                <View className="h-[6px] bg-[#E5E7EB] rounded-full overflow-hidden w-full">
                    <View className="h-full bg-[#4F48ED] rounded-full" style={{ width: '70%' }} />
                </View>
            </View>

            {documentsData.map((section, sIndex) => (
                <View key={`doc-section-${sIndex}`}>
                    <Text className="text-[10px] font-manrope-bold text-[#9CA3AF] uppercase tracking-widest mt-4 mb-2">
                        {section.sectionTitle}
                    </Text>
                    
                    {section.documents.map((doc) => {
                        const styles = getDocStyles(doc.status);
                        return (
                            <View key={`doc-item-${doc.id}`} className={`flex-row items-center p-3 bg-white rounded-[12px] mb-2.5 border ${styles.borderClass}`}>
                                
                                <View className="w-[36px] h-[36px] rounded-[8px] bg-[#EAF2FF] items-center justify-center mr-3">
                                    <Ionicons name={doc.icon} size={18} color="#8DA4D4" />
                                </View>
                                
                                <View className="flex-1 justify-center">
                                    <Text className="text-[13px] font-manrope-bold text-[#111827] mb-0.5">{doc.title}</Text>
                                    <Text className="text-[11px] font-manrope-medium text-[#9CA3AF] mb-1">{doc.meta}</Text>
                                    <View className={`self-start px-2 py-[2px] rounded-[4px] ${styles.badgeBg}`}>
                                        <Text className={`text-[9px] font-manrope-bold ${styles.badgeText}`}>{doc.status}</Text>
                                    </View>
                                </View>
                                
                                <View className="flex-row items-center gap-[4px]">
                                    <Pressable className="w-[28px] h-[28px] bg-[#F1F3FF] rounded-[8px] items-center justify-center">
                                        <Ionicons name="eye" size={14} color="#6B7280" />
                                    </Pressable>
                                    <Pressable className="w-[28px] h-[28px] bg-[#F1F3FF] rounded-[8px] items-center justify-center">
                                        <Ionicons name="arrow-down-circle" size={16} color="#8DA4D4" />
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })}
                </View>
            ))}
        </View>
    );
}
