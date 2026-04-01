/* eslint-disable react/prop-types */
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
} from "react-native";
import {
    Ionicons,
} from "@expo/vector-icons";
import { useState } from "react";
import { Link } from "expo-router";
import { dealsData } from "../../data/my-deals";

const FILTERS = ["All Deals", "Payment Pending", "Closed"];
const STEPS = ["Lead", "Visit", "Deal", "Payment", "Closure"];

const cardShadow = {
    shadowColor: "#6231FF",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
};

export default function MyDeals() {
    const [activeFilter, setActiveFilter] = useState("All Deals");

    const filteredDeals = activeFilter === "All Deals" 
        ? dealsData 
        : dealsData.filter(deal => deal.category === activeFilter);

    return (
        <View className="flex-1 bg-[#FCFCFD]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingBottom: 100,
                    paddingTop: 16
                }}
            >
                <View className="px-5">
                    <View className="mb-4">
                        <Text className="text-[9px] font-manrope-semibold text-[#6231FF] tracking-[1px] mb-1 uppercase">YOUR PORTFOLIO</Text>
                        <Text className="text-[20px] font-manrope-semibold text-[#111827]">My Deals</Text>
                    </View>

                    <View className="mb-6 -mx-5">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
                        >
                            {FILTERS.map((f) => (
                                <TouchableOpacity
                                    key={f}
                                    onPress={() => setActiveFilter(f)}
                                    activeOpacity={0.8}
                                    className={`px-[16px] py-[8px] rounded-full ${activeFilter === f ? 'bg-[#EBE5FF]' : 'bg-[#F3F4F6]'}`}
                                >
                                    <Text
                                        className={`text-[12px] font-inter-bold ${activeFilter === f ? 'text-[#6231FF]' : 'text-[#6B7280]'}`}
                                    >
                                        {f}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {filteredDeals.length > 0 ? (
                        filteredDeals.map((deal) => (
                            <View key={deal.id} className="bg-white rounded-[16px] p-4 border border-black/5 mb-4" style={cardShadow}>
                                <View className="w-full h-[160px] rounded-[12px] overflow-hidden relative">
                                    <Image
                                        source={{ uri: deal.imageUri }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                    {deal.isVerified && (
                                        <View className="absolute top-2 left-2 bg-white/95 px-2 py-1 rounded-lg flex-row items-center gap-1">
                                            <Ionicons name="checkmark-sharp" size={8} color="#1A5940" />
                                            <Text className="text-[8px] font-manrope-semibold text-[#1A5940] tracking-[0.5px]">VERIFIED</Text>
                                        </View>
                                    )}
                                </View>

                                <View className="pt-4 px-1">
                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text className="text-[15px] font-inter-extrabold text-[#1F2937] flex-1" numberOfLines={1}>{deal.title}</Text>
                                        <Text className="text-[14px] font-inter-black text-[#6231FF]">{deal.price}</Text>
                                    </View>

                                    <View className="flex-row items-center gap-1 mb-4">
                                        <Ionicons name="location-sharp" size={12} color="#9CA3AF" />
                                        <Text className="text-[11px] font-inter-semibold text-[#9CA3AF]">{deal.location}</Text>
                                    </View>

                                    <View className="flex-row justify-end mb-6">
                                        <View className="flex-row items-center bg-[#F4F1FF] px-3 py-1.5 rounded-full gap-2">
                                            <View className="flex-row items-center w-4 h-2.5 relative">
                                                <View className="w-2.5 h-2.5 rounded-full bg-[#6231FF] z-10" />
                                                <View className="w-2 h-2 rounded-full bg-[#6231FF] opacity-25 absolute right-0" />
                                            </View>
                                            <Text className="text-[11px] font-inter-bold text-[#6231FF]">{deal.dealStatusText}</Text>
                                        </View>
                                    </View>

                                    <View className="mb-6 mx-1">
                                        <View className="flex-row items-center justify-between relative h-6 px-3">
                                            <View className="absolute left-3 right-3 h-full justify-center">
                                                <View className="h-[1.5px] bg-[#E2E8F0]" />
                                                <View
                                                    className="h-[1.5px] bg-[#6231FF]"
                                                    style={{ width: `${(deal.currentStep / (STEPS.length - 1)) * 100}%` }}
                                                />
                                            </View>
                                            {STEPS.map((label, index) => (
                                                <WorkflowStep
                                                    key={label}
                                                    label={label}
                                                    isActive={index <= deal.currentStep}
                                                    isCurrent={index === deal.currentStep}
                                                />
                                            ))}
                                        </View>
                                        <View className="h-2" />
                                    </View>

                                    <Link href="/assisted-journy" asChild>
                                        <TouchableOpacity activeOpacity={0.8} className="bg-[#6231FF] py-[10px] rounded-xl items-center">
                                            <Text className="text-white text-[13px] font-inter-bold">View Details</Text>
                                        </TouchableOpacity>
                                    </Link>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="flex-1 justify-center items-center py-20">
                            <Text className="text-gray-400 font-inter-medium">No deals for {activeFilter}</Text>
                        </View>
                    )}

                    <View className="h-4" />
                </View>
            </ScrollView>
        </View>
    );
}

function WorkflowStep({ label, isActive, isCurrent }) {
    return (
        <View className="items-center z-10">
            <View className="h-6 mt-4 justify-center items-center">
                {isCurrent ? (
                    <View
                        className="w-[18px] h-[18px] rounded-full border-[3px] border-[#6231FF] bg-white justify-center items-center shadow-sm"
                        style={{ elevation: 3, shadowColor: '#6231FF', shadowOpacity: 0.25, shadowRadius: 3 }}
                    >
                        <View className="w-1.5 h-1.5 rounded-full bg-[#6231FF]" />
                    </View>
                ) : (
                    <View className={`w-4 h-4 rounded-full justify-center items-center ${isActive ? 'bg-[#EBE5FF]' : 'bg-[#f0f0f0]'}`}>
                        <View className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#6231FF]' : 'bg-[#bcc6d1]'}`} />
                    </View>
                )}
            </View>
            <Text
                className={`text-[9px] mt-1.5 font-bold ${isCurrent ? 'text-[#6231FF]' : 'text-[#6B7280]'}`}
            >
                {label}
            </Text>
        </View>
    );
}