import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider } from 'react-redux';
import "../global.css";
import { store } from '../store/store';

SplashScreen.preventAutoHideAsync();

export default function AuthLayout() {

    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <Provider store={store}>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                {/* Onboarding */}
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                {/* Main */}
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
        </Provider>
    );
}