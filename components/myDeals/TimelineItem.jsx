import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TimelineItem = ({ status, title, time, badge, iconName, children }) => {
    return (
        <View className="flex-row mb-6 relative z-10">
            <View className="mr-3 items-center mt-0.5">
                {status === 'completed' && (
                    <View className="w-[18px] h-[18px] rounded-full bg-[#6231FF] justify-center items-center shadow-sm z-10">
                        <Ionicons name="checkmark" size={10} color="white" />
                    </View>
                )}
                {status === 'current' && (
                    <View className="w-[18px] h-[18px] rounded-full border-[2px] border-[#6231FF] bg-white justify-center items-center z-10">
                        <View className="w-[8px] h-[8px] bg-[#6231FF] rounded-full" />
                    </View>
                )}
                {status === 'pending' && (
                    <View className="w-[18px] h-[18px] rounded-full border border-gray-200 bg-white justify-center items-center z-10 flex-row">
                        <Ionicons name={iconName} size={10} color="#D1D5DB" />
                    </View>
                )}
            </View>
            <View className="flex-1">
                <View className="flex-row items-center gap-2">
                    <Text className={`text-[13px] font-inter-bold ${status === 'current' ? 'text-[#6231FF]' : status === 'pending' ? 'text-[#9CA3AF]' : 'text-[#1F2937]'}`}>
                        {title}
                    </Text>
                    {badge && (
                        <View className="bg-[#6231FF] px-1 py-[1.5px] rounded-[4px]">
                            <Text className="text-[8px] font-inter-bold text-white tracking-wider">{badge}</Text>
                        </View>
                    )}
                </View>
                {time && (
                    <Text className={`text-[10px] mt-0.5 font-inter-medium ${status === 'pending' ? 'text-[#D1D5DB]' : 'text-[#6B7280]'}`}>
                        {time}
                    </Text>
                )}
                {children}
            </View>
        </View>
    );
};

export default TimelineItem;
