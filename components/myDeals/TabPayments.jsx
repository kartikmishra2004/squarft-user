import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { paymentsData, PAYMENTS_TABS } from "../../data/my-deals";

const getPaymentStyles = (status) => {
    switch (status) {
        case "Paid":
            return {
                borderClass: "border-[#F3F4F6]",
                bgIcon: "bg-[#E6F6ED]",
                textIcon: "text-[#22A559]",
                badgeBg: "bg-[#E6F6ED]",
                badgeText: "text-[#22A559]"
            };
        case "Due Soon":
            return {
                borderClass: "border-[#F59E0B]",
                bgIcon: "bg-[#FFF8E6]",
                textIcon: "text-[#F59E0B]",
                badgeBg: "bg-[#FFF8E6]",
                badgeText: "text-[#F59E0B]"
            };
        case "Upcoming":
            return {
                borderClass: "border-[#F3F4F6]",
                bgIcon: "bg-[#F3F4F6]",
                textIcon: "text-[#6B7280]",
                badgeBg: "bg-[#F3F4F6]",
                badgeText: "text-[#6B7280]"
            };
        case "Overdue":
            return {
                borderClass: "border-[#EF4444]",
                bgIcon: "bg-[#FEF2F2]",
                textIcon: "text-[#EF4444]",
                badgeBg: "bg-[#FEF2F2]",
                badgeText: "text-[#EF4444]"
            };
        default:
            return {
                borderClass: "border-[#F3F4F6]",
                bgIcon: "bg-[#F3F4F6]",
                textIcon: "text-[#6B7280]",
                badgeBg: "bg-[#F3F4F6]",
                badgeText: "text-[#6B7280]"
            };
    }
}

export default function TabPayments() {
    const [paymentFilter, setPaymentFilter] = useState("All");

    const filteredPayments = paymentFilter === "All"
        ? paymentsData
        : paymentsData.filter(p => {
            if (paymentFilter === "Upcoming") return p.status === "Upcoming" || p.status === "Due Soon";
            return p.status === paymentFilter;
        });

    return (
        <View className="mb-4">
            <View className="flex-row bg-[#EEEDFF] rounded-[10px] p-[3px] mb-4">
                {PAYMENTS_TABS.map((tab) => {
                    const isActive = paymentFilter === tab;
                    return (
                        <Pressable
                            key={`pay-tab-${tab}`}
                            onPress={() => setPaymentFilter(tab)}
                            className={`flex-1 items-center justify-center py-[6px] rounded-[8px] ${isActive ? 'bg-white' : ''}`}
                            style={isActive ? { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 } : {}}
                        >
                            <Text className={`text-[11px] ${isActive ? 'font-manrope-bold text-[#4F48ED]' : 'font-manrope-medium text-[#9CA3AF]'}`}>
                                {tab}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <View>
                {filteredPayments.map((item) => {
                    const styles = getPaymentStyles(item.status);
                    return (
                        <View key={`pay-item-${item.id}`} className={`flex-row items-center p-3.5 bg-white rounded-[12px] mb-3 border ${styles.borderClass}`}>
                            <View className={`w-[38px] h-[38px] rounded-[10px] items-center justify-center mr-3 ${styles.bgIcon}`}>
                                <Text className={`text-[14px] font-manrope-bold ${styles.textIcon}`}>{item.seq}</Text>
                            </View>

                            <View className="flex-1">
                                <Text className="text-[13px] font-manrope-bold text-[#111827] mb-0.5">{item.title}</Text>
                                <Text className="text-[11px] font-manrope-medium text-[#9CA3AF]">{item.date}</Text>
                            </View>

                            <View className="items-end">
                                <Text className="text-[14px] font-manrope-bold text-[#111827] mb-1">{item.amount}</Text>
                                <View className={`px-2 py-[2px] rounded-[6px] ${styles.badgeBg}`}>
                                    <Text className={`text-[10px] font-manrope-bold ${styles.badgeText}`}>{item.status}</Text>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
