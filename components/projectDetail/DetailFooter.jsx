import { View, Text, TouchableOpacity } from "react-native";

export default function DetailFooter({ onBookVisit, onCompare, paddingBottom = 14 }) {
    return (
        <View className="flex-row gap-3">
            <TouchableOpacity
                onPress={onCompare}
                className="border border-[#4A43EC] px-10 rounded-2xl py-3 items-center"
            >
                <Text className="text-[#4A43EC] font-manrope-semibold text-[15px]">Compare</Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={onBookVisit}
                className="flex-[2] bg-indigo-600 rounded-2xl py-4 items-center"
                style={{ shadowColor: "#6C3BFF", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 8 }}
            >
                <Text className="text-white text-[15px] font-manrope-semibold">Book Site Visit</Text>
            </TouchableOpacity>
        </View>
    );
}
