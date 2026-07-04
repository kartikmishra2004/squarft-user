import { Image, Pressable, Text, View, useWindowDimensions } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const DOTS = [0, 1, 2];

export default function OnboardingScreen({ image, activeIndex, nextHref }) {
    const { height } = useWindowDimensions();
    const panelHeight = Math.max(210, Math.min(245, height * 0.28));

    return (
        <View className="flex-1 bg-[#F2EFFF] overflow-hidden">
            <StatusBar style="dark" translucent backgroundColor="transparent" />
            <Image
                source={image}
                className="absolute inset-0 h-full w-full"
                resizeMode="cover"
            />

            <View
                className="absolute bottom-0 left-0 right-0 items-center rounded-t-[28px] bg-white px-8 pt-6"
                style={{
                    height: panelHeight,
                    shadowColor: "#4A43EC",
                    shadowOffset: { width: 0, height: -14 },
                    shadowOpacity: 0.08,
                    shadowRadius: 28,
                    elevation: 12,
                }}
            >
                <View className="mb-6 flex-row items-center justify-center gap-3">
                    {DOTS.map((dot) => (
                        <View
                            key={dot}
                            className={`h-2 w-2 rounded-full ${dot === activeIndex ? "bg-[#514BFF]" : "bg-[#DFE1F1]"}`}
                        />
                    ))}
                </View>

                <Text className="mb-3 text-center text-[20px] font-manrope-extrabold text-[#2E2E35]">
                    Manage Deals Easily
                </Text>
                <Text className="mb-6 text-center text-[12px] font-manrope-medium leading-5 text-[#777A85]">
                    Track every step from property interest{"\n"}to final closure with clarity.
                </Text>

                <Link href={nextHref} asChild>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={activeIndex === 2 ? "Go to login" : "Next onboarding screen"}
                        className="h-[64px] w-[64px] items-center justify-center rounded-full bg-[#E8E6FF]"
                    >
                        <View className="h-[56px] w-[56px] items-center justify-center rounded-full border border-white/80 bg-[#F7F6FF]">
                            <LinearGradient
                                colors={["#6E66FF", "#4A43EC"]}
                                start={{ x: 0.1, y: 0 }}
                                end={{ x: 0.9, y: 1 }}
                                style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 24,
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <MaterialCommunityIcons name="arrow-right" size={25} color="#FFFFFF" />
                            </LinearGradient>
                        </View>
                    </Pressable>
                </Link>
            </View>
        </View>
    );
}
