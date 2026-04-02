import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FontAwesome,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  AntDesign,
  Octicons,
} from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { toggleFavourite, toggleSeen, toggleContacted, toggleRecent } from "../../store/slices/propertiesSlice";
import { currentUser } from "../../data/user";
import FilterModal from "../../components/FilterModal";
import SearchOverlay from "../../components/SearchOverlay";
import { openFilter } from "../../store/slices/filterSlice";
import { setSearchActive } from "../../store/slices/appSlice";
import { useState } from "react";
import { router } from "expo-router";
import FeaturedCard from "../../components/FeaturedCard";

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

function RecommendedCard({ item, onToggleFav, onToggleSeen, onToggleContacted, onToggleRecent }) {
  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: "/(screens)/project-detail", params: { id: item.id } })}
      activeOpacity={0.85}
      className="bg-white rounded-2xl overflow-hidden mr-3 p-2.5"
      style={{ width: 166 }}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={item.image}
          style={{ width: 144, height: 140, borderRadius: 12 }}
          resizeMode="cover"
        />
        <TouchableOpacity
          onPress={() => onToggleFav(item.id)}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: "rgba(255,255,255,0.9)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name={item.isFavourite ? "heart" : "heart-outline"}
            size={20}
            color={item.isFavourite ? "#EF4444" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>
      <View className="px-1 pt-2 pb-2">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-[12px] font-manrope-semibold text-gray-900">
            {item.type}
          </Text>
          <Text className="text-[12px] font-bold text-indigo-600">
            {item.price}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <MaterialCommunityIcons
            name="vector-square"
            size={13}
            color="#FE8A71"
          />
          <Text className="text-[11px] text-gray-400">{item.area}</Text>
          <MaterialCommunityIcons
            name="bed-outline"
            size={13}
            color="#FE8A71"
          />
          <Text className="text-[11px] text-gray-400">{item.beds}</Text>
          <MaterialCommunityIcons name="shower" size={13} color="#FE8A71" />
          <Text className="text-[11px] text-gray-400">{item.baths}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Home() {
  const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const searchActive = useSelector((state) => state.app.searchActive);
    const [searchQuery, setSearchQuery] = useState('');
     const { properties: allProperties, projectsInFocus, missed, highGrowthLocalities } = useSelector((s) => s.properties);
     const recommended = allProperties.filter((p) => p.tags.includes('recommended'));
     const featured = allProperties.filter((p) => p.tags.includes('featured'));
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
  
 

  const handleToggleFav = (id) => dispatch(toggleFavourite(id));
  const handleToggleSeen = (id) => dispatch(toggleSeen(id));
  const handleToggleContacted = (id) => dispatch(toggleContacted(id));
  const handleToggleRecent = (id) => dispatch(toggleRecent(id));

  return (
    <View className="flex-1 bg-[#F9FAFB]">
            <FilterModal />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View
          style={{
            paddingTop: Platform.OS === "ios" ? insets.top : insets.top + 7 ,
            position: "relative", 
            overflow: "hidden",
            backgroundColor: "#F9FAFB",
          }}
        >
          {/* Right blur shade */}
          <Image
            source={require("../../assets/images/blur (5).png")}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 216,
              top: 23,
              width: 241,
              height: 241,
              borderRadius: 1000,
              opacity: 1,
            }}
            //resizeMode="contain"
          />
          {/* Left blur shade */}
          <Image
            source={require("../../assets/images/blur (3).png")}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: -40,
              top: -30,
              width: 570,
              height: 360,
              opacity: 0.7,
              zIndex: -1,
            }}
            //resizeMode="contain"
          />
          {/* Header Row */}
          <View className="flex-row justify-between items-center px-5 pt-3 pb-4 mb-4">
            <View className="flex-row items-center gap-4">
              <View className="w-[46px] h-[46px] relative">
                <Image
                  source={currentUser.avatar}
                  className="w-[50px] h-[50px] rounded-full border-2 border-white"
                  resizeMode="cover"
                />
              </View>
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-[17px] font-lato-bold mt-1 text-[#3F3838]">
                    {currentUser.name}
                  </Text>
                  <MaterialIcons name="verified" size={20} color="#3AFF08" />
                </View>
                <Text className="text-[10px] font-lato-regular text-gray-400 mt-1">
                  {currentUser.joinedDate}
                </Text>
              </View>
            </View>
          </View>

          {/* Search */}
          <View className="flex-row px-5 gap-3 mb-5 ">
            <View className="flex-1 flex-row items-center bg-[#FCFCFC] rounded-xl px-4 h-[44px] gap-[8px]"  style={{ shadowColor: "#4A43EC", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.07, shadowRadius: 30, elevation: 4 }}>
              <FontAwesome name="search" size={20} color="#4A43EC" />
              <View className="w-[0.5px] self-stretch my-3 bg-[#7974E7]" />
              <TextInput
                placeholder="Search..."
                placeholderTextColor="#9CA3AF"
                underlineColorAndroid="transparent"
                className="flex-1 text-[14px] text-gray-700"
                                caretHidden
                                showSoftInputOnFocus={false}
                                onFocus={() => dispatch(setSearchActive(true))}
              />
            </View>
            <TouchableOpacity onPress={() => dispatch(openFilter())} className="flex-row items-center bg-[#4A43EC] rounded-xl px-5 h-[44px] gap-2">
              <AntDesign name="spotify" size={18} color="#7F88E5" />
              <Text className="text-white text-sm font-semibold">Filters</Text>
            </TouchableOpacity>
          </View>

          {/* Categories */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 21,
              paddingBottom: 18,
              gap: 13,
              paddingTop:10,
            }}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="items-center justify-center bg-white rounded-xl gap-2"
                style={{
                  width: 64,
                  height: 78,
                  backgroundColor: "#fff",
                  //borderRadius: 12,
                  shadowColor: "#6B7280",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 45,
                  elevation: 8,
                  
                  
                }}
              >
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={22}
                  color="#4F46E5"
                />
                <Text className="text-[9px] text-black font-inter-regular">
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recommended Properties */}
        <View style={{ position: "relative" }}>
          <Image
            source={require("../../assets/images/Ellipse 70 (2).png")}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 103,
              top: 20,
              width: 344,
              height: 287,
              opacity: 0.98,
              transform: [{ rotate: "180deg" }],

              
            }}
            resizeMode="contain"
          />
          <View className="flex-row justify-between items-center px-4 mt-2 mb-3">
            <Text className="text-[15px] font-manrope-extrabold text-gray-900">
              Recommended Properties
            </Text>
            <TouchableOpacity className="flex-row items-center">
              <Text className="text-[12px] text-indigo-500 font-manrope-bold">
                See All
              </Text>
              <Octicons name="triangle-right" size={22} color="#6C3BFF" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={recommended}
            extraData={allProperties}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 14,
              paddingBottom: 12,
              paddingTop: 4,
            }}
            renderItem={({ item }) => (
                <RecommendedCard 
                    item={item} 
                    onToggleFav={handleToggleFav}
                    onToggleSeen={handleToggleSeen}
                    onToggleContacted={handleToggleContacted}
                    onToggleRecent={handleToggleRecent}
                />
            )}
          />
        </View>

        {/* Featured Projects */}
        <View style={{ position: "relative" }}>
          <Image
            source={require("../../assets/images/Ellipse 70 (2).png")}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 103,
              top: 20,
              width: 344,
              height: 287,
              opacity: 0.58,
            }}
            resizeMode="contain"
          />
          <View className="flex-row justify-between items-center px-5 mt-1 mb-5">
            <Text className="text-[15px] font-manrope-extrabold text-gray-900">Featured Projects</Text>
            <TouchableOpacity>
              <Text className="text-[12px] text-indigo-500 font-manrope-bold">View All</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={featured}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8, gap: 8 }}
            renderItem={({ item }) => <FeaturedCard item={item} onToggleFav={handleToggleFav} />}
          />
        </View>

        {/* Cashback Banner */}
        <View className="mx-6 mt-6 mb-2 rounded-3xl overflow-hidden opacity-74" style={{ backgroundColor: "#6A5AE0", height: 115 }}>
            {/* Dark circle behind building */}
            <View style={{
                position: "absolute",
                right: -5,
                top: -32,
                width: 180,
                height: 140,
                borderRadius: 999,
                backgroundColor: "#4A43EC",
                opacity: 100,
            }} />
            {/* Text */}
            <View className="px-5 pt-3" style={{ flex: 1, justifyContent: "center" }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", lineHeight: 24 }}>GET YOUR 20%{"\n"}CASHBACK</Text>
                <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, marginTop: 6 }}>* Expired 25 Aug 2022</Text>
            </View>
            {/* Building image */}
            <Image
                source={require("../../assets/images/unsplash_RFDP7_80v5A.png")}
                style={{ position: "absolute", right: 0, bottom: 0, width: 130, height: 120 }}
                resizeMode="cover"
            />
        </View>

        {/* Project in Focus */}
        <View className="flex-row justify-between items-center px-5 mt-6 mb-6">
            <Text className="text-[15px] font-manrope-extrabold text-gray-900">Project in focus</Text>
            <TouchableOpacity>
                <Text className="text-sm text-indigo-500 font-manrope-bold">View All</Text>
            </TouchableOpacity>
        </View>

        {projectsInFocus.slice(0, 2).map((project) => (
            <TouchableOpacity
                key={project.id}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: "/(screens)/project-detail", params: { id: project.id } })}
                className="mx-6 mb-4 rounded-2xl overflow-hidden h-[200px]"
            >
                <Image source={project.image} className="w-full h-full zIndex-0" resizeMode="cover" />
                {/* Dark overlay */}
                <View className="absolute inset-0 bg-black/55" />
                {/* Price pill top right */}
                <View className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1">
                    <Text className="text-[11px] font-bold text-gray-900">{project.price}</Text>
                </View>
                {/* Text bottom left */}
                <View className="absolute bottom-4 left-4">
                    <Text className="text-[12px] font-public-bold text-[#e0733d] tracking-widest mb-1 zIndex-1">{project.tag}</Text>
                    <Text className="text-[20px] font-public-bold text-white mb-0">{project.title}</Text>
                    <Text className="text-[14px] font-public-regular text-[#CBD5E1]">{project.subtitle}</Text>
                </View>
            </TouchableOpacity>
        ))}

        {/* In case you missed */}
        <View className="px-5 mt-4 mb-3">
            <Text className="text-[15px] font-manrope-extrabold text-[#0F172A]">In case you missed</Text>
            <Text className="text-[13px] font-manrope-medium text-gray-400 mb-3 mt-0.5">{`3 Properties you liked but didn't contact`}</Text>
        </View>

        <FlatList
            data={missed}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 8, gap: 12 }}
            renderItem={({ item }) => (
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => router.push({ pathname: "/(screens)/project-detail", params: { id: item.id } })}
                    style={{ width: 300 }}
                >
                    <View
                        className="rounded-3xl overflow-hidden"
                        style={{
                            width: 300,
                            height: 200,
                            borderRadius: 24,
                            borderWidth: 2,
                            borderColor: "#E5E7EB",
                            ...cardShadow,
                        }}
                    >
                        <Image source={item.image} style={{ width: 300, height: 200 }} resizeMode="cover" />
                        {item.badge && (
                            <View className="absolute top-4 right-4 bg-white/90 rounded-full px-3 py-1">
                                <Text className="text-[11px] font-bold text-indigo-500">{item.badge}</Text>
                            </View>
                        )}
                        <TouchableOpacity
                            onPress={() => handleToggleFav(item.id)}
                            style={{
                                position: "absolute",
                                bottom: 12,
                                right: 12,
                                width: 32,
                                height: 32,
                                borderRadius: 16,
                                backgroundColor: "rgba(255,255,255,0.9)",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Ionicons
                                name={item.isFavourite ? "heart" : "heart-outline"}
                                size={20}
                                color={item.isFavourite ? "#EF4444" : "#9CA3AF"}
                            />
                        </TouchableOpacity>
                        <View className="absolute bottom-3 left-3 bg-gray-900/70 rounded-3xl px-3 py-2">
                            <Text className="text-white text-[16px] font-inter-bold">{item.priceINR}</Text>
                        </View>
                    </View>
                    <View className="px-1 pt-2.5">
                        <Text className="text-[16px] font-inter-bold text-[#0F172A]">{item.title}</Text>
                        <View className="flex-row items-center gap-1">
                            <Ionicons name="location-outline" size={12} color="#9CA3AF" />
                            <Text className="text-[13px] font-inter-regular text-gray-400">{item.location}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            )}
        />

        {/* High Growth Localities */}
        <View className="flex-row justify-between items-center px-5 mt-10 mb-5">
            <Text className="text-[15px] font-manrope-extrabold text-[#0F172A]">High growth localities in indore</Text>
            <TouchableOpacity>
                <Text className="text-sm text-indigo-500 font-manrope-bold">View All</Text>
            </TouchableOpacity>
        </View>

        {highGrowthLocalities.slice(0, 2).map((item) => (
            <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                onPress={() => router.push({ pathname: "/(screens)/project-detail", params: { id: item.id } })}
                className="mx-5 mb-3 bg-white rounded-2xl flex-row items-center border border-slate-100 px-2.5 py-3"
                style={{ minHeight: 110 }}
            >
                {/* Image with border */}
                <View className="w-[130px] h-[130px] rounded-2xl border border-indigo-100 overflow-hidden items-center justify-center">
                    <Image source={item.image} className="w-[130px] h-[130px]" resizeMode="cover" />
                    <View className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-indigo-100 items-center justify-center">
                        <MaterialCommunityIcons name="check-decagram-outline" size={16} color="#6366F1" />
                    </View>
                </View>
                {/* Right content */}
                <View className="flex-1 px-4 self-stretch justify-around">
                    <View>
                        <Text className="text-[16px] font-public-bold text-[#0F172A]">{item.title}</Text>
                        <Text className="text-[12px] font-public-regular text-gray-400">{item.location}</Text>
                        <Text className="text-[13px] font-manrope-bold text-indigo-600 mt-1">{item.priceRange}</Text>
                    </View>
                    <View className="flex-row justify-between items-center mt-2">
                        <View className="bg-slate-100 rounded-lg px-2.5 py-1">
                            <Text className="text-[11px] text-gray-800 font-public-bold">{item.bhk}</Text>
                        </View>
                        <Text className="text-[11px] text-gray-400">{item.possession}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        ))}

        {/* Like the app? Share the app */}
        <View className="mx-4 mt-10 mb-20 rounded-3xl border border-indigo-100 bg-white overflow-hidden">
            <View className="px-8 pt-6">
                <Text className="text-[18px] font-manrope-extrabold text-[#0F172A] tracking-widest">Like the app?{"\n"}Share the app</Text>
            </View>
            <Image
                source={require("../../assets/images/pana.png")}
                className="w-full h-[200px] bottom-8 left-4"
                resizeMode="contain"
            />
            <View className="flex-row gap-3 px-5 pb-6 top-[-6px]">
                <TouchableOpacity className="flex-1 border border-1.5 border-gray-500 rounded-full items-center justify-center">
                    <Text className="text-[15px] top-[-1px] font-manrope-bold text-[#0F172A]">Button</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-indigo-600 rounded-full py-3 flex-row items-center justify-center gap-2">
                    <FontAwesome6 name="arrow-up-from-bracket" size={16} color="#ffffff" />
                    <Text className="text-[15px] top-[-1px] font-manrope-bold text-white">Share</Text>
                </TouchableOpacity>
            </View>
        </View>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
