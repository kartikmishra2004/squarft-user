import { View, Text, TextInput, ScrollView, TouchableOpacity, Image, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome, Ionicons, MaterialCommunityIcons, MaterialIcons, AntDesign, Octicons } from "@expo/vector-icons";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { recommendedProperties, featuredProperties } from "../../data/properties";
import { currentUser } from "../../data/user";
import FilterModal from "../../components/FilterModal";
import SearchOverlay from "../../components/SearchOverlay";
import { openFilter } from "../../store/slices/filterSlice";
import { setSearchActive } from "../../store/slices/appSlice";

const CATEGORIES = [
    { id: "1", label: "Flat", icon: "office-building" },
    { id: "2", label: "Apartment", icon: "magnify" },
    { id: "3", label: "Commercial", icon: "sofa" },
    { id: "4", label: "1 Rk", icon: "domain" },
    { id: "5", label: "Plot", icon: "store" },
];

const cardShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 0.5,
};

function RecommendedCard({ item }) {
    return (
        <View
            className="bg-white rounded-3xl overflow-hidden mr-3 p-3"
            style={{ width: 171, ...cardShadow }}
        >
            <Image source={item.image} style={{ width: 150, height: 148, borderRadius: 20 }} resizeMode="cover" />
            <View className="px-1 pt-3 pb-3">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-[12px] font-manrope-semibold text-gray-900">{item.type}</Text>
                    <Text className="text-[12px] font-bold text-indigo-600">{item.price}</Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons name="vector-square" size={13} color="#F97316" />
                    <Text className="text-[11px] text-gray-400">{item.area}</Text>
                    <MaterialCommunityIcons name="bed-outline" size={13} color="#F97316" />
                    <Text className="text-[11px] text-gray-400">{item.beds}</Text>
                    <MaterialCommunityIcons name="shower" size={13} color="#F97316" />
                    <Text className="text-[11px] text-gray-400">{item.baths}</Text>
                </View>
            </View>
        </View>
    );
}

function FeaturedCard({ item }) {
    return (
        <View className="w-[220px] bg-white rounded-2xl overflow-hidden mr-3.5" style={cardShadow}>
            <View className="relative">
                <Image source={item.image} className="w-full h-[160px]" resizeMode="cover" />
                <View className="absolute top-2.5 left-2.5 bg-indigo-600 rounded-md px-2 py-0.5">
                    <Text className="text-white text-[10px] font-bold">FEATURED</Text>
                </View>
            </View>
            <View className="p-3">
                <Text className="text-[15px] font-bold text-gray-900 mb-0.5">{item.title}</Text>
                <Text className="text-xs text-gray-400 mb-1">{item.location}</Text>
                <Text className="text-[13px] font-semibold text-gray-700">{item.priceINR}</Text>
            </View>
        </View>
    );
}

export default function Home() {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const searchActive = useSelector((state) => state.app.searchActive);
    const [searchQuery, setSearchQuery] = useState('');

    if (searchActive) {
        return (
            <>
                <FilterModal />
                <SearchOverlay
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onClose={() => { dispatch(setSearchActive(false)); setSearchQuery(''); }}
                    insets={insets}
                />
            </>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 pb-[100px]">
            <FilterModal />
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header */}
                <View style={{ paddingTop: insets.top + 10, position: "relative", overflow: "hidden", backgroundColor: "#F9FAFB" }}>
                    {/* Right blur shade */}
                    <Image
                        source={require("../../assets/images/blur (5).png")}
                        pointerEvents="none"
                        style={{ position: "absolute", left: 216, top: 23, width: 241, height: 241, borderRadius: 1000, opacity: 1 }}
                    //resizeMode="contain"
                    />
                    {/* Left blur shade */}
                    <Image
                        source={require("../../assets/images/blur (4).png")}
                        pointerEvents="none"
                        style={{ position: "absolute", left: -40, top: -30, width: 520, height: 360, borderRadius: 9999, opacity: 0.99 }}
                    //resizeMode="contain"
                    />
                    {/* Header Row */}
                    <View className="flex-row justify-between items-center px-5 pt-3 pb-4 mb-5">
                        <View className="flex-row items-center gap-6">
                            <View className="w-[46px] h-[46px] relative">
                                <Image
                                    source={currentUser.avatar}
                                    className="w-[54px] h-[54px] rounded-full border-2 border-white"
                                    resizeMode="cover"
                                />

                            </View>
                            <View>
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-[17px] font-lato-bold mt-1 text-[#3F3838]">{currentUser.name}</Text>
                                    <MaterialIcons name="verified" size={20} color="#3AFF08" />
                                </View>
                                <Text className="text-[12px] font-lato-regular text-gray-400 mt-1">{currentUser.joinedDate}</Text>
                            </View>
                        </View>

                    </View>

                    {/* Search */}
                    <View className="flex-row px-5 gap-3 mb-8">
                        <View className="flex-1 flex-row items-center bg-[#FCFCFC] rounded-2xl px-4 h-[46px] gap-[8px]" >
                            <FontAwesome name="search" size={20} color="#4A43EC" />
                            <View className="w-[0.5px] self-stretch my-3 bg-[#7974E7]" />
                            <TextInput
                                placeholder="Search..."
                                placeholderTextColor="#9CA3AF"
                                className="flex-1 text-base text-gray-700"
                                onFocus={() => dispatch(setSearchActive(true))}
                            />
                        </View>
                        <TouchableOpacity onPress={() => dispatch(openFilter())} className="flex-row items-center bg-[#4A43EC] rounded-2xl px-5 h-[46px] gap-2">
                            <AntDesign name="spotify" size={18} color="#7F88E5" />
                            <Text className="text-white text-sm font-semibold">Filters</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Categories */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, gap: 12 }}
                    >
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.id}
                                className="items-center justify-center px-1 bg-white rounded-xl gap-4"
                                style={{
                                    width: 76, height: 92,
                                    shadowColor: "#000000",
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 19.7,
                                    elevation: 1,
                                }}
                            >
                                <MaterialCommunityIcons name={cat.icon} size={26} color="#4F46E5" />
                                <Text className="text-[10.5px] text-black font-inter-regular">{cat.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Recommended Properties */}
                <View style={{ position: "relative" }}>
                    <Image
                        source={require("../../assets/images/Ellipse 70 (1).png")}
                        pointerEvents="none"
                        style={{
                            position: "absolute",
                            left: 103,
                            top: 20,
                            width: 344,
                            height: 267,
                            opacity: 0.98,
                            transform: [{ rotate: "180deg" }],

                            zIndex: 1,
                        }}
                    //resizeMode="contain"
                    />
                    <View className="flex-row justify-between items-center px-4 mt-4 mb-4">
                        <Text className="text-lg font-manrope-extrabold text-gray-900">Recommended Properties</Text>
                        <TouchableOpacity className="flex-row items-center">
                            <Text className="text-sm text-indigo-500 font-manrope-bold">See All</Text>
                            <Octicons name="triangle-right" size={22} color="#6C3BFF" />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={recommendedProperties}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 12, paddingTop: 4 }}
                        renderItem={({ item }) => <RecommendedCard item={item} />}
                    />
                </View>

                {/* Featured Projects */}
                <View className="flex-row justify-between items-center px-5 mt-4 mb-3">
                    <Text className="text-base font-bold text-gray-900">Featured Projects</Text>
                    <TouchableOpacity>
                        <Text className="text-sm text-indigo-500 font-medium">View All</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={featuredProperties}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8 }}
                    renderItem={({ item }) => <FeaturedCard item={item} />}
                />

                <View className="h-6" />
            </ScrollView>
        </View>
    );
}
