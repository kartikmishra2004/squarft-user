import { useState } from "react";
import {
    View, Text, Image, TouchableOpacity,
    ScrollView, TextInput, SafeAreaView, useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { allProjects } from "../../data/projects";
import Icon from 'react-native-vector-icons/Feather';
const mapBg = require("../../assets/images/Map_view_background.png");
const mapViewImg = require("../../assets/images/Map_view.png");

const PRICE_PINS = [
    { id: 1, label: "₹6.2 Cr", top: "22%", left: "58%" },
    { id: 2, label: "₹4.5 Cr", top: "36%", left: "10%" },
    { id: 3, label: "₹2.8 Cr", top: "54%", left: "44%", active: true },
];

const cardShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
};

function PropertyCard({ item, isFirst }) {
    return (
        <TouchableOpacity
            activeOpacity={0.92}
            onPress={() => router.push({ pathname: "/(screens)/project-detail", params: { id: item.id } })}
            style={{
                width: 278,
                height: 250,
                backgroundColor: "#fff",
                borderRadius: 20,
                overflow: "hidden",
                marginLeft: isFirst ? 20 : 12,
                ...cardShadow,
            }}
        >
            {/* Image */}
            <View style={{ position: "relative" }}>
                <Image source={mapViewImg} style={{ width: "100%", height: 150 }} resizeMode="cover" />

                {/* List View pill */}
                {isFirst && (
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{
                            position: "absolute",
                            top: 12,
                            left: "50%",
                            transform: [{ translateX: -52 }],
                            backgroundColor: "#1A1A1A",
                            borderRadius: 30,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                        }}
                    >
                        <MaterialCommunityIcons name="view-list" size={16} color="#fff" />
                        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>List View</Text>
                    </TouchableOpacity>
                )}

                {/* Fav button */}
                <TouchableOpacity
                    style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: "rgba(255,255,255,0.9)",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Ionicons name="heart-outline" size={18} color="#9CA3AF" />
                </TouchableOpacity>

                {/* TOP PI badge for non-first */}
                {!isFirst && (
                    <View style={{
                        position: "absolute", top: 0, left: 0,
                        backgroundColor: "#6C3BFF",
                        paddingHorizontal: 10, paddingVertical: 5,
                        borderBottomRightRadius: 12,
                    }}>
                        <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 }}>TOP PICK</Text>
                    </View>
                )}
            </View>

            {/* Info */}
            <View style={{ padding: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#0F172A" }}>{item.name}</Text>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#6C3BFF" }}>
                        {item.variants[0]?.priceRange?.split("–")[0]?.trim() ?? item.avgPricePerSqft}*
                    </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 }}>
                    <Ionicons name="location-outline" size={12} color="#64748B" />
                    <Text style={{ fontSize: 12, color: "#64748B" }}>{item.location}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <MaterialCommunityIcons name="bed-outline" size={14} color="#6C3BFF" />
                        <Text style={{ fontSize: 12, color: "#222223ff" }}>{item.subTypes[0]} BHK</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                        <MaterialCommunityIcons name="floor-plan" size={14} color="#6C3BFF" />
                        <Text style={{ fontSize: 12, color: "#222223ff" }}>{item.areaSqft} sqft</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function MapViewScreen() {
    const { width, height } = useWindowDimensions();
    const [search, setSearch] = useState("");

    const projects = allProjects.slice(0, 6);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#EBEBEB" }}>

            {/* Top bar */}
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingTop: 45,
                paddingBottom: 12,
                gap: 10,
                backgroundColor: "transparent",
            }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={{
                        width: 42, height: 42, borderRadius: 14,
                        backgroundColor: "#fff",
                        alignItems: "center", justifyContent: "center",
                        ...cardShadow,
                    }}
                >
                    <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
                </TouchableOpacity>

                <View style={{
                    flex: 1, flexDirection: "row", alignItems: "center",
                    backgroundColor: "#fff", borderRadius: 14,
                    paddingHorizontal: 14, height: 42, gap: 8,
                    ...cardShadow,
                }}>
                    <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search projects,"
                        placeholderTextColor="#9CA3AF"
                        style={{ flex: 1, fontSize: 14, color: "#111827" }}
                    />
                </View>

                <TouchableOpacity
                    style={{
                        width: 42, height: 42, borderRadius: 14,
                        backgroundColor: "#fff",
                        alignItems: "center", justifyContent: "center",
                        ...cardShadow,
                    }}
                >
                    <Icon name="sliders" size={20} color="#333" style={{ transform: [{ rotate: '90deg' }] }}/>
                </TouchableOpacity>
            </View>

            {/* Map area */}
            <View style={{ flex: 1, position: "relative" }}>
                <Image
                    source={mapBg}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                />

                {/* Price pins */}
                {PRICE_PINS.map((pin) => (
                    <TouchableOpacity
                        key={pin.id}
                        style={{
                            position: "absolute",
                            top: pin.top,
                            left: pin.left,
                            backgroundColor: pin.active ? "#4A43EC" : "#fff",
                            borderRadius: 30,
                            paddingHorizontal: 14,
                            paddingVertical: 7,
                            shadowColor: "#000",
                            shadowOpacity: 0.15,
                            shadowRadius: 6,
                            elevation: 4,
                        }}
                    >
                        <Text style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: pin.active ? "#fff" : "#4A43EC",
                        }}>
                            {pin.label}
                        </Text>
                    </TouchableOpacity>
                ))}

                {/* Zoom / locate controls */}
                <View style={{
                    position: "absolute",
                    right: 16,
                    top: "38%",
                    gap: 8,
                }}>
                    {[
                        { icon: "add-outline", key: "plus" },
                        { icon: "remove-outline", key: "minus" },
                        { icon: "locate-outline", key: "locate" },
                    ].map((btn) => (
                        <TouchableOpacity
                            key={btn.key}
                            style={{
                                width: 42, height: 42,
                                borderRadius: 12,
                                backgroundColor: "#fff",
                                alignItems: "center", justifyContent: "center",
                                ...cardShadow,
                                marginBottom: 2,
                            }}
                        >
                            <Ionicons name={btn.icon} size={20} color="#374151" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Cards overlay at bottom */}
                <View style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    paddingBottom: 20,
                }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 }}
                        decelerationRate="fast"
                        snapToInterval={272}
                    >
                        {projects.map((item, i) => (
                            <PropertyCard key={item.id} item={item} isFirst={i === 0} />
                        ))}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}
