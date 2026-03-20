import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function AuthLayout() {

    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <Stack>
            {/* Onboarding */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            {/* Main */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}