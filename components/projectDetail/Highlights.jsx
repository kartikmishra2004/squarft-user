import { View, Text } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const highlights = [
    { icon: "location-outline", lib: "Ionicons", label: "Prime Location" },
    { icon: "school-outline", lib: "MCI", label: "RERA Approved" },
    { icon: "shield-checkmark-outline", lib: "Ionicons", label: "Zero Brokerage" },
    { icon: "home-outline", lib: "Ionicons", label: "Ready to Move" },
];

export default function Highlights({ project }) {
    return (
        <View className="mx-4 mb-4">
            <Text className="text-base font-bold text-gray-900 mb-3">Highlights</Text>
            <View className="flex-row flex-wrap gap-3">
                {highlights.map((h) => (
                    <View key={h.label} className="flex-row items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3 w-[47%]">
                        {h.lib === "Ionicons"
                            ? <Ionicons name={h.icon} size={16} color="#4A43EC" />
                            : <MaterialCommunityIcons name={h.icon} size={16} color="#4A43EC" />
                        }
                        <Text className="text-[12px] font-semibold text-gray-700">{h.label}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
