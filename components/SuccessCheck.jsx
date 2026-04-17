import { useRef, useEffect } from "react";
import { Animated, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

export default function SuccessCheck() {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

        // Sound
        (async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    { uri: "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" },
                    { shouldPlay: true, volume: 0.6 }
                );
                sound.setOnPlaybackStatusUpdate((status) => {
                    if (status.didJustFinish) sound.unloadAsync();
                });
            } catch {
                // skip silently
            }
        })();

        // Animation: 0 → 1.2 → 1 with spring bounce
        Animated.sequence([
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scale, {
                    toValue: 1.2,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]),
            Animated.spring(scale, {
                toValue: 1,
                tension: 120,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ transform: [{ scale }], opacity }}>
            <View className="w-[74px] h-[74px] bg-[#6C3BFF1A] rounded-full items-center justify-center">
                <View className="w-[42px] h-[42px] bg-[#4A43EC] rounded-full items-center justify-center">
                    <Feather name="check" size={24} color="white" />
                </View>
            </View>
        </Animated.View>
    );
}
