import { Tabs } from "expo-router";
import { Image, Platform } from "react-native";

const icons = {
    home: {
        inactive: require("../../assets/icons/tabs/home.png"),
        active: require("../../assets/icons/tabs/home-active.png"),
    },
    favourite: {
        inactive: require("../../assets/icons/tabs/fav.png"),
        active: require("../../assets/icons/tabs/fav-active.png"),
    },
    book: {
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
    return (
        <Tabs
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    borderTopRightRadius: 50,
                    borderTopLeftRadius: 50,
                    borderTopColor: "transparent",
                    backgroundColor: "#fff",
                    paddingTop: 25,
                    paddingHorizontal: 15,
                    height: Platform.OS === "ios" ? 95 : 90,
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.15,
                    shadowRadius: 3.84,
                    elevation: 5,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    headerTitle: "Home",
                    tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="favourite"
                options={{
                    headerTitle: "Favourite",
                    tabBarIcon: ({ focused }) => <TabIcon name="favourite" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="book"
                options={{
                    headerTitle: "Book",
                    tabBarIcon: ({ focused }) => (
                        <TabIcon
                            name="book"
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