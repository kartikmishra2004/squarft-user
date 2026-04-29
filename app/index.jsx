import { Redirect } from "expo-router";
import { useSelector } from "react-redux";

export default function Index() {
    const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

    if (isLoggedIn) {
        return <Redirect href="/(tabs)/home" />;
    }

    return <Redirect href="/(auth)/onboarding1" />;
}






