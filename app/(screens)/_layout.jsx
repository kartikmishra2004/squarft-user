import { Stack, useRouter } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScreensLayout() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <Stack>
            <Stack.Screen
                name="review"
                options={{
                    header: () => (
                        <View style={{ paddingTop: insets.top, backgroundColor: "white" }}>
                            <View className="flex-row items-center justify-between px-6 py-0.5 bg-white border-b border-[#E5E7EB]">
                                <Pressable
                                    onPress={() => router.back()}
                                    className="w-10 h-10 justify-center"
                                >
                                    <Feather name="arrow-left" size={24} color="#111827" />
                                </Pressable>

                                <Text className="text-[17px] font-manrope-bold text-[#111827]">
                                    Review
                                </Text>

                                <View className="w-10 h-10" />
                            </View>
                        </View>
                    ),
                }}
            />
        </Stack>
    );
}