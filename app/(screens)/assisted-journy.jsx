/* eslint-disable react/prop-types */
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { personInfo, timelineData } from "../../data/my-deals";

export default function AssistedJourny() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
                <View className="px-5 pt-4 pb-3 flex-row justify-between items-center border-b border-[#E5E7EB]">
                    <View className="flex-row items-center gap-4">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            activeOpacity={0.8}
                            className="w-12 h-12 bg-[#F4F1FF] rounded-[10px] justify-center items-center"
                        >
                            <Ionicons name="arrow-back" size={20} color="#6231FF" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-[15px] font-inter-bold text-[#111827]">Assisted Journey</Text>
                            <Text className="text-[11px] font-inter-medium text-[#6B7280]">ID: {personInfo.id}</Text>
                        </View>
                    </View>
                    <View className="flex-row gap-2">
                        <TouchableOpacity activeOpacity={0.8} className="w-12 h-12 bg-[#F3F4F6] rounded-[10px] justify-center items-center">
                            <Feather name="bell" size={18} color="#4B5563" />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} className="w-12 h-12 bg-[#F3F4F6] rounded-[10px] justify-center items-center">
                            <Feather name="more-vertical" size={18} color="#4B5563" />
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    <View className="px-5 pt-5">
                        <View className="border border-[#E5E7EB] rounded-[20px] p-4 bg-white shadow-sm shadow-gray-100">
                            <View className="flex-row items-center gap-4">
                                <View className="relative">
                                    <Image
                                        source={{ uri: personInfo.avatar }}
                                        className="w-[70px] h-[70px] rounded-full"
                                    />
                                    <View className="absolute bottom-[2px] right-0 w-[15px] h-[15px] bg-[#10B981] rounded-full border-2 border-white" />
                                </View>

                                <View className="flex-1 pt-1">
                                    <View className="flex-row justify-between items-start mb-0.5">
                                        <Text className="text-[15px] font-inter-bold text-[#111827]">{personInfo.name}</Text>
                                        <View className="bg-[#F4F1FF] px-2 py-1 rounded-lg flex-row items-center gap-1">
                                            <Ionicons name="star-outline" size={10} color="#6231FF" />
                                            <Text className="text-[11px] font-inter-bold text-[#6231FF]">{personInfo.rating}</Text>
                                        </View>
                                    </View>
                                    <Text className="text-[11px] font-inter-medium text-[#6B7280] mb-2">{personInfo.role}</Text>

                                    <View className="flex-row gap-2 mt-2">
                                        <TouchableOpacity activeOpacity={0.8} className="flex-1 bg-[#6231FF] py-2 rounded-xl flex-row justify-center items-center gap-1">
                                            <Ionicons name="chatbubble-ellipses" size={13} color="white" />
                                            <Text className="text-white text-[12px] font-inter-semibold">Message</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity activeOpacity={0.8} className="flex-1 bg-[#F3F4F6] py-2 rounded-xl flex-row justify-center items-center gap-1">
                                            <Feather name="phone" size={12} color="#4B5563" />
                                            <Text className="text-[#4B5563] text-[12px] font-inter-semibold">Call</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View className="px-5 mt-6 mb-5 flex-row justify-between items-center">
                        <Text className="text-[14px] font-inter-bold text-[#111827]">Timeline Progress</Text>
                        <View className="bg-[#EBE5FF] px-3 py-1.5 rounded-full">
                            <Text className="text-[11px] font-inter-semibold text-[#6231FF]">Stage 5 of 8</Text>
                        </View>
                    </View>

                    <View className="px-5">
                        <View className="relative">
                            <View className="absolute left-[11px] top-[14px] bottom-[40px] w-[2px] bg-[#E5E7EB]" />

                            {timelineData.map((item) => (
                                <TimelineItem
                                    key={item.id}
                                    status={item.status}
                                    title={item.title}
                                    time={item.time}
                                    badge={item.badge}
                                    iconName={item.iconName}
                                >
                                    {item.images && (
                                        <View className="flex-row gap-2 mt-3">
                                            {item.images.map((img, idx) => (
                                                <Image key={idx} source={{ uri: img }} className="w-[50px] h-[50px] rounded-[10px]" />
                                            ))}
                                            {item.extraImagesCount > 0 && (
                                                <View className="w-[50px] h-[50px] bg-[#F3F4F6] rounded-[10px] justify-center items-center">
                                                    <Text className="text-[11px] font-inter-semibold text-[#4B5563]">+{item.extraImagesCount} more</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                    {item.actionText && item.actionIcon && (
                                        <View className="mt-3 flex-row items-center bg-[#F3F4F6] px-2 py-1.5 rounded-[8px] self-start gap-1.5">
                                            <Feather name={item.actionIcon} size={12} color="#6231FF" />
                                            <Text className="text-[11px] font-inter-semibold text-[#1F2937]">{item.actionText}</Text>
                                        </View>
                                    )}
                                    {item.description && (
                                        <>
                                            <Text className="text-[12px] font-inter-medium text-[#6B7280] mt-1 pr-4 leading-4 flex-1 mt-1 mb-1">
                                                {item.description}
                                            </Text>
                                            {item.askingPrice && item.currentOffer && (
                                                <View className="mt-3 bg-[#FCFAFF] border border-[#EBE5FF] rounded-xl p-3">
                                                    <View className="flex-row justify-between items-center mb-1.5">
                                                        <Text className="text-[11px] font-inter-medium text-[#6B7280]">Asking Price:</Text>
                                                        <Text className="text-[13px] font-inter-bold text-[#111827]">{item.askingPrice}</Text>
                                                    </View>
                                                    <View className="flex-row justify-between items-center">
                                                        <Text className="text-[11px] font-inter-medium text-[#6B7280]">Current Offer:</Text>
                                                        <Text className="text-[13px] font-inter-bold text-[#6231FF]">{item.currentOffer}</Text>
                                                    </View>
                                                </View>
                                            )}
                                        </>
                                    )}
                                </TimelineItem>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const TimelineItem = ({ status, title, time, badge, iconName, children }) => {
    return (
        <View className="flex-row mb-7 relative z-10">
            <View className="mr-5 items-center mt-0.5">
                {status === 'completed' && (
                    <View className="w-[24px] h-[24px] rounded-full bg-[#6231FF] justify-center items-center shadow-sm z-10">
                        <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                )}
                {status === 'current' && (
                    <View className="w-[24px] h-[24px] rounded-full border-[2px] border-[#6231FF] bg-white justify-center items-center z-10">
                        <View className="w-[10px] h-[10px] bg-[#6231FF] rounded-full" />
                    </View>
                )}
                {status === 'pending' && (
                    <View className="w-[24px] h-[24px] rounded-full border border-gray-200 bg-white justify-center items-center z-10 flex-row">
                        <Ionicons name={iconName} size={13} color="#D1D5DB" />
                    </View>
                )}
            </View>
            <View className="flex-1">
                <View className="flex-row items-center gap-2">
                    <Text className={`text-[14px] font-inter-bold ${status === 'current' ? 'text-[#6231FF]' : status === 'pending' ? 'text-[#9CA3AF]' : 'text-[#1F2937]'}`}>
                        {title}
                    </Text>
                    {badge && (
                        <View className="bg-[#6231FF] px-1.5 py-0.5 rounded-full">
                            <Text className="text-[8px] font-inter-bold text-white tracking-wider">{badge}</Text>
                        </View>
                    )}
                </View>
                {time && (
                    <Text className={`text-[11px] mt-0.5 font-inter-medium ${status === 'pending' ? 'text-[#D1D5DB]' : 'text-[#6B7280]'}`}>
                        {time}
                    </Text>
                )}
                {children}
            </View>
        </View>
    );
};