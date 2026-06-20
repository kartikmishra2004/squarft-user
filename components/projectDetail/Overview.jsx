import { View, Text, ScrollView, Image, TouchableOpacity, Dimensions, ImageBackground } from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { router } from "expo-router";
import { allProjects } from "../../data/projects";
import FeaturedCard from "../FeaturedCard";
import { getResaleByProject } from "../../data/resaleProperties";
import BuilderModal from "./BuilderModal";

import PropertyDetailModal from "./PropertyDetailModal";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.55;
const rectangle = require("../../assets/images/Rectangle 5183.png");

function formatCompactPrice(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) return null;

    if (amount >= 10000000) {
        const crores = amount / 10000000;
        return `\u20B9${Number.isInteger(crores) ? crores.toFixed(0) : crores.toFixed(1)}Cr`;
    }

    if (amount >= 100000) {
        const lakhs = amount / 100000;
        return `\u20B9${Number.isInteger(lakhs) ? lakhs.toFixed(0) : lakhs.toFixed(1)}L`;
    }

    return `\u20B9${amount.toLocaleString('en-IN')}`;
}

function getImageSource(image, fallback) {
    if (typeof image === 'string' && image) return { uri: image };
    return image || fallback;
}

function getVariantPrice(variant) {
    if (variant.priceRange) return variant.priceRange.split(/\u2013|â€“|-/)[0].trim();
    return formatCompactPrice(variant.price ?? variant.base_price ?? variant.price_from) || "\u2014";
}

function getVariantArea(variant, project) {
    return variant.area || (variant.area_sqft ? `${variant.area_sqft} sqft` : null) || (project.areaSqft ? `${project.areaSqft} sqft` : "\u2014");
}



const cardShadow = {
    shadowColor: "#6B7280",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
};

