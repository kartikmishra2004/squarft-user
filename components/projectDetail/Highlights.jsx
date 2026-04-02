import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { defaultLandmarks, defaultAmenities } from "../../data/projects";

const VISIBLE_AMENITIES = 5;

function LandmarkCard({ item }) {
    return (
        <View style={{
            flex: 1, backgroundColor: '#fff', borderRadius: 12,
            borderWidth: 1, borderColor: '#F3F4F6',
            padding: 12, margin: 4,
            shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
        }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name={item.icon} size={20} color="#646464" />
                <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 2 }}>
                {item.label}{' '}<Text style={{ color: '#111827', fontWeight: '400' }}>›</Text>
            </Text>
            <Text style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{item.name}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }}>{item.distance}</Text>
        </View>
    );
}

function AmenityItem({ item, col, totalInRow, isLastRow }) {
    const showRightBorder = col < totalInRow - 1;
    const showBottomBorder = !isLastRow;
    const IconComp = item.lib === 'MCI' ? MaterialCommunityIcons : Ionicons;
    return (
        <View style={{
            width: '33.33%', alignItems: 'center',
            paddingVertical: 18, paddingHorizontal: 4,
            borderRightWidth: showRightBorder ? 0.5 : 0,
            borderBottomWidth: showBottomBorder ? 0.5 : 0,
            borderColor: '#E5E7EB',
        }}>
            <IconComp name={item.icon} size={26} color="#6200EA" style={{ marginBottom: 8 }} />
            <Text style={{ fontSize: 11, color: '#374151', textAlign: 'center', fontWeight: '500' }}>{item.label}</Text>
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
                shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
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
                            <Text style={{ fontSize: 13, color: '#6200EA', fontWeight: '700', textAlign: 'center' }}>
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
                        <Text style={{ fontSize: 13, color: '#6200EA', fontWeight: '600' }}>Show less ‹</Text>
                    </TouchableOpacity>
                )}
            </View>

        </View>
    );
}
