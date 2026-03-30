import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PropertyTour({ project }) {
    return (
        <View className="mx-4 mb-4">
            <Text className="text-base font-bold text-gray-900 mb-3">Property Tour</Text>
            <TouchableOpacity className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-8 items-center justify-center gap-2">
                <Ionicons name="play-circle-outline" size={48} color="#4A43EC" />
                <Text className="text-sm font-bold text-indigo-600 mt-1">Watch Virtual Tour</Text>
                <Text className="text-[11px] text-gray-400">{project.name}</Text>
            </TouchableOpacity>
        </View>
    );
}
