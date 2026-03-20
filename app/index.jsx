import { Redirect } from "expo-router";

export default function Index() {
    const isLoggedIn = false;

    if (isLoggedIn) {
        return <Redirect href="/(tabs)/home" />;
    }

    return <Redirect href="/(auth)/onboarding1" />;
}