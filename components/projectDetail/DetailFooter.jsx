import { View, Text, TouchableOpacity } from "react-native";

export default function DetailFooter({ onBookVisit, onCompare, paddingBottom = 40 }) {
    return (
        <View className="flex-row gap-3">
         
            <TouchableOpacity
                onPress={onBookVisit}
                className="flex-[2] bg-indigo-600 rounded-2xl py-4 items-center"
                style={{ shadowColor: "#6C3BFF", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 8 }}
            >
                <Text className="text-white text-[15px] font-manrope-semibold">Add to site visit</Text>
            </TouchableOpacity>
        </View>
    );
}