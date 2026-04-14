import { Tabs } from "expo-router";
import { Platform, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const icons = {
    home: {
        inactive: require("../../assets/icons/tabs/home.png"),
        active: require("../../assets/icons/tabs/home-active.png"),
    },
    myActivity: {
        inactive: require("../../assets/icons/tabs/fav.png"),
        active: require("../../assets/icons/tabs/fav-active.png"),
    },
    visit: {
        inactive: require("../../assets/icons/tabs/book.png"),
        active: require("../../assets/icons/tabs/book-active.png"),
    },
    myDeals: {
        inactive: require("../../assets/icons/tabs/discount.png"),
        active: require("../../assets/icons/tabs/discount-active.png"),
    },
    settings: {
        inactive: require("../../assets/icons/tabs/settings.png"),
        active: require("../../assets/icons/tabs/settings-active.png"),
    },
};

function TabIcon({ name, focused, size }) {
    const icon = icons[name];
    const activeSize = size?.active ?? { width: 44, height: 44 };
    const inactiveSize = size?.inactive ?? { width: 24, height: 24 };
    return (
        <Image
            source={focused ? icon.active : icon.inactive}
            style={[focused ? activeSize : inactiveSize]}
            contentFit="contain"
            transition={0}
        />
    );
}

export default function TabsLayout() {
    const searchActive = useSelector((state) => state.app.searchActive);
    const insets = useSafeAreaInsets();
    const androidBottomInset = Platform.OS === "android" ? Math.max(insets.bottom, 0) : 0;
    const iosBottomPadding = Platform.OS === "ios" ? Math.max(insets.bottom - 8, 6) : 8;

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: searchActive ? { display: 'none' } : {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: Platform.OS === "ios" ? 0 : androidBottomInset,
                    borderTopRightRadius: 45,
                    borderTopLeftRadius: 45,
                    borderTopColor: "transparent",
                    backgroundColor: "#fff",
                    paddingTop: 15,
                    paddingHorizontal: 15,
                    paddingBottom: iosBottomPadding,
                    height: Platform.OS === "ios" ? 85 : 80,
                    ...Platform.select({
                        ios: {
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 4,
                        },
                        android: {
                            elevation: 10,
                        },
                    }),
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="myActivity"
                options={{
                    headerTitle: "My Activity",
                    headerTitleAlign: "center",
                    headerShadowVisible: false,
                    headerStyle: {
                        borderBottomWidth: 1.,
                        borderBottomColor: 'rgba(0,0,0,0.06)',
                    },
                    tabBarIcon: ({ focused }) => <TabIcon name="myActivity" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="visit"
                options={{
                    headerTitle: "Book a site visit",
                    headerTitleAlign: "center",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            name="visit"
                            focused={focused}
                            size={{
                                active: { width: 56, height: 56, position: "absolute", bottom: 0 },
                                inactive: { width: 56, height: 56, position: "absolute", bottom: 0 },
                            }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="myDeals"
                options={{
                    headerShown: false,
                    tabBarIcon: ({ focused }) => <TabIcon name="myDeals" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    headerTitle: "",
                    headerLeft: () => (
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0F172A', marginLeft: 20 }}>
                            Profile
                        </Text>
                    ),
                    headerRight: () => (
                        <TouchableOpacity style={{ marginRight: 16 }}>
                            <Feather name="edit-2" size={20} color="#475569" />
                        </TouchableOpacity>
                    ),
                    headerStyle: { backgroundColor: '#F3F4F6' },
                    headerShadowVisible: false,
                    tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
                }}

            />

        </Tabs>
    );
}