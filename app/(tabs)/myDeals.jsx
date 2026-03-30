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
    const [currentStep, setCurrentStep] = useState(2);

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
                    <View className="mb-6">
                        <Text className="text-[10px] font-manrope-semibold text-[#6231FF] tracking-[1.5px] mb-1.5 uppercase">YOUR PORTFOLIO</Text>
                        <Text className="text-[26px] font-manrope-semibold text-[#111827]">My Deals</Text>
                    </View>

                    <View className="mb-8 -mx-5">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                        >
                            {FILTERS.map((f) => (
                                <TouchableOpacity
                                    key={f}
                                    onPress={() => setActiveFilter(f)}
                                    activeOpacity={0.8}
                                    className={`px-[24px] py-[13px] rounded-full ${activeFilter === f ? 'bg-[#EBE5FF]' : 'bg-[#F3F4F6]'}`}
                                >
                                    <Text
                                        className={`text-[13px] font-inter-bold ${activeFilter === f ? 'text-[#6231FF]' : 'text-[#6B7280]'}`}
                                    >
                                        {f}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {activeFilter === "All Deals" ? (
                        <View className="bg-white rounded-[36px] p-5 border border-black/5" style={cardShadow}>
                            <View className="w-full h-[210px] rounded-[28px] overflow-hidden relative">
                                <Image
                                    source={{ uri: "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                                <View className="absolute top-3 left-3 bg-white/95 px-2.5 py-1.5 rounded-xl flex-row items-center gap-1.5">
                                    <Ionicons name="checkmark-sharp" size={9} color="#1A5940" />
                                    <Text className="text-[9px] font-manrope-semibold text-[#1A5940] tracking-[0.5px]">VERIFIED</Text>
                                </View>
                            </View>

                            <View className="pt-6 px-1">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-[21px] font-inter-extrabold text-[#1F2937] flex-1" numberOfLines={1}>Serenity Reserve</Text>
                                    <Text className="text-[19px] font-inter-black text-[#6231FF]">₹2.5 Cr</Text>
                                </View>

                                <View className="flex-row items-center gap-1 mb-5">
                                    <Ionicons name="location-sharp" size={13} color="#9CA3AF" />
                                    <Text className="text-[14px] font-inter-semibold text-[#9CA3AF]">Scheme No 140, Indore</Text>
                                </View>

                                <View className="flex-row justify-end mb-8">
                                    <View className="flex-row items-center bg-[#F4F1FF] px-3.5 py-2.5 rounded-full gap-2">
                                        <View className="flex-row items-center w-5 h-3 relative">
                                            <View className="w-3.5 h-3.5 rounded-full bg-[#6231FF] z-10" />
                                            <View className="w-2.5 h-2.5 rounded-full bg-[#6231FF] opacity-25 absolute right-0" />
                                        </View>
                                        <Text className="text-[12px] font-inter-bold text-[#6231FF]">Deal Started</Text>
                                    </View>
                                </View>

                                <View className="mb-10 mx-1">
                                    <View className="flex-row items-center justify-between relative h-7 px-3">
                                        <View className="absolute left-3 right-3 h-full justify-center">
                                            <View className="h-[1.5px] bg-[#E2E8F0]" />
                                            <View
                                                className="h-[1.5px] bg-[#6231FF]"
                                                style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                                            />
                                        </View>
                                        {STEPS.map((label, index) => (
                                            <WorkflowStep
                                                key={label}
                                                label={label}
                                                isActive={index <= currentStep}
                                                isCurrent={index === currentStep}
                                            />
                                        ))}
                                    </View>
                                    <View className="h-4" />
                                </View>

                                <TouchableOpacity activeOpacity={0.8} className="bg-[#6231FF] py-4 rounded-2xl items-center">
                                    <Text className="text-white text-[16px] font-inter-bold">View Details</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
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
            <View className="h-7 mt-6 justify-center items-center">
                {isCurrent ? (
                    <View
                        className="w-[22px] h-[22px] rounded-full border-[4px] border-[#6231FF] bg-white justify-center items-center shadow-sm"
                        style={{ elevation: 3, shadowColor: '#6231FF', shadowOpacity: 0.25, shadowRadius: 3 }}
                    >
                        <View className="w-2 h-2 rounded-full bg-[#6231FF]" />
                    </View>
                ) : (
                    <View className={`w-5 h-5 rounded-full justify-center items-center ${isActive ? 'bg-[#EBE5FF]' : 'bg-[#f0f0f0]'}`}>
                        <View className={`w-2.5 h-2.5 rounded-full ${isActive ? 'bg-[#6231FF]' : 'bg-[#bcc6d1]'}`} />
                    </View>
                )}
            </View>
            <Text
                className={`text-[10px] mt-2 font-bold ${isCurrent ? 'text-[#6231FF]' : 'text-[#6B7280]'}`}
            >
                {label}
            </Text>
        </View>
    );
}