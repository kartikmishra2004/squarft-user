import { Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Platform, Text } from "react-native";
import { useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TAB_COLOR = "#4A43EC";
const MUTED_TAB_COLOR = "#94A3B8";

const tabIcons = {
    home: ["home", "home-outline"],
    myActivity: ["pulse", "pulse-outline"],
    visit: ["calendar", "calendar-outline"],
    myDeals: ["pricetag", "pricetag-outline"],
    settings: ["person-circle", "person-circle-outline"],
};

function TabIcon({ name, focused }) {
    const [activeIcon, inactiveIcon] = tabIcons[name];
    const iconName = focused ? activeIcon : inactiveIcon;
    const color = focused ? TAB_COLOR : MUTED_TAB_COLOR;
    const scale = useRef(new Animated.Value(focused ? 1 : 0.94)).current;
    const translateY = useRef(new Animated.Value(focused ? -2 : 0)).current;

    useEffect(() => {
        if (focused) {
            Animated.parallel([
                Animated.sequence([
                    Animated.timing(scale, {
                        toValue: 1.18,
                        duration: 120,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scale, {
                        toValue: 1,
                        friction: 4,
                        tension: 140,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.sequence([
                    Animated.timing(translateY, {
                        toValue: -5,
                        duration: 120,
                        useNativeDriver: true,
                    }),
                    Animated.spring(translateY, {
                        toValue: -2,
                        friction: 5,
                        tension: 120,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
            return;
        }

        Animated.parallel([
            Animated.timing(scale, {
                toValue: 0.94,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start();
    }, [focused, scale, translateY]);

    return (
        <Animated.View style={{ transform: [{ translateY }, { scale }] }}>
            <Ionicons name={iconName} size={24} color={color} />
        </Animated.View>
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
                tabBarShowLabel: true,
                tabBarActiveTintColor: TAB_COLOR,
                tabBarInactiveTintColor: MUTED_TAB_COLOR,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontFamily: "Inter_600SemiBold",
                    marginTop: 2,
                },
                tabBarItemStyle: {
                    paddingTop: 3,
                },
                tabBarStyle: searchActive ? { display: 'none' } : {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: Platform.OS === "ios" ? 0 : androidBottomInset - 1,
                    borderTopRightRadius: 45,
                    borderTopLeftRadius: 45,
                    borderTopColor: "transparent",
                    backgroundColor: "#fff",
                    paddingTop: 12,
                    paddingHorizontal: 15,
                    paddingBottom: iosBottomPadding,
                    height: Platform.OS === "ios" ? 88 : 82,
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
                    tabBarLabel: "Home",
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
                    tabBarLabel: "Activity",
                    tabBarIcon: ({ focused }) => <TabIcon name="myActivity" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="visit"
                options={{
                    headerTitle: "Book a site visit",
                    headerTitleAlign: "center",
                    tabBarLabel: "Visit",
                    tabBarIcon: ({ focused }) => <TabIcon name="visit" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="myDeals"
                options={{
                    headerShown: false,
                    tabBarLabel: "Deals",
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
                   
                    headerStyle: { backgroundColor: '#F3F4F6' },
                    headerShadowVisible: false,
                    tabBarLabel: "Profile",
                    tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
                }}

            />

        </Tabs>
    );
}
