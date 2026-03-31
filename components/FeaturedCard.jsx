import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const cardShadow = {
    shadowColor: "#6B7280",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
};

// Works with both properties (item.image/title/priceINR) and projects (item.imageMain/name/variants)
export default function FeaturedCard({ item, onToggleFav, showBookVisit = false }) {
    const image = item.image ?? item.imageMain;
    const title = item.title ?? item.name;
    const price = item.priceINR ?? item.variants?.[0]?.priceRange ?? item.avgPricePerSqft;

    return (
        <TouchableOpacity
            onPress={() => router.push({ pathname: "/(screens)/project-detail", params: { id: item.id } })}
            activeOpacity={0.85}
            className="w-[278px] bg-white rounded-2xl overflow-hidden mr-3.5"
            style={cardShadow}
        >
            <View className="relative">
                <Image source={image} className="w-[278px] h-[150px]" resizeMode="cover" />
                <View className="absolute top-4 left-4 bg-[#6C3BFF] px-3 py-1.5 rounded-full">
                    <Text className="text-white font-inter-bold text-[10px]">FEATURED</Text>
                </View>
                {onToggleFav && (
                    <TouchableOpacity
                        onPress={() => onToggleFav(item.id)}
                        style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" }}
                    >
                        <Ionicons
                            name={item.isFavourite ? "heart" : "heart-outline"}
                            size={20}
                            color={item.isFavourite ? "#EF4444" : "#9CA3AF"}
                        />
                    </TouchableOpacity>
                )}
            </View>
            <View className="px-4 py-2">
                <Text className="text-[15px] font-inter-bold text-[#1F2937] mb-0.5">{title}</Text>
                <Text className="text-[12px] font-inter-regular text-[#6B7280] mb-2">{item.location}</Text>
                <View className="flex-row items-center justify-between">
                    <Text className="text-[14px] font-inter-bold text-[#111827]">{price}</Text>
                    {showBookVisit && (
                        <TouchableOpacity className="bg-indigo-50 px-3 py-1.5 rounded-full">
                            <Text className="text-[11px] font-semibold text-indigo-600">Book Site visit</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}
