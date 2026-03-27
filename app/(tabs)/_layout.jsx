import { Tabs } from "expo-router";
import { Image, Platform } from "react-native";
import { useSelector } from "react-redux";

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
    discount: {
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
    const activeSize = size?.active ?? { width: 54, height: 54 };
    const inactiveSize = size?.inactive ?? { width: 28, height: 28 };
    return (
        <Image
            source={focused ? icon.active : icon.inactive}
            style={[focused ? activeSize : inactiveSize]}
            resizeMode="contain"
        />
    );
}

export default function TabsLayout() {
    const searchActive = useSelector((state) => state.app.searchActive);

    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: searchActive ? { display: 'none' } : {
                    position: "absolute",
                    bottom: Platform.OS === "ios" ? 0 : -1,
                    borderTopRightRadius: 50,
                    borderTopLeftRadius: 50,
                    borderTopColor: "transparent",
                    backgroundColor: "#fff",
                    paddingTop: 25,
                    paddingHorizontal: 15,
                    height: Platform.OS === "ios" ? 95 : 90,
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
                                active: { width: 64, height: 64, position: "absolute", bottom: 5 },
                                inactive: { width: 64, height: 64, position: "absolute", bottom: 5 },
                            }}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name="discount"
                options={{
                    headerTitle: "Discount",
                    tabBarIcon: ({ focused }) => <TabIcon name="discount" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    headerTitle: "Settings",
                    tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
                }}
            />
        </Tabs>
    );
}