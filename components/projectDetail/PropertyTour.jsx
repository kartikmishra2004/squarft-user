import { View, Text, TouchableOpacity, Image, useWindowDimensions } from "react-native";
import { useState } from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const PERIODS = ["1Y", "3Y", "5Y"];

const GRAPH_DATA = {
    "1Y": [10, 15, 13, 20, 25, 30, 35],
    "3Y": [5, 10, 8, 18, 22, 28, 40, 50, 60],
    "5Y": [3, 6, 5, 10, 15, 20, 30, 42, 55, 70, 85],
};

const X_LABELS = {
    "1Y": ["JAN 2024", "APR 2024", "JUL 2024", "PRESENT"],
    "3Y": ["JAN 2022", "JAN 2023", "JAN 2024", "PRESENT"],
    "5Y": ["JAN 2021", "JAN 2022", "JAN 2023", "PRESENT"],
};

function MarketGraph({ period }) {
    const { width } = useWindowDimensions();
    const W = width - 80;
    const H = 120;
    const data = GRAPH_DATA[period];
    const max = Math.max(...data);
    const min = Math.min(...data);
    const pad = 8;

    const points = data.map((v, i) => ({
        x: pad + (i / (data.length - 1)) * (W - pad * 2),
        y: H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2),
    }));

    // curve using cubic bezier
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const fillPath = d + ` L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;

    return (
        <View>
            <Svg width={W} height={H}>
                <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#4A43EC" stopOpacity="0.18" />
                        <Stop offset="1" stopColor="#4A43EC" stopOpacity="0.01" />
                    </LinearGradient>
                </Defs>
                <Path d={fillPath} fill="url(#grad)" />
                <Path d={d} stroke="#4A43EC" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, width: '120%', marginLeft: 4 }}>
                {X_LABELS[period].map((l) => (
                    <Text key={l} style={{ fontSize: 9, color: 'black', fontWeight: '600' }}>{l}</Text>
                ))}
            </View>
        </View>
    );
}

const RECOMMENDED = [
    { id: 1, name: "Vijay Nagar", sub: "₹8,500/sq.ft.", change: "+12.4%" },
    { id: 2, name: "Vijay Nagar", sub: "₹8,500/sq.ft.", change: "+12.4%" },
    { id: 3, name: "Vijay Nagar", sub: "₹8,500/sq.ft.", change: "+12.4%" },
    { id: 4, name: "Vijay Nagar", sub: "₹8,500/sq.ft.", change: "+12.4%" },
];

function MiniGraph() {
    const W = 60;
    const H = 28;
    const pts = [
        { x: 0, y: 20 }, { x: 12, y: 16 }, { x: 24, y: 18 },
        { x: 36, y: 10 }, { x: 48, y: 6 }, { x: 60, y: 2 },
    ];
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
        const p = pts[i - 1], c = pts[i];
        const cpx = (p.x + c.x) / 2;
        d += ` C ${cpx} ${p.y}, ${cpx} ${c.y}, ${c.x} ${c.y}`;
    }
    return (
        <Svg width={W} height={H}>
            <Path d={d} stroke="#873600" strokeWidth="2" fill="none" strokeLinecap="round" />
        </Svg>
    );
}

export default function PropertyTour({ project }) {
    const [period, setPeriod] = useState("3Y");

    return (
        <View style={{ paddingBottom: 16 }}>

            {/* Price Trajectory Card */}

            <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View>
                       
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                            {project.location?.split(',')[0] ?? 'Location'}
                        </Text>
                      
                        <Text style={{ fontSize: 10, color: '#111827', fontWeight: '600', letterSpacing: 1, marginTop: 4 }}>
                            3 YEAR PRICE TRAJECTORY
                        </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                     
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#5308E7' }}>
                            ₹8,500 <Text style={{ fontSize: 12, color: 'black', fontWeight: '400' }}>/sq.ft.</Text>
                        </Text>
                       
                        <View style={{ backgroundColor: '#FFDBCC', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6 }}>
                            <Text style={{ fontSize: 14, color: '#873600', fontWeight: '700' }}>+12.4%</Text>
                        </View>
                    </View>
                </View>

                {/* Period Toggle (Outside the card) */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                    {PERIODS.map((p) => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => setPeriod(p)}
                            style={{
                                width: 50,
                                height: 32,
                                borderRadius: 8,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: period === p ? '#4A43EC' : '#E9E7EB',
                                shadowColor: period === p ? '#4A43EC' : 'transparent',
                                shadowOpacity: 0.8,
                                shadowRadius: 4,
                                elevation: period === p ? 2 : 0
                            }}
                        >
                            <Text style={{ fontSize: 12, fontWeight: '700', color: period === p ? '#fff' : '#6B7280',  }}>
                                {p}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* 2. Market Health & Graph Card  */}
            <View style={{
                marginHorizontal: 30,
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 20,
                borderWidth: 0,
                borderColor: '#F3F4F6',
                shadowColor: '#514d4dff',
                elevation: 2,
                marginBottom: 25
            }}>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
                    <View>
                        <Text style={{ fontSize: 10, color: 'black', fontWeight: '700', letterSpacing: 0.5 }}>MARKET HEALTH</Text>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: '#B45309', marginTop: 4 }}>Strong Appreciation</Text>
                    </View>
                    <TouchableOpacity style={{ marginBottom: 20 }}>
                        <MaterialCommunityIcons name="dots-horizontal" size={24} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>
                <View style={{ width: '85%', alignSelf: 'center', marginRight: 60 }}>
                    <MarketGraph period={period} />
                </View>
            </View>

            {/* Recommended Properties */}
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginHorizontal: 16, marginBottom: 25 }}>Recommended Property</Text>
            <View style={{ marginHorizontal: 24,   marginBottom: 26  }}>
                {RECOMMENDED.map((item) => (
                    <View
                        key={item.id}
                        style={{
                            backgroundColor: '#fff',
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: '#F3F4F6',
                            marginBottom: 15, 
                            paddingHorizontal: 14,
                            paddingVertical: 18,
                            shadowRadius: 8,
                            elevation: 0
                        }}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>{item.name}</Text>
                                <Text style={{ fontSize: 11, color: '#111827', marginTop: 2 }}>{item.sub}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                               
                                <MiniGraph />

                                <View style={{  borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                                    <Text style={{ fontSize: 12, color: '#873600', fontWeight: '700' }}>{item.change}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </View>

            {/* Market Activity */}
            <View style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#d7dde8ff', padding: 18 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '600', letterSpacing: 0.5 }}>MARKET ACTIVITY</Text>
                    <View style={{ backgroundColor: '#e2d6fbff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                        <Text style={{ fontSize: 10, color: '#4A43EC', fontWeight: '700' }}>High Interest</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Ionicons name="eye-outline" size={16} color="#4A43EC" />
                    <Text style={{ fontSize: 13, color: '#374151' }}>23 people viewed today</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Ionicons name="person-outline" size={16} color="#F97316" />
                    <Text style={{ fontSize: 13, color: '#374151' }}>4 buyers contacted seller</Text>
                </View>
                <TouchableOpacity style={{ backgroundColor: '#4A43EC', borderRadius: 14, paddingVertical: 12, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>Schedule Site Visit</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}
