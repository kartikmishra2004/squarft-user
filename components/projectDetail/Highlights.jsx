import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import Constants from "expo-constants";
import { defaultLandmarks, defaultAmenities } from "../../data/projects";
import { GeocodingService } from "../../services/geocoding/GeocodingService";
import { fetchNearbyLandmarks } from "../../services/geocoding/nearbyLandmarks";

const GOOGLE_MAPS_API_KEY =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env?.GOOGLE_MAPS_API_KEY ||
    "";

let geocodingServiceInstance = null;
function getGeocodingService() {
    if (!GOOGLE_MAPS_API_KEY) return null;
    if (!geocodingServiceInstance) {
        geocodingServiceInstance = new GeocodingService({
            apiKey: GOOGLE_MAPS_API_KEY,
            maxCacheSize: 200,
            cacheTTL: 7 * 24 * 60 * 60 * 1000,
        });
    }
    return geocodingServiceInstance;
}

const VISIBLE_AMENITIES = 5;

// Map landmark category → icon name
const LANDMARK_ICON_MAP = {
    school: 'school-outline',
    hospital: 'medical-outline',
    metro: 'train-outline',
    mall: 'bag-handle-outline',
    airport: 'airplane-outline',
    park: 'leaf-outline',
    bank: 'card-outline',
    restaurant: 'restaurant-outline',
    default: 'location-outline',
};

// Map amenity category/name → icon
const AMENITY_ICON_MAP = {
    pool: { icon: 'pool', lib: 'MCI' },
    gym: { icon: 'dumbbell', lib: 'MCI' },
    parking: { icon: 'car-outline', lib: 'Ionicons' },
    security: { icon: 'shield-checkmark-outline', lib: 'Ionicons' },
    garden: { icon: 'flower-outline', lib: 'Ionicons' },
    clubhouse: { icon: 'home-group', lib: 'MCI' },
    lift: { icon: 'elevator', lib: 'MCI' },
    playground: { icon: 'basketball-outline', lib: 'Ionicons' },
    wifi: { icon: 'wifi-outline', lib: 'Ionicons' },
    default: { icon: 'star-outline', lib: 'Ionicons' },
};

function getLandmarkIcon(category) {
    if (!category) return LANDMARK_ICON_MAP.default;
    const key = category.toLowerCase();
    return LANDMARK_ICON_MAP[key] || LANDMARK_ICON_MAP.default;
}

function getAmenityIcon(name, category) {
    const search = (name || category || '').toLowerCase();
    const key = Object.keys(AMENITY_ICON_MAP).find(k => search.includes(k));
    return AMENITY_ICON_MAP[key] || AMENITY_ICON_MAP.default;
}

function LandmarkCard({ item, onPress }) {
    const iconName = item.icon || getLandmarkIcon(item.category);
    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPress}
            style={{
                flex: 1, backgroundColor: '#fff', borderRadius: 12,
                borderWidth: 1, borderColor: '#91919347',
                padding: 12, margin: 4,
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name={iconName} size={20} color="#646464" />
                <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 }}>
                {item.label || item.category || '—'}{' '}<Text style={{ color: '#111827', fontWeight: '400' }}>›</Text>
            </Text>
            <Text style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{item.name}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>{item.distance}</Text>
        </TouchableOpacity>
    );
}

function buildLandmarkAddress(landmark, project) {
    return [landmark.name || landmark.label, project?.area, project?.city]
        .filter(Boolean)
        .join(", ");
}

function AmenityItem({ item, col, totalInRow, isLastRow }) {
    const showRightBorder = col < totalInRow - 1;
    const showBottomBorder = !isLastRow;
    const { icon, lib } = item.lib ? item : getAmenityIcon(item.name, item.category);
    const IconComp = lib === 'MCI' ? MaterialCommunityIcons : Ionicons;
    return (
        <View style={{
            width: '33.33%', alignItems: 'center',
            paddingVertical: 18, paddingHorizontal: 4,
            borderRightWidth: showRightBorder ? 0.5 : 0,
            borderBottomWidth: showBottomBorder ? 0.5 : 0,
            borderColor: '#E5E7EB',
        }}>
            <IconComp name={icon} size={26} color="#4A43EC" style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 11, color: '#374151', textAlign: 'center', fontWeight: '500' }}>{item.label || item.name}</Text>
        </View>
    );
}

