import { Tabs } from "expo-router";

export default function TabsLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="home" options={{ headerTitle: "Home" }} />
            <Tabs.Screen name="journey" options={{ headerTitle: "Journey" }} />
            <Tabs.Screen name="properties" options={{ headerTitle: "Properties" }} />
            <Tabs.Screen name="profile" options={{ headerTitle: "Profile" }} />
        </Tabs>
    );
}