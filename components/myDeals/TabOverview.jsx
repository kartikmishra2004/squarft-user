import { View, Text } from 'react-native';

export default function TabOverview({ activeTab }) {
    return (
        <View className="bg-white rounded-[12px] p-4 shadow-sm border border-[#F3F4F6]" style={{ elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 }}>
            <Text className="text-[14px] font-manrope-bold text-[#111827] mb-1.5">{activeTab} Summary</Text>
            <Text className="text-[11px] font-manrope-medium text-[#6B7280]">
                {activeTab} Coming soon...
            </Text>
        </View>
    );
}
