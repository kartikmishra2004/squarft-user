import { View, Text, TouchableOpacity, Image, useWindowDimensions, ActivityIndicator } from "react-native";
import { useState, useEffect, useMemo } from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { propertyApi } from "../../services/propertyApi";

const PERIODS = ["1Y", "3Y", "5Y"];

// Generate X labels dynamically based on data or fallback
const generateXLabels = (chartData, period) => {
    if (chartData && chartData.length > 0) {
        // Use actual data points - take first, middle points, and last
        const dataLength = chartData.length;
        if (dataLength <= 4) {
            return chartData.map(d => d.month);
        }
        // Return first, evenly spaced middle points, and "PRESENT"
        const indices = [0, Math.floor(dataLength / 3), Math.floor(2 * dataLength / 3), dataLength - 1];
        return indices.map((i, idx) => idx === indices.length - 1 ? 'PRESENT' : chartData[i].month);
    }

    // Fallback static labels
    const labels = {
        "1Y": ["JAN 2024", "APR 2024", "JUL 2024", "PRESENT"],
        "3Y": ["JAN 2022", "JAN 2023", "JAN 2024", "PRESENT"],
        "5Y": ["JAN 2021", "JAN 2022", "JAN 2023", "PRESENT"],
    };
    return labels[period] || labels["3Y"];
};

