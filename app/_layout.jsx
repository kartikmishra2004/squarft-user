import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack>
            {/* Onboarding */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            {/* Main */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
    );
}