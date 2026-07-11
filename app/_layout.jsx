import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack, useRootNavigationState } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useFonts } from "expo-font";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import "../global.css";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { FontAwesome, Ionicons, MaterialIcons, MaterialCommunityIcons, AntDesign, Feather, Octicons, FontAwesome6 } from "@expo/vector-icons";
import { registerGlobals } from "@livekit/react-native";

import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from "@expo-google-fonts/manrope";
import { PublicSans_400Regular, PublicSans_600SemiBold, PublicSans_700Bold, PublicSans_800ExtraBold } from "@expo-google-fonts/public-sans";
import { store } from "../store/store";
import PushNotificationRegistrar from "../components/PushNotificationRegistrar";
import FilterModal from "../components/FilterModal";
import { hydrateAndCleanTrackers } from "../store/slices/projectViewTrackingSlice";
import { hydrateAndCleanRecentTrackers } from "../store/slices/recentProjectsSlice";
import * as Location from "expo-location";
import { setCoordinates, setLocationPermission } from "../store/slices/locationSlice";

if (!globalThis.__SQUARFT_LIVEKIT_GLOBALS_REGISTERED__) {
    registerGlobals();
    globalThis.__SQUARFT_LIVEKIT_GLOBALS_REGISTERED__ = true;
}

SplashScreen.preventAutoHideAsync();

function ActivityTrackerHydrator() {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);

    useEffect(() => {
        dispatch(hydrateAndCleanTrackers());
        dispatch(hydrateAndCleanRecentTrackers());
    }, [dispatch]);

    useEffect(() => {
        // Never trigger the OS location prompt on splash/auth screens.
        if (!token) return undefined;
        let active = true;
        const requestLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (!active) return;
                dispatch(setLocationPermission(status));
                if (status !== 'granted') return;

                const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                if (active) {
                    dispatch(setCoordinates({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }));
                }
            } catch {
                if (active) dispatch(setLocationPermission('unavailable'));
            }
        };
        requestLocation();
        return () => { active = false; };
    }, [dispatch, token]);

    return null;
}

export default function RootLayout() {
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
        if (Platform.OS !== "android") return;

        NavigationBar.setButtonStyleAsync("dark").catch(() => { });
    }, []);

    useEffect(() => {
        if (fontsLoaded && rootNavigationState?.key) {
            // Add a small delay to ensure fonts are fully rendered before hiding splash
            const timer = setTimeout(() => {
                SplashScreen.hideAsync();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [fontsLoaded, rootNavigationState?.key]);

    if (!fontsLoaded || !rootNavigationState?.key) return null;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Provider store={store}>
                <BottomSheetModalProvider>
                    <ActivityTrackerHydrator />
                    <PushNotificationRegistrar />
                    <FilterModal />
                    <Stack screenOptions={{ gestureEnabled: false }}>
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
