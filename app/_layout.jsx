import "react-native-gesture-handler";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { useFonts } from "expo-font";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { FontAwesome, Ionicons, MaterialIcons, MaterialCommunityIcons, AntDesign, Feather, Octicons, FontAwesome6 } from "@expo/vector-icons";

import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from "@expo-google-fonts/manrope";
import { PublicSans_400Regular, PublicSans_600SemiBold, PublicSans_700Bold, PublicSans_800ExtraBold } from "@expo-google-fonts/public-sans";
import { Asset } from "expo-asset";
import { useState } from "react";
import { store } from "../store/store";
import { useRootNavigationState } from "expo-router";

SplashScreen.preventAutoHideAsync();

const iconsArray = [
    require("../assets/icons/tabs/home.png"),
    require("../assets/icons/tabs/home-active.png"),
    require("../assets/icons/tabs/fav.png"),
    require("../assets/icons/tabs/fav-active.png"),
    require("../assets/icons/tabs/book.png"),
    require("../assets/icons/tabs/book-active.png"),
    require("../assets/icons/tabs/discount.png"),
    require("../assets/icons/tabs/discount-active.png"),
    require("../assets/icons/tabs/settings.png"),
    require("../assets/icons/tabs/settings-active.png"),
];

export default function RootLayout() {
    const [assetsLoaded, setAssetsLoaded] = useState(false);
    const rootNavigationState = useRootNavigationState();

    const [fontsLoaded] = useFonts({
        ...FontAwesome.font,
        ...Ionicons.font,
        ...MaterialIcons.font,
        ...MaterialCommunityIcons.font,
        ...AntDesign.font,
        ...Feather.font,
        ...Octicons.font,
        ...FontAwesome6.font,
        Lato_400Regular,
        Lato_700Bold,
        Inter_400Regular,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_800ExtraBold,
        Manrope_400Regular,
        Manrope_500Medium,
        Manrope_600SemiBold,
        Manrope_700Bold,
        Manrope_800ExtraBold,
        PublicSans_400Regular,
        PublicSans_600SemiBold,
        PublicSans_700Bold,
        PublicSans_800ExtraBold,
    });

    useEffect(() => {
        async function loadAssets() {
            try {
                await Asset.loadAsync(iconsArray);
            } catch (err) {
                console.warn("Asset preloading error:", err);
            } finally {
                setAssetsLoaded(true);
            }
        }
        loadAssets();
    }, []);

    useEffect(() => {
        if (fontsLoaded && assetsLoaded && rootNavigationState?.key) {
            // Add a small delay to ensure icons are fully rendered before hiding splash
            const timer = setTimeout(() => {
                SplashScreen.hideAsync();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [fontsLoaded, assetsLoaded, rootNavigationState?.key]);

    if (!fontsLoaded || !assetsLoaded || !rootNavigationState?.key) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <BottomSheetModalProvider>
                    <Stack>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="(auth)" options={{ headerShown: false, animation: "none" }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "none" }} />
                        <Stack.Screen name="(screens)" options={{ headerShown: false }} />
                    </Stack>
                </BottomSheetModalProvider>
            </Provider>
        </GestureHandlerRootView>
    );
}