export default function Overview({ project }) {
    const [builderModalVisible, setBuilderModalVisible] = useState(false);
    const [propertyDetailVisible, setPropertyDetailVisible] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        if (project?.reraId) {
            await Clipboard.setStringAsync(project.reraId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    return (
        <View>

            {/* Variants horizontal scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 8 }}
                className="mb-4 mt-4"
            >
                {(project.variants || project.floorPlans || []).map((v, i) => (
                    <View
                        key={i}
                        style={{ width: CARD_WIDTH, ...cardShadow }}
                        className="bg-white rounded-3xl overflow-hidden border border-gray-100"
                    >
                        <Image
                            source={getImageSource(v.image, project.imageMain)}
                            style={{ width: "100%", height: 140 }}
                            resizeMode="cover"
                        />
                        <View className="p-3">
                            <View className="flex-row items-center justify-between mb-1">
                                <Text className="text-[13px] font-manrope-bold text-[#0F172A]">{v.type || v.title}</Text>
                                <Text className="text-[16px] font-manrope-bold text-[#4A43EC]">
                                    {getVariantPrice(v)}
                                </Text>
                            </View>
                            <View className="flex-row items-center gap-2 mb-5 px-0">
                                <MaterialCommunityIcons name="floor-plan" size={13} color="#9CA3AF" />
                                <Text className="text-[12px] font-public-regular text-[#64748B]">{getVariantArea(v, project)} </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setSelectedVariant(v);
                                    setPropertyDetailVisible(true);
                                }}
                                className="bg-[#6C3BFF]/5 border border-[#dacff9] rounded-2xl mx-2 py-3 mb-1 items-center"
                            >
                                <Text className="text-[12px] font-public-bold text-[#4A43EC] tracking-widest">VIEW DETAIL</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Posted by */}
            <View className="mx-6 mb-7 bg-white mt-5 rounded-2xl p-4 flex-row items-center justify-between" style={cardShadow}>
                <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                        <Image source={project.builderLogo || project.imageMain} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <View className="flex-1 pr-2">
                        <Text className="text-[11px] text-gray-400 ">Posted by</Text>
                        <Text className="text-[14px] font-manrope-extrabold text-gray-900" numberOfLines={1}>{project.builder}</Text>
                        <TouchableOpacity>
                            <Text className="text-[11px] font-semibold text-indigo-600 mt-0.5">See Developer Profile →</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <TouchableOpacity onPress={() => setBuilderModalVisible(true)} className="border border-indigo-500 rounded-xl px-4 py-2.5 ml-3">
                    <Text className="text-[12px] font-manrope-bold text-indigo-600">View Details</Text>
                </TouchableOpacity>
            </View>

            <BuilderModal
                visible={builderModalVisible}
                onClose={() => setBuilderModalVisible(false)}
                project={project}
            />


            <PropertyDetailModal
                visible={propertyDetailVisible}
                onClose={() => setPropertyDetailVisible(false)}
                project={project}
                variant={selectedVariant}
            />

            {/* Other details */}
            <Text className="text-[15px] font-manrope-bold text-gray-900 mx-5 mb-6">Other details</Text>
            <View className="mx-6 mb-5 bg-white rounded-2xl p-4" style={cardShadow}>
                <View className="flex-row mb-8">
                    <View className="flex-1">
                        <Text className="text-[12px] font-manrope-regular text-[#6B7280] mb-1">Launched in</Text>
                        <Text className="text-[14px] font-bold text-gray-900">{project.launchedIn ?? "—"}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-[12px] font-manrope-regular text-[#6B7280] mb-1">Units</Text>
                        <Text className="text-[14px] font-manrope-medium pl-1 text-[#1A1A1A]">{project.units ?? "—"}</Text>
                    </View>
                </View>
                {project.reraId && (
                    <View>

                        <Text className="text-[12px] font-manrope-regular text-[#6B7280] mb-1">RERA ID</Text>
                       <View className="flex-row items-center gap-3">
    <Text className="text-[14px] font-manrope-medium text-[#1A1A1A]">
        {project?.reraId || "N/A"}
    </Text>
    <TouchableOpacity onPress={handleCopy} activeOpacity={0.7}>
        <MaterialCommunityIcons 
            name={copied ? "check" : "content-copy"}
            size={18} 
            color={copied ? "#22C55E" : "#9CA3AF"} // Turns green when successfully copied
        />
    </TouchableOpacity>
</View>
                    </View>
                )}
            </View>
            {/* About card */}
            <View className="mx-6 mb-3 mt-4 bg-white rounded-2xl p-4" style={cardShadow}>
                <Text className="text-[15px] font-manrope-bold text-[#1A1A1A] mt-1 mb-3">About {project.name}</Text>
                {(project.description
                    ? [project.description]
                    : [
                        `Exclusive luxury residency located in ${project.location} with lush green surroundings.`,
                        `Designed with sustainable architecture and world-class amenities by ${project.builder}.`,
                    ]
                ).map((point, i) => (
                    <View key={i} className="flex-row gap-2 mb-2">
                        <Text className="text-[#5E23DC] text-[18px] -top-[1px]">•</Text>
                        <Text className="text-[12px] font-manrope-regular text-[#4B5563] flex-1 leading-6 mb-1">{point}</Text>
                    </View>
                ))}
                <TouchableOpacity className="mt-1">
                    <Text className="text-[14px] font-manrope-semibold text-[#5E23DC] mb-2">Read more →</Text>
                </TouchableOpacity>
            </View>

            {/* Brochure download */}

            <TouchableOpacity style={{ backgroundColor: "#6C3BFF2A", borderColor: "#6C3BFF1A" }} className=" mx-6 mb-6 mt-5 border rounded-2xl p-4 flex-row items-center gap-3">
                <View className="w-16 h-16 bg-indigo-600 rounded-2xl items-center justify-center">
                    <MaterialIcons name="picture-as-pdf" size={26} color="#fff" />
                </View>
                <View className="flex-1">
                    <Text className="text-[15px] font-public-bold text-gray-900">Project Brochure</Text>
                    <Text className="text-[11px] font-public-regular text-[#64748B] mt-0.5">PDF • 4.5 MB</Text>
                </View>
                <Text className="text-[12px] font-public-bold text-[#4A43EC] tracking-wide">DOWNLOAD</Text>
            </TouchableOpacity>

            {/* Resale properties */}
            <ImageBackground
                source={rectangle}
                className="mt-6 mb-12 w-[430px] h-[380px]"
                resizeMode="stretch"
            >
                <Text className="text-[12px] font-bold text-gray-900 pt-2 pl-16 mb-6 pb-1">Resale properties in same project</Text>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, gap: 14, paddingTop: 44, paddingBottom: 15, marginBottom: 12 }}
                >
                    {(project.resaleProperties?.length > 0
                        ? project.resaleProperties.map(r => ({
                            id: r.id,
                            title: r.title,
                            price_from: r.base_price || r.price_from,
                            price_to: r.price_to,
                            image: getImageSource(r.cover_image || r.cover_image_url || r.image, project.imageMain),
                            location: `${r.area}, ${r.city}`,
                        }))
                        : getResaleByProject(project.id)
                    ).map((item) => (
                        <FeaturedCard key={item.id} item={item} showBookVisit />
                    ))}
                </ScrollView>
            </ImageBackground>

            {/* Recommended Property */}
            <View className="mb-10">
                <View className="flex-row items-center justify-between mx-4 mb-7">
                    <Text className="text-[15px] font-manrope-bold text-gray-900">Recommended Property</Text>
                    <TouchableOpacity><Text className="text-[12px] font-manrope-semibold text-[#4A43EC]">View All</Text></TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}>
                    {allProjects.filter((p) => p.tags.includes("recommended") && p.id !== project.id).slice(0, 6).map((item, i) => (
                        <View key={item.id} className="bg-white rounded-2xl overflow-hidden mb-2" style={{ width: 200, ...cardShadow }}>
                            <View>
                                <Image source={item.imageMain} style={{ width: "100%", height: 120 }} resizeMode="cover" />
                                {i === 0 && (
                                    <View className="absolute top-3 left-3 bg-green-500 px-2.5 py-1 rounded-full">
                                        <Text className="text-white text-[10px] font-bold">NEW</Text>
                                    </View>
                                )}
                            </View>
                            <View className="p-3">
                                <Text className="text-[13px] font-inter-bold text-gray-500 mb-1">{item.variants[0]?.priceRange ?? item.avgPricePerSqft}</Text>
                                <Text className="text-[14px] font-inter-bold text-gray-900 mb-0.5" numberOfLines={1}>{item.name}</Text>
                                <Text className="text-[10px] font-inter-regular text-gray-400 mb-0.5">{item.location}</Text>
                                <Text className="text-[10px] text-gray-400">{item.subTypes.join(", ")} BHK</Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            </View>

            {/* Similar Property */}
            <View className="mb-20">
                <View className="flex-row items-center justify-between mx-4 mb-8">
                    <Text className="text-[15px] font-manrope-bold text-gray-900">Similar Property</Text>
                    <TouchableOpacity><Text className="text-[13px] font-manrope-semibold text-indigo-600">Clear All</Text></TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 15 }}>
                    {(project.similarProperties?.length > 0
                        ? project.similarProperties.map(p => ({
                            id: p.id,
                            slug: p.slug,
                            name: p.name || p.title,
                            imageMain: getImageSource(p.cover_image_url || p.cover_image || p.image, project.imageMain),
                            location: `${p.area || ''}, ${p.city || ''}`.replace(/^,\s*/, ''),
                            price_from: p.price_from || p.base_price,
                            price_to: p.price_to,
                        }))
                        : allProjects.filter((p) => p.id !== project.id).slice(0, 5)
                    ).map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            onPress={() => {
                                if (item.slug) {
                                    router.push({ pathname: '/(screens)/project-detail', params: { id: item.id, slug: item.slug } });
                                }
                            }}
                            disabled={!item.slug}
                            className="bg-white rounded-2xl overflow-hidden mb-2"
                            style={{ width: 180, ...cardShadow }}
                        >
                            <Image source={item.imageMain} style={{ width: "100%", height: 120 }} resizeMode="cover" />
                            <View className="p-3">
                                <Text className="text-[13px] font-inter-bold text-gray-900 mb-0.5" numberOfLines={1}>{item.name}</Text>
                                <Text className="text-[12px] font-inter-bold text-indigo-600 mb-0.5">
                                    {item.price_from
                                        ? `${formatCompactPrice(item.price_from)}${item.price_to && item.price_to !== item.price_from ? ` \u2013 ${formatCompactPrice(item.price_to)}` : ''}`
                                        : item.variants?.[0]?.priceRange ?? item.avgPricePerSqft ?? '\u2014'}
                                </Text>
                                <View className="flex-row items-center gap-1">
                                    <MaterialCommunityIcons name="map-marker-outline" size={11} color="#9CA3AF" />
                                    <Text className="text-[10px] font-inter-regular text-gray-400" numberOfLines={1}>{item.location}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}
