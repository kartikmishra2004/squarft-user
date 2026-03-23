import { Text, View, Pressable, ScrollView, Image, TextInput } from "react-native";
import { Link, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

export default function Review() {
    const router = useRouter();
    const [propertyRating, setPropertyRating] = useState(0);
    const [agentRating, setAgentRating] = useState(0);
    const [sameAsPhotos, setSameAsPhotos] = useState('Yes');
    const [samePrice, setSamePrice] = useState('No, it was higher');
    const [comments, setComments] = useState('');

    return (
        <View className="flex-1 bg-white pt-6">
            <ScrollView className="flex-1 px-5 bg-white" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <Text className="text-[12px] font-manrope-extrabold tracking-[1px] text-[#4B5563] uppercase mb-[14px]">
                    VISIT SUMMARY
                </Text>

                <View className="flex-row items-center border border-gray-100 rounded-2xl p-3 mb-6 bg-white shadow-sm" style={{ elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 }}>
                    <Image
                        source={{ uri: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" }}
                        className="w-[68px] h-[68px] rounded-[10px] mr-4"
                        resizeMode="cover"
                    />
                    <View className="justify-center flex-1">
                        <Text className="text-[11px] font-manrope text-[#6B7280] mb-[2px]">
                            Visited on 24 Oct, 2023
                        </Text>
                        <Text className="text-[15px] font-manrope-extrabold text-[#111827] mb-[2px]">
                            Green Valley Residency
                        </Text>
                        <Text className="text-[12px] font-manrope font-medium text-[#9CA3AF]">
                            Unit 402, Block B • Bangalore
                        </Text>
                    </View>
                </View>

                <View className="bg-[#F8F9FA] border border-gray-100 rounded-[16px] p-5 mb-4">
                    <Text className="text-[15px] font-manrope-extrabold text-[#111827] mb-[4px]">
                        How was the Property?
                    </Text>
                    <Text className="text-[12px] font-manrope font-medium text-[#6B7280] leading-[18px] mb-4 pr-4">
                        Rate the project construction, amenities, and locality.
                    </Text>
                    <View className="flex-row items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Pressable
                                key={star}
                                onPress={() => setPropertyRating(star)}
                                className={star < 5 ? "mr-[15px]" : ""}
                            >
                                <Feather
                                    name="star"
                                    size={30}
                                    color={star <= propertyRating ? "#FBBF24" : "#D1D5DB"}
                                    style={{ fill: star <= propertyRating ? "#FBBF24" : "transparent" }}
                                />
                            </Pressable>
                        ))}
                    </View>
                </View>

                <View className="bg-[#F8F9FA] border border-gray-100 rounded-[16px] p-5 mb-[26px]">
                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 rounded-full bg-[#EEEDFC] items-center justify-center mr-3">
                            <Feather name="user" size={18} color="#4A43EC" />
                        </View>
                        <View>
                            <Text className="text-[15px] font-manrope-extrabold text-[#111827] mb-[2px]">
                                Rate the Sales Agent
                            </Text>
                            <Text className="text-[12px] font-manrope font-medium text-[#7D8490]">
                                Professionalism & knowledge
                            </Text>
                        </View>
                    </View>
                    <View className="flex-row items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Pressable
                                key={star}
                                onPress={() => setAgentRating(star)}
                                className={star < 5 ? "mr-[15px]" : ""}
                            >
                                <Feather
                                    name="star"
                                    size={30}
                                    color={star <= agentRating ? "#FBBF24" : "#D1D5DB"}
                                    style={{ fill: star <= agentRating ? "#FBBF24" : "transparent" }}
                                />
                            </Pressable>
                        ))}
                    </View>
                </View>

                <Text className="text-[14px] font-manrope-extrabold text-[#111827] mb-[12px]">
                    Was the property same as shown in photos?
                </Text>
                <View className="flex-row items-center mb-6">
                    <Pressable
                        onPress={() => setSameAsPhotos('Yes')}
                        className={`flex-1 py-[12px] rounded-[10px] flex-row items-center justify-center border mr-3 ${sameAsPhotos === 'Yes' ? 'border-[#4A43EC] bg-white' : 'border-[#E5E7EB] bg-white'}`}
                    >
                        <Feather name="check-circle" size={15} color={sameAsPhotos === 'Yes' ? "#4A43EC" : "#6B7280"} style={{ marginRight: 6 }} />
                        <Text className={`font-manrope-extrabold text-[13px] ${sameAsPhotos === 'Yes' ? 'text-[#4A43EC]' : 'text-[#6B7280]'}`}>Yes</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setSameAsPhotos('No')}
                        className={`flex-1 py-[12px] rounded-[10px] flex-row items-center justify-center border ${sameAsPhotos === 'No' ? 'border-[#4A43EC] bg-white' : 'border-[#E5E7EB] bg-white'}`}
                    >
                        <Feather name="x-circle" size={15} color={sameAsPhotos === 'No' ? "#4A43EC" : "#6B7280"} style={{ marginRight: 6 }} />
                        <Text className={`font-manrope-extrabold text-[13px] ${sameAsPhotos === 'No' ? 'text-[#4A43EC]' : 'text-[#6B7280]'}`}>No</Text>
                    </Pressable>
                </View>

                <Text className="text-[14px] font-manrope-extrabold text-[#111827] mb-[12px]">
                    Was the price discussed same as listed on app?
                </Text>
                <View className="flex-row items-center mb-7">
                    <Pressable
                        onPress={() => setSamePrice('Yes')}
                        className={`flex-1 py-[12px] rounded-[10px] flex-row items-center justify-center border mr-3 ${samePrice === 'Yes' ? 'border-[#4A43EC] bg-white' : 'border-[#E5E7EB] bg-white'}`}
                    >
                        <Text className={`font-manrope-extrabold text-[13px] ${samePrice === 'Yes' ? 'text-[#4A43EC]' : 'text-[#6B7280]'}`}>Yes</Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setSamePrice('No, it was higher')}
                        className={`flex-1 py-[12px] rounded-[10px] flex-row items-center justify-center border ${samePrice === 'No, it was higher' ? 'border-[#4A43EC] bg-white' : 'border-[#E5E7EB] bg-white'}`}
                    >
                        <Text className={`font-manrope-extrabold text-[13px] ${samePrice === 'No, it was higher' ? 'text-[#4A43EC]' : 'text-[#6B7280]'}`}>No, it was higher</Text>
                    </Pressable>
                </View>

                <Text className="text-[14px] font-manrope-extrabold text-[#111827] mb-[12px]">
                    Additional Comments
                </Text>
                <View className="border border-[#E5E7EB] rounded-[12px] bg-white mb-[28px]">
                    <TextInput
                        multiline
                        placeholder="Tell us more about your experience (optional)"
                        placeholderTextColor="#9CA3AF"
                        value={comments}
                        onChangeText={setComments}
                        className="px-[14px] py-4 font-manrope font-medium text-[#111827] text-[13px] align-top"
                        style={{ height: 110, textAlignVertical: 'top' }}
                    />
                </View>
                <Link href="/rating-submitted" asChild>
                    <Pressable className="bg-[#4A43EC] py-[15px] rounded-[12px] flex-row items-center justify-center mb-4">
                        <Text className="text-white font-manrope-extrabold text-[15px]" style={{ marginRight: 8 }}>Submit Feedback</Text>
                        <Feather name="send" size={17} color="white" />
                    </Pressable>
                </Link>

                <Text className="text-center text-[11px] font-manrope font-medium text-[#9CA3AF] mb-8">
                    Your feedback helps SquarFT maintain quality listings.
                </Text>

            </ScrollView>
        </View>
    );
}