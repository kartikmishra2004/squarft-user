import { View, Text, Image, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { memo, useRef, useEffect } from 'react';
import { timelineData } from "../../data/my-deals";
import TimelineItem from './TimelineItem';

const TabTimeline = memo(function TabTimeline() {
    const lineAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(lineAnim, {
            toValue: 1,
            duration: timelineData.length * 120 + 400,
            useNativeDriver: false,
        }).start();
    }, []);

    return (
        <View>
            <View className="flex-row justify-between items-center mb-5">
                <Text className="text-[14px] font-manrope-bold text-[#111827]">Timeline Progress</Text>
                <View className="bg-[#EEEDFF] px-2.5 py-1 rounded-full">
                    <Text className="text-[10px] font-manrope-bold text-[#4F48ED]">Stage 5 of 8</Text>
                </View>
            </View>

            <View className="relative">
                {/* Static grey track */}
                <View className="absolute left-[9px] top-[14px] bottom-[40px] w-[2px] bg-[#E5E7EB]" />

                {/* Animated purple fill */}
                <Animated.View
                    style={{
                        position: 'absolute',
                        left: 9,
                        top: 14,
                        width: 2,
                        backgroundColor: '#6231FF',
                        height: lineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '55%'],
                        }),
                        borderRadius: 2,
                        zIndex: 1,
                    }}
                />

                {timelineData.map((item, index) => (
                    <TimelineItem
                        key={item.id}
                        index={index}
                        status={item.status}
                        title={item.title}
                        time={item.time}
                        badge={item.badge}
                        iconName={item.iconName}
                    >
                        {item.images && (
                            <View className="flex-row gap-2 mt-2 mb-1">
                                {item.images.map((img, idx) => (
                                    <Image key={idx} source={{ uri: img }} className="w-[36px] h-[36px] rounded-[8px]" />
                                ))}
                                {item.extraImagesCount > 0 && (
                                    <View className="w-[36px] h-[36px] bg-[#F3F4F6] rounded-[8px] justify-center items-center">
                                        <Text className="text-[10px] font-inter-semibold text-[#4B5563]">+{item.extraImagesCount}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                        {item.actionText && item.actionIcon && (
                            <View className="mt-2 flex-row items-center bg-[#F3F4F6] px-2 py-1 rounded-[6px] self-start gap-1.5">
                                <Feather name={item.actionIcon} size={10} color="#6231FF" />
                                <Text className="text-[10px] font-inter-semibold text-[#1F2937]">{item.actionText}</Text>
                            </View>
                        )}
                        {item.description && (
                            <View>
                                <Text className="text-[11px] font-inter-medium text-[#6B7280] mt-1 pr-4 leading-[16px] flex-1 mb-1">
                                    {item.description}
                                </Text>
                                {item.askingPrice && item.currentOffer && (
                                    <View className="mt-2 bg-[#FCFAFF] border border-[#EBE5FF] rounded-lg p-2.5">
                                        <View className="flex-row justify-between items-center mb-1">
                                            <Text className="text-[10px] font-inter-medium text-[#6B7280]">Asking Price:</Text>
                                            <Text className="text-[12px] font-inter-bold text-[#111827]">{item.askingPrice}</Text>
                                        </View>
                                        <View className="flex-row justify-between items-center">
                                            <Text className="text-[10px] font-inter-medium text-[#6B7280]">Current Offer:</Text>
                                            <Text className="text-[12px] font-inter-bold text-[#6231FF]">{item.currentOffer}</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}
                    </TimelineItem>
                ))}
            </View>
        </View>
    );
});

export default TabTimeline;