function MarketGraph({ chartData, period }) {
    const { width } = useWindowDimensions();
    const W = width - 80;
    const H = 120;

    // Use API data if available, otherwise use empty array
    const data = useMemo(() => {
        if (!chartData || chartData.length === 0) return [];
        return chartData.map(d => d.price_per_sqft);
    }, [chartData]);

    if (data.length === 0) {
        return (
            <View style={{ height: H, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#9CA3AF' }}>No chart data available</Text>
            </View>
        );
    }

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
    const xLabels = generateXLabels(chartData, period);

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
                {xLabels.map((l, idx) => (
                    <Text key={`${l}-${idx}`} style={{ fontSize: 9, color: 'black', fontWeight: '600' }}>{l}</Text>
                ))}
            </View>
        </View>
    );
}

function MiniGraph({ data }) {
    const W = 60;
    const H = 28;

    // Use mini chart data if available
    if (!data || data.length === 0) {
        return <View style={{ width: W, height: H }} />;
    }

    // Normalize data to fit the mini graph
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const pts = data.map((val, i) => ({
        x: (i / (data.length - 1)) * W,
        y: H - ((val - min) / range) * (H - 4) - 2,
    }));

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
    const [trajectoryData, setTrajectoryData] = useState(null);
    const [recommendedProjects, setRecommendedProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recommendedLoading, setRecommendedLoading] = useState(true);
    
    // Get token from Redux store
    const { token } = useSelector((state) => state.auth);

    // Fetch price trajectory data when period or project changes
    useEffect(() => {
        const fetchTrajectory = async () => {
            if (!project?.slug && !project?.id) return;
            if (!token) {
                console.warn('No token available for price trajectory');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const slug = project.slug || project.id;
                const response = await propertyApi.getPriceTrajectory(token, slug, { period });
                if (response.success && response.data) {
                    setTrajectoryData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch price trajectory:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrajectory();
    }, [project, period, token]);

    // Fetch recommended projects
    useEffect(() => {
        const fetchRecommended = async () => {
            if (!token) {
                console.warn('No token available for recommended projects');
                setRecommendedLoading(false);
                return;
            }

            setRecommendedLoading(true);
            try {
                const params = {};
                if (project?.city) params.city = project.city;

                const response = await propertyApi.getRecommendedProjectsByAppreciation(token, params);
                if (response.success && response.data) {
                    setRecommendedProjects(response.data.slice(0, 4)); // Top 4
                }
            } catch (error) {
                console.error('Failed to fetch recommended projects:', error);
            } finally {
                setRecommendedLoading(false);
            }
        };

        fetchRecommended();
    }, [project, token]);

    const locationLabel = trajectoryData?.location || project?.location?.split(',')[0] || 'Location';
    const currentPriceFormatted = trajectoryData?.current_price_formatted || '₹8,500/sq.ft.';
    const appreciationLabel = trajectoryData?.appreciation_label || '+12.4%';
    const marketHealth = trajectoryData?.market_health || 'Strong Appreciation';
    const periodLabel = period === '1Y' ? '1 YEAR' : period === '3Y' ? '3 YEAR' : '5 YEAR';

    // Market health color based on status
    const getMarketHealthColor = (health) => {
        if (!health) return '#B45309';
        if (health.includes('Strong')) return '#B45309'; // Orange
        if (health.includes('Moderate')) return '#059669'; // Green
        if (health.includes('Stable')) return '#3B82F6'; // Blue
        return '#DC2626'; // Red for "Under Pressure"
    };

    return (
        <View style={{ paddingBottom: 16 }}>

            {/* Price Trajectory Card */}

            <View style={{ marginHorizontal: 16, marginBottom: 20 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <View>
                       
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#111827' }}>
                            {locationLabel}
                        </Text>
                      
                        <Text style={{ fontSize: 10, color: '#111827', fontWeight: '600', letterSpacing: 1, marginTop: 4 }}>
                            {periodLabel} PRICE TRAJECTORY
                        </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                        {loading ? (
                            <ActivityIndicator size="small" color="#5308E7" />
                        ) : (
                            <>
                                <Text style={{ fontSize: 18, fontWeight: '700', color: '#5308E7' }}>
                                    {currentPriceFormatted.split('/')[0]} <Text style={{ fontSize: 12, color: 'black', fontWeight: '400' }}>/sq.ft.</Text>
                                </Text>
                            
                                <View style={{ backgroundColor: '#FFDBCC', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6 }}>
                                    <Text style={{ fontSize: 14, color: '#873600', fontWeight: '700' }}>{appreciationLabel}</Text>
                                </View>
                            </>
                        )}
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
                        {loading ? (
                            <ActivityIndicator size="small" color="#B45309" style={{ marginTop: 4 }} />
                        ) : (
                            <Text style={{ fontSize: 15, fontWeight: '700', color: getMarketHealthColor(marketHealth), marginTop: 4 }}>
                                {marketHealth}
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity style={{ marginBottom: 20 }}>
                        <MaterialCommunityIcons name="dots-horizontal" size={24} color="#D1D5DB" />
                    </TouchableOpacity>
                </View>
                <View style={{ width: '85%', alignSelf: 'center', marginRight: 60 }}>
                    {loading ? (
                        <View style={{ height: 120, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#4A43EC" />
                        </View>
                    ) : (
                        <MarketGraph chartData={trajectoryData?.chart_data} period={period} />
                    )}
                </View>
            </View>

            {/* Recommended Properties */}
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827', marginHorizontal: 16, marginBottom: 25 }}>Recommended Property</Text>
            <View style={{ marginHorizontal: 24,   marginBottom: 26  }}>
                {recommendedLoading ? (
                    <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#4A43EC" />
                    </View>
                ) : recommendedProjects.length > 0 ? (
                    recommendedProjects.map((item) => (
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
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }} numberOfLines={1}>{item.name}</Text>
                                    <Text style={{ fontSize: 11, color: '#111827', marginTop: 2 }}>{item.current_price_formatted || 'N/A'}</Text>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                   
                                    <MiniGraph data={item.mini_chart_data} />

                                    <View style={{  borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                                        <Text style={{ fontSize: 12, color: '#873600', fontWeight: '700' }}>{item.appreciation_label || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                        <Text style={{ fontSize: 13, color: '#9CA3AF' }}>No recommended projects available</Text>
                    </View>
                )}
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
               
            </View>

        </View>
    );
}
