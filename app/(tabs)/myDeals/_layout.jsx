import { Stack } from "expo-router";

export default function MyDealsLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false, // Default to no header, or standard header
            }}
        >
            <Stack.Screen
                name="index"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="[id]"
                options={{ headerShown: false }}
            />
        </Stack>
    );
}