export default function Highlights({ project }) {
    const [showAll, setShowAll] = useState(false);
    const [googleLandmarks, setGoogleLandmarks] = useState([]);
    const [isLoadingLandmarks, setIsLoadingLandmarks] = useState(false);
    const hasBackendLandmarks = Array.isArray(project?.landmarks) && project.landmarks.length > 0;
    const amenities = project?.amenities ?? defaultAmenities;

    useEffect(() => {
        if (hasBackendLandmarks || !GOOGLE_MAPS_API_KEY) return;

        let cancelled = false;

        const loadNearbyLandmarks = async () => {
            setIsLoadingLandmarks(true);
            try {
                let latitude = project?.latitude;
                let longitude = project?.longitude;

                if (latitude == null || longitude == null) {
                    const geocodingService = getGeocodingService();
                    const address = project?.location || [project?.area, project?.city, project?.pincode].filter(Boolean).join(", ");
                    const coordinate = geocodingService && address ? await geocodingService.geocodeAddress(address) : null;
                    latitude = coordinate?.latitude;
                    longitude = coordinate?.longitude;
                }

                if (cancelled || latitude == null || longitude == null) return;

                const nearby = await fetchNearbyLandmarks({ latitude, longitude, apiKey: GOOGLE_MAPS_API_KEY });
                if (!cancelled) setGoogleLandmarks(nearby);
            } catch (error) {
                console.error("Failed to load nearby landmarks:", error?.message || error);
            } finally {
                if (!cancelled) setIsLoadingLandmarks(false);
            }
        };

        loadNearbyLandmarks();
        return () => {
            cancelled = true;
        };
    }, [hasBackendLandmarks, project?.latitude, project?.longitude, project?.location, project?.area, project?.city, project?.pincode]);

    const landmarks = hasBackendLandmarks
        ? project.landmarks
        : (googleLandmarks.length > 0 ? googleLandmarks : defaultLandmarks);

    const allItems = showAll ? amenities : amenities.slice(0, VISIBLE_AMENITIES);
    const remaining = amenities.length - VISIBLE_AMENITIES;

    const COLS = 3;
    const totalCells = allItems.length + (!showAll && remaining > 0 ? 1 : 0);
    const totalRows = Math.ceil(totalCells / COLS);

    const openLandmarkOnMap = (landmark, index) => {
        const latitude = landmark.latitude ?? landmark.lat;
        const longitude = landmark.longitude ?? landmark.lng;

        router.push({
            pathname: "/(screens)/map-view",
            params: {
                id: `landmark-${project?.id || project?.slug || "project"}-${index}`,
                name: landmark.name || landmark.label || "Landmark",
                area: project?.area || "",
                city: project?.city || "",
                pincode: project?.pincode || "",
                location: buildLandmarkAddress(landmark, project),
                latitude: latitude != null ? String(latitude) : "",
                longitude: longitude != null ? String(longitude) : "",
                isLandmark: "1",
            },
        });
    };

    return (
        <View style={{ paddingBottom: 16 }}>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 10, marginTop: 4 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
                    Nearby landmarks
                </Text>
                {isLoadingLandmarks && <ActivityIndicator size="small" color="#4A43EC" />}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12 }}>
                {landmarks.slice(0, 3).map((item, index) => (
                    <View key={item.id || index} style={{ width: '50%' }}>
                        <LandmarkCard item={item} onPress={() => openLandmarkOnMap(item, index)} />
                    </View>
                ))}
            </View>

            <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginHorizontal: 16, marginTop: 20, marginBottom: 4 }}>
                Amenities
            </Text>

            <View style={{
                marginHorizontal: 16, backgroundColor: '#fff',
                borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB',
                overflow: 'hidden',
                borderWidth:1, borderColor: '#e4dfe4ff'
            }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {allItems.map((item, index) => {
                        const col = index % COLS;
                        const row = Math.floor(index / COLS);
                        const isLastRow = row === totalRows - 1;
                        return (
                            <AmenityItem
                                key={item.id}
                                item={item}
                                col={col}
                                totalInRow={COLS}
                                isLastRow={isLastRow}
                            />
                        );
                    })}

                    {!showAll && remaining > 0 && (
                        <TouchableOpacity
                            onPress={() => setShowAll(true)}
                            style={{
                                width: '33.33%', alignItems: 'center', justifyContent: 'center',
                                paddingVertical: 18,
                            }}
                        >
                            <Text style={{ fontSize: 13, color: '#4A43EC', fontWeight: '700', textAlign: 'center' }}>
                                +{remaining} More{'\n'}amenities ›
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {showAll && (
                    <TouchableOpacity
                        onPress={() => setShowAll(false)}
                        style={{ alignItems: 'center', paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: '#E5E7EB' }}
                    >
                        <Text style={{ fontSize: 13, color: '#4A43EC', fontWeight: '600' }}>Show less ‹</Text>
                    </TouchableOpacity>
                )}
            </View>

        </View>
    );
}
