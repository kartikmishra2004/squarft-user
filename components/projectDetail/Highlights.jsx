import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { defaultLandmarks, defaultAmenities } from "../../data/projects";

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

function LandmarkCard({ item }) {
    const iconName = item.icon || getLandmarkIcon(item.category);
    return (
        <View style={{
            flex: 1, backgroundColor: '#fff', borderRadius: 12,
            borderWidth: 1, borderColor: '#91919347',
            padding: 12, margin: 4,
        }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name={iconName} size={20} color="#646464" />
                <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 }}>
                {item.label || item.category || '—'}{' '}<Text style={{ color: '#111827', fontWeight: '400' }}>›</Text>
            </Text>
            <Text style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{item.name}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>{item.distance}</Text>
        </View>
    );
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
    const landmarks = project?.landmarks ?? defaultLandmarks;
    const amenities = project?.amenities ?? defaultAmenities;

    const allItems = showAll ? amenities : amenities.slice(0, VISIBLE_AMENITIES);
    const remaining = amenities.length - VISIBLE_AMENITIES;

    const COLS = 3;
    const totalCells = allItems.length + (!showAll && remaining > 0 ? 1 : 0);
    const totalRows = Math.ceil(totalCells / COLS);

    return (
        <View style={{ paddingBottom: 16 }}>

            <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginHorizontal: 16, marginBottom: 10, marginTop: 4 }}>
                Nearby landmarks
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 12 }}>
                {landmarks.map((item) => (
                    <View key={item.id} style={{ width: '50%' }}>
                        <LandmarkCard item={item} />
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
