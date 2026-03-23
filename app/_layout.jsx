import "react-native-gesture-handler";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { useFonts } from "expo-font";
import "../global.css";
import { store } from "../store/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

// Lato
import {
    Lato_100Thin, Lato_100Thin_Italic,
    Lato_300Light, Lato_300Light_Italic,
    Lato_400Regular, Lato_400Regular_Italic,
    Lato_700Bold, Lato_700Bold_Italic,
    Lato_900Black, Lato_900Black_Italic,
} from "@expo-google-fonts/lato";

// Inter
import {
    Inter_100Thin, Inter_100Thin_Italic,
    Inter_200ExtraLight, Inter_200ExtraLight_Italic,
    Inter_300Light, Inter_300Light_Italic,
    Inter_400Regular, Inter_400Regular_Italic,
    Inter_500Medium, Inter_500Medium_Italic,
    Inter_600SemiBold, Inter_600SemiBold_Italic,
    Inter_700Bold, Inter_700Bold_Italic,
    Inter_800ExtraBold, Inter_800ExtraBold_Italic,
    Inter_900Black, Inter_900Black_Italic,
} from "@expo-google-fonts/inter";

// Manrope
import {
    Manrope_200ExtraLight,
    Manrope_300Light,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Lato_100Thin, Lato_100Thin_Italic,
        Lato_300Light, Lato_300Light_Italic,
        Lato_400Regular, Lato_400Regular_Italic,
        Lato_700Bold, Lato_700Bold_Italic,
        Lato_900Black, Lato_900Black_Italic,
        Inter_100Thin, Inter_100Thin_Italic,
        Inter_200ExtraLight, Inter_200ExtraLight_Italic,
        Inter_300Light, Inter_300Light_Italic,
        Inter_400Regular, Inter_400Regular_Italic,
        Inter_500Medium, Inter_500Medium_Italic,
        Inter_600SemiBold, Inter_600SemiBold_Italic,
        Inter_700Bold, Inter_700Bold_Italic,
        Inter_800ExtraBold, Inter_800ExtraBold_Italic,
        Inter_900Black, Inter_900Black_Italic,
        Manrope_200ExtraLight,
        Manrope_300Light,
        Manrope_400Regular,
        Manrope_500Medium,
        Manrope_600SemiBold,
        Manrope_700Bold,
        Manrope_800ExtraBold,
    });

    useEffect(() => {
        if (fontsLoaded) {
            SplashScreen.hideAsync();
        }
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <Provider store={store}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <BottomSheetModalProvider>
                    <Stack>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="(auth)" options={{ headerShown: false, animation: "none" }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "none" }} />
                    </Stack>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </Provider>
    );
}
