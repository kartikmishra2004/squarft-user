import { View, Text, ScrollView, Pressable, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Link } from "expo-router";
import { dealsData, headerStats, nextPaymentDue } from "../../../data/my-deals";

const FILTERS = ["All Deals", "Active", "Pending"];

export default function MyDeals() {
    const [activeFilter, setActiveFilter] = useState("All Deals");

    const filteredDeals = dealsData.filter(deal => {
        if (activeFilter === "Active") return deal.isActive;
        if (activeFilter === "Pending") return deal.isPending;
        // All Deals: show if it is either active or pending
        return deal.isActive || deal.isPending;
    });

    return (
        <View className="flex-1 bg-[#FAFAFA]">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                bounces={false}
            >
                {/* Header Section */}
                <View className="pt-[60px] pb-6 px-5 overflow-hidden relative">
                    <LinearGradient
                        colors={['#948FFF', '#4F48ED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                    />
                    <Text className="text-[20px] font-manrope-bold text-white mb-1 relative z-10">My Deals</Text>
                    <Text className="text-[12px] font-manrope-medium text-white/80 mb-6 relative z-10">{headerStats.activeDeals} Active · {headerStats.pendingDeals} Pending</Text>

                    <View className="flex-row justify-between gap-[8px] mt-6 relative z-10">
                        <View className="flex-1 w-[114px] h-[51px] bg-[rgba(255,255,255,0.15)] rounded-[10px] items-center justify-center">
                            <Text className="text-[16px] font-manrope-bold text-white mb-0.5">{headerStats.activeDeals}</Text>
                            <Text className="text-[13px] font-manrope-medium text-white/90">Active</Text>
                        </View>
                        <View className="flex-1 w-[114px] h-[51px] bg-[rgba(255,255,255,0.15)] rounded-[10px] items-center justify-center">
                            <Text className="text-[16px] font-manrope-bold text-white mb-0.5">{headerStats.pendingDeals}</Text>
                            <Text className="text-[13px] font-manrope-medium text-white/90">Pending</Text>
                        </View>
                        <View className="flex-1 w-[114px] h-[51px] bg-[rgba(255,255,255,0.15)] rounded-[10px] items-center justify-center">
                            <Text className="text-[16px] font-manrope-bold text-white mb-0.5">{headerStats.totalValue}</Text>
                            <Text className="text-[13px] font-manrope-medium text-white/90">Total Value</Text>
                        </View>
                    </View>
                </View>

                {/* Content Container */}
                <View className="pt-5 flex-1">
                    {/* Next Payment Banner */}
                    <View className="px-5 mb-4">
                        <View className="rounded-[16px]" style={{ elevation: 4, shadowColor: '#5B50F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 }}>
                            <View className="rounded-[16px] overflow-hidden relative">
                                <LinearGradient
                                    colors={['#5B50F6', '#5B50F6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={StyleSheet.absoluteFill}
                                />
                                <View className="px-[16px] py-[12px] flex-row justify-between items-center relative z-10">
                                    <View className="justify-center">
                                        <Text className="text-[12px] font-manrope-medium text-white/80 leading-[16px]">Next Payment Due</Text>
                                        <Text className="text-[23px] font-manrope-bold text-white tracking-tight leading-[32px] mt-0.5 mb-1">{nextPaymentDue.amount}</Text>
                                        <Text className="text-[12px] font-manrope-medium text-white/80 leading-[16px]">
                                            📆 Due in {nextPaymentDue.daysRemaining} days · {nextPaymentDue.date}
                                        </Text>
                                    </View>
                                    <Pressable className="bg-white/20 px-[16px] py-[10px] rounded-[10px]" activeOpacity={0.8}>
                                        <Text className="text-[13px] font-manrope-bold text-white">Pay Now</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Filters */}
                    <View className="flex-row px-5 mb-4 gap-3">
                        {FILTERS.map((f) => (
                            <Pressable
                                key={f}
                                onPress={() => setActiveFilter(f)}
                                activeOpacity={0.8}
                                className={`flex-1 rounded-[10px] items-center justify-center border overflow-hidden ${activeFilter === f
                                    ? 'border-transparent'
                                    : 'bg-white border-[#E5E7EB]'
                                    }`}
                            >
                                {activeFilter === f ? (
                                    <View className="w-full py-[10px] items-center justify-center bg-[#434EEC]">
                                        <Text className="text-[12px] font-manrope-semibold text-white">
                                            {f}
                                        </Text>
                                    </View>
                                ) : (
                                    <View className="w-full py-[10px] items-center justify-center">
                                        <Text className="text-[12px] font-manrope-semibold text-[#6B7280]">
                                            {f}
                                        </Text>
                                    </View>
                                )}
                            </Pressable>
                        ))}
                    </View>
                    {/* Deals List */}
                    <View className="px-5">
                        {filteredDeals.length > 0 ? (
                            filteredDeals.map((deal) => (
                                <View
                                    key={deal.id}
                                    className="bg-white rounded-[12px] p-3 mb-3"
                                    style={{
                                        elevation: 2,
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 2 },
                                        shadowOpacity: 0.05,
                                        shadowRadius: 8,
                                        borderWidth: 1,
                                        borderColor: '#F3F4F6'
                                    }}
                                >
                                    {/* Top: Image + Title + Status */}
                                    <View className="flex-row items-center mb-2.5">
                                        <Image source={{ uri: deal.image }} className="w-11 h-11 rounded-[8px] mr-2.5 bg-gray-100" />
                                        <View className="flex-1">
                                            <Text className="text-[14px] font-manrope-bold text-[#111827] mb-0.5">{deal.title}</Text>
                                            <Text className="text-[11px] font-manrope-medium text-[#6B7280]">{deal.location}</Text>
                                        </View>
                                        <View className={`px-2 py-[2px] rounded-full ${deal.status === 'Active' ? 'bg-[#EAF8EE]' : 'bg-[#FFF8E6]'
                                            }`}>
                                            <Text className={`text-[10px] font-manrope-bold ${deal.status === 'Active' ? 'text-[#22A559]' : 'text-[#F59E0B]'
                                                }`}>{deal.status}</Text>
                                        </View>
                                    </View>

                                    {/* Divider */}
                                    <View className="h-[1px] bg-[#F3F4F6] mb-2.5" />

                                    {/* Amounts Row */}
                                    <View className="flex-row justify-between mb-3">
                                        <View className="flex-1">
                                            <Text className="text-[10px] font-manrope-medium text-[#9CA3AF] mb-0.5">Total Value</Text>
                                            <Text className="text-[13px] font-manrope-bold text-[#111827]">{deal.totalValue}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-[10px] font-manrope-medium text-[#9CA3AF] mb-0.5">Paid So Far</Text>
                                            <Text className="text-[13px] font-manrope-bold text-[#111827]">{deal.paidSoFar}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-[10px] font-manrope-medium text-[#9CA3AF] mb-0.5">Next Due</Text>
                                            <Text className="text-[13px] font-manrope-bold text-[#4F48ED]">{deal.nextDue}</Text>
                                        </View>
                                    </View>

                                    {/* Progress Bar */}
                                    <View className="w-full h-[3px] bg-[#F3F4F6] rounded-full mb-2 overflow-hidden relative">
                                        <LinearGradient
                                            colors={['#434EEC', '#434EEC']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={{ width: `${deal.completionPercentage}%`, height: '100%', borderRadius: 9999, position: 'absolute', left: 0, top: 0 }}
                                        />
                                    </View>

                                    {/* Footer (Percentage & Details Link) */}
                                    <View className="flex-row justify-between items-center mt-0">
                                        <Text className="text-[11px] font-manrope-medium text-[#9CA3AF]">{deal.completionPercentage}% paid</Text>
                                        <Link href={`/myDeals/${deal.id}`} asChild>
                                            <Pressable activeOpacity={0.8} className="py-0.5">
                                                <Text className="text-[12px] font-manrope-bold text-[#4F48ED]">View Details →</Text>
                                            </Pressable>
                                        </Link>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View className="flex-1 justify-center items-center py-20">
                                <Text className="text-gray-400 font-manrope-medium">No deals for {activeFilter}</Text>
                            </View>
                        )}
                        <View className="h-4" />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
