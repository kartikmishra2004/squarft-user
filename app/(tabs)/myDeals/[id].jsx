import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { dealsData } from "../../../data/my-deals";
import { Ionicons } from "@expo/vector-icons";

// Modular Tab Components
import TabTimeline from "../../../components/myDeals/TabTimeline";
import TabPayments from "../../../components/myDeals/TabPayments";
import TabDocuments from "../../../components/myDeals/TabDocuments";
import TabOverview from "../../../components/myDeals/TabOverview";

const TABS = ["Timeline", "Payments", "Documents", "Overview"];

export default function DealDetails() {
    const { id } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState("Timeline");

    // Find the current deal from mock data
    const deal = dealsData.find((d) => d.id === id);

    if (!deal) {
        return (
            <View className="flex-1 justify-center items-center bg-[#FAFAFA]">
                <Text className="text-[16px] font-manrope-medium text-[#6B7280]">Deal not found</Text>
            </View>
        );
    }

    const renderActiveTabBox = () => {
        switch(activeTab) {
            case "Timeline": return <TabTimeline />;
            case "Payments": return <TabPayments />;
            case "Documents": return <TabDocuments />;
            default: return <TabOverview activeTab={activeTab} />;
        }
    };

    return (
        <View className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Header Section */}
                <View className="pt-[50px] pb-4 px-5 relative">
                    <LinearGradient
                        colors={['#948FFF', '#4F48ED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Top bar: Back Arrow + Deal ID */}
                    <View className="flex-row items-center mb-4 relative z-10">
                        <Pressable
                            onPress={() => router.back()}
                            className="w-[36px] h-[36px] bg-[rgba(255,255,255,0.15)] rounded-[10px] items-center justify-center mr-3"
                        >
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </Pressable>
                        <Text className="text-[14px] font-manrope-medium text-white/90">
                            Deal {deal.dealId}
                        </Text>
                    </View>

                    {/* Title & Location */}
                    <View className="mb-4 relative z-10">
                        <Text className="text-[20px] font-manrope-bold text-white mb-1 leading-[30px]">
                            {deal.title}
                        </Text>
                        <View className="flex-row items-center">
                            <Text className="text-[12px] font-manrope-medium text-white/80">
                                📍 {deal.location}
                            </Text>
                        </View>
                    </View>

                    {/* 3 Stats Cards */}
                    <View className="flex-row justify-between gap-[8px] relative z-10">
                        <View className="flex-1 justify-center items-center h-[40px] bg-[rgba(255,255,255,0.15)] rounded-[10px]">
                            <Text className="text-[13px] font-manrope-bold text-white mb-0.5" numberOfLines={1}>
                                {deal.totalValue}
                            </Text>
                            <Text className="text-[9px] font-manrope-medium text-white/80">
                                Total Value
                            </Text>
                        </View>
                        <View className="flex-1 h-[40px] bg-[rgba(255,255,255,0.15)] rounded-[10px] justify-center px-3">
                            <Text className="text-[13px] font-manrope-bold text-white mb-0.5">
                                {deal.completionPercentage}%
                            </Text>
                            <Text className="text-[9px] font-manrope-medium text-white/80">
                                Paid
                            </Text>
                        </View>
                        <View className="flex-1 h-[40px] bg-[rgba(255,255,255,0.15)] rounded-[10px] justify-center px-3">
                            <Text className="text-[13px] font-manrope-bold text-white mb-0.5">
                                Stage 5/8
                            </Text>
                            <Text className="text-[9px] font-manrope-medium text-white/80">
                                Timeline
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Body Section with Tabs */}
                <View className="bg-white">
                    {/* Tabs Row */}
                    <View className="flex-row items-center justify-between px-5 pt-4 pb-0 border-b border-[#F3F4F6]">
                        {TABS.map((tab) => {
                            const isActive = tab === activeTab;
                            return (
                                <Pressable key={`main-tab-${tab}`} onPress={() => setActiveTab(tab)} className={`pb-3 ${isActive ? 'border-b-[3px] border-[#4F48ED]' : 'border-b-[3px] border-transparent'}`}>
                                    <Text className={`text-[13px] ${isActive ? 'font-manrope-bold text-[#4F48ED]' : 'font-manrope-medium text-[#9CA3AF]'}`}>
                                        {tab}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Tab Content Box */}
                    <View className="px-5 pt-6 pb-[100px]">
                        {renderActiveTabBox()}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
