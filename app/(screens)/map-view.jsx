import { useEffect, useMemo, useRef, useState } from "react";
import {
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import MapView, { Marker, UrlTile } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { allProjects } from "../../data/projects";
import {
    fetchSavedPropertiesThunk,
    savePropertyThunk,
    toggleFavourite,
    unsavePropertyThunk,
} from "../../store/slices/propertiesSlice";
import { buildProjectAddress, buildProjectPrice } from "../../services/projectDisplay";

const INDORE_CENTER = { latitude: 22.7196, longitude: 75.8577 };
const DEFAULT_REGION = {
    ...INDORE_CENTER,
    latitudeDelta: 0.12,
    longitudeDelta: 0.12,
};
const DEFAULT_TILE_URL_TEMPLATE = "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";
const MAP_TILE_URL_TEMPLATE = process.env.EXPO_PUBLIC_MAP_TILE_URL || DEFAULT_TILE_URL_TEMPLATE;
const MAP_ATTRIBUTION = process.env.EXPO_PUBLIC_MAP_ATTRIBUTION || "(c) OpenStreetMap contributors (c) CARTO";

const cardShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
};

const getProjectId = (project) => project?.id || project?.project_id || project?.slug;

const getProjectTitle = (project) =>
    project.name || project.title || project.project_name || project.property_name || "Project";

const cleanText = (value) => {
    const text = String(value ?? "").replace(/\s+/g, " ").trim();
    if (!text || ["none", "null", "undefined"].includes(text.toLowerCase())) return "";
    return text;
};

const getProjectAddress = (project) => {
    return cleanText(project.display_location)
        || buildProjectAddress(project)
        || cleanText(project.location)
        || cleanText(project.address)
        || "Location unavailable";
};

const getProjectImage = (project) =>
    project.cover_image_url ||
    project.cover_image ||
    project.image_url ||
    project.image ||
    project.imageMain ||
    null;

const getImageSource = (project) => {
    const image = getProjectImage(project);
    if (typeof image === "string" && image) return { uri: image };
    return image;
};

const formatCompactPrice = (value) => {
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
    return `\u20B9${amount.toLocaleString("en-IN")}`;
};

const getProjectPrice = (project) => {
    const normalizedPrice = cleanText(project.display_price) || buildProjectPrice(project);
    if (normalizedPrice) return normalizedPrice;

    if (project.variants?.[0]?.priceRange) {
        return project.variants[0].priceRange.split(/\s+(?:-|\u2013)\s+/)[0]?.trim() || project.variants[0].priceRange;
    }
    if (project.priceINR || project.price || project.price_range || project.priceRange) {
        return project.priceINR || project.price || project.price_range || project.priceRange;
    }

    const from = formatCompactPrice(project.price_from ?? project.min_price ?? project.budgetMin ?? project.base_price);
    const to = formatCompactPrice(project.price_to ?? project.max_price ?? project.budgetMax);
    if (from && to && from !== to) return `${from} - ${to}`;
    return from || to || project.avgPricePerSqft || "Price on request";
};

const getBhkText = (project) => {
    const propertyType = project.propertyType || project.property_type || project.type;
    if (String(propertyType || "").toLowerCase().includes("plot")) return "Plot";

    const values = [
        project.bedrooms,
        project.bhk,
        project.configuration,
        project.configs,
        project.property_subtype,
        ...(Array.isArray(project.subTypes) ? project.subTypes : []),
        ...(Array.isArray(project.variants) ? project.variants.map((variant) => variant.bedrooms || variant.type || variant.title) : []),
    ];

    const bhks = values
        .flatMap((value) => {
            const text = String(value ?? "").toLowerCase();
            const matches = text.match(/\d+\+?(?=\s*bhk\b)/g) || [];
            if (matches.length) return matches;
            const plainNumber = text.trim().match(/^\d+\+?$/);
            return plainNumber ? [plainNumber[0]] : [];
        })
        .filter(Boolean);

    const unique = [...new Set(bhks)].sort((a, b) => parseFloat(a) - parseFloat(b));
    if (unique.length) return `${unique.join(", ")} BHK`;
    return project.propertyType || project.property_type || project.type || "Project";
};

const numberFrom = (...values) => {
    for (const value of values) {
        if (value === null || value === undefined || value === "") continue;
        const number = Number(value);
        if (Number.isFinite(number)) return number;
    }
    return null;
};

const getStoredProjectCoordinate = (project) => {
    const latitude = numberFrom(
        project.latitude,
        project.lat,
        project.location_latitude,
        project.project_latitude,
        project.property_latitude,
        project.coordinates?.latitude,
        project.coordinates?.lat
    );
    const longitude = numberFrom(
        project.longitude,
        project.lng,
        project.lon,
        project.location_longitude,
        project.project_longitude,
        project.property_longitude,
        project.coordinates?.longitude,
        project.coordinates?.lng,
        project.coordinates?.lon
    );

    if (latitude === null || longitude === null) return null;
    return { latitude, longitude };
};

const getInitialRegion = (items, userLocation) => {
    if (items.length > 0) {
        return {
            ...items[0].coordinate,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
        };
    }

    if (userLocation) {
        return {
            ...userLocation,
            latitudeDelta: 0.08,
            longitudeDelta: 0.08,
        };
    }

    return DEFAULT_REGION;
};

function NativeProjectMap({ items, selectedId, userLocation, onSelectProject }) {
    const mapRef = useRef(null);
    const initialRegion = useMemo(() => getInitialRegion(items, userLocation), [items, userLocation]);

    useEffect(() => {
        if (!mapRef.current || items.length === 0) return;

        const coordinates = items.map((item) => item.coordinate);
        const timer = setTimeout(() => {
            if (coordinates.length === 1) {
                mapRef.current?.animateToRegion(
                    {
                        ...coordinates[0],
                        latitudeDelta: 0.035,
                        longitudeDelta: 0.035,
                    },
                    450
                );
                return;
            }

            mapRef.current?.fitToCoordinates(coordinates, {
                edgePadding: { top: 160, right: 70, bottom: 280, left: 70 },
                animated: true,
            });
        }, 250);

        return () => clearTimeout(timer);
    }, [items]);

    useEffect(() => {
        const selected = items.find(({ project }) => getProjectId(project) === selectedId);
        if (!selected || !mapRef.current) return;

        mapRef.current.animateToRegion(
            {
                ...selected.coordinate,
                latitudeDelta: 0.025,
                longitudeDelta: 0.025,
            },
            350
        );
    }, [items, selectedId]);

    return (
        <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={initialRegion}
            mapType={Platform.OS === "android" ? "none" : "standard"}
            showsCompass
            showsScale
            showsUserLocation={!!userLocation}
            showsMyLocationButton={false}
            toolbarEnabled={false}
            rotateEnabled={false}
        >
            <UrlTile urlTemplate={MAP_TILE_URL_TEMPLATE} maximumZ={19} flipY={false} zIndex={-1} />

            {items.map(({ project, coordinate }, index) => {
                const id = getProjectId(project);
                const selected = id === selectedId;

                return (
                    <Marker
                        key={`${id || index}-${selected ? "selected" : "idle"}`}
                        coordinate={coordinate}
                        anchor={{ x: 0.5, y: 1 }}
                        tracksViewChanges={false}
                        onPress={() => onSelectProject(project)}
                    >
                        <View style={{ alignItems: "center" }}>
                            <View style={{ backgroundColor: selected ? "#4A43EC" : "#fff", borderColor: selected ? "#4A43EC" : "#D1D5DB", borderWidth: 1, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 6, ...cardShadow }}>
                                <Text style={{ color: selected ? "#fff" : "#111827", fontSize: 12, fontWeight: "800" }} numberOfLines={1}>
                                    {getProjectPrice(project)}
                                </Text>
                            </View>
                            <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: selected ? "#4A43EC" : "#111827", borderWidth: 3, borderColor: "#fff", alignItems: "center", justifyContent: "center", marginTop: -2 }}>
                                <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>{index + 1}</Text>
                            </View>
                        </View>
                    </Marker>
                );
            })}
        </MapView>
    );
}

function MapProjectCard({ item, index, isSelected, isSaved, hasCoordinate, onSelect, onToggleSave }) {
    const imageSource = getImageSource(item);

    return (
        <TouchableOpacity
            activeOpacity={0.92}
            onPress={onSelect}
            style={{
                width: 286,
                backgroundColor: "#fff",
                borderRadius: 18,
                overflow: "hidden",
                marginLeft: index === 0 ? 20 : 12,
                borderWidth: isSelected ? 1.5 : 1,
                borderColor: isSelected ? "#4A43EC" : "#EEF2F7",
                ...cardShadow,
            }}
        >
            <View style={{ position: "relative", height: 132, backgroundColor: "#E5E7EB" }}>
                {imageSource ? (
                    <Image source={imageSource} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <MaterialCommunityIcons name="office-building-outline" size={34} color="#9CA3AF" />
                    </View>
                )}
                <View style={{ position: "absolute", top: 12, left: 12, backgroundColor: isSelected ? "#4A43EC" : "#111827", borderRadius: 18, paddingHorizontal: 10, paddingVertical: 5 }}>
                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>#{index + 1}</Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={onToggleSave}
                    style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(255,255,255,0.94)", alignItems: "center", justifyContent: "center" }}
                >
                    <Ionicons name={isSaved ? "heart" : "heart-outline"} size={19} color={isSaved ? "#EF4444" : "#6B7280"} />
                </TouchableOpacity>
            </View>

            <View style={{ padding: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 }}>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: "800", color: "#111827" }} numberOfLines={1}>
                        {getProjectTitle(item)}
                    </Text>
                    <Text style={{ fontSize: 13, fontWeight: "800", color: "#4A43EC" }} numberOfLines={1}>
                        {getProjectPrice(item)}
                    </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 10 }}>
                    <Ionicons name={hasCoordinate ? "location-outline" : "alert-circle-outline"} size={13} color={hasCoordinate ? "#64748B" : "#EF4444"} />
                    <Text style={{ flex: 1, fontSize: 12, color: hasCoordinate ? "#64748B" : "#EF4444" }} numberOfLines={1}>
                        {hasCoordinate ? getProjectAddress(item) : "Exact map location missing"}
                    </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flex: 1 }}>
                        <MaterialCommunityIcons name="bed-outline" size={15} color="#4A43EC" />
                        <Text style={{ fontSize: 12, color: "#1F2937", fontWeight: "600", flex: 1 }} numberOfLines={1}>
                            {getBhkText(item)}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: "/(screens)/project-detail", params: { id: getProjectId(item), slug: item.slug } })}
                        style={{ backgroundColor: "#F5F3FF", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 }}
                    >
                        <Text style={{ color: "#4A43EC", fontSize: 11, fontWeight: "800" }}>Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function MapViewScreen() {
    const dispatch = useDispatch();
    const { title } = useLocalSearchParams();
    const mapProjects = useSelector((state) => state.project.mapProjects);
    const savedProjects = useSelector((state) => state.properties.favouriteProjects);
    const { isLoggedIn, token } = useSelector((state) => state.auth);
    const [search, setSearch] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState("Finding your location...");
    const [mapStatus, setMapStatus] = useState("");
    const baseProjects = mapProjects?.length ? mapProjects : allProjects;

    const visibleProjects = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return baseProjects;
        return baseProjects.filter((project) =>
            [getProjectTitle(project), getProjectAddress(project), project.propertyType, project.property_type]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [baseProjects, search]);

    const projectsWithCoordinates = useMemo(
        () =>
            visibleProjects
                .map((project, index) => ({
                    project,
                    listIndex: index,
                    coordinate: getStoredProjectCoordinate(project),
                }))
                .filter((item) => item.coordinate),
        [visibleProjects]
    );

    const missingCoordinateCount = visibleProjects.length - projectsWithCoordinates.length;

    const activeSelectedId = projectsWithCoordinates.some(({ project }) => getProjectId(project) === selectedId)
        ? selectedId
        : getProjectId(projectsWithCoordinates[0]?.project);

    const selectedProject = projectsWithCoordinates.find(({ project }) => getProjectId(project) === activeSelectedId);

    useEffect(() => {
        let mounted = true;

        const requestLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (!mounted) return;

                if (status !== "granted") {
                    setLocationStatus("Location permission not granted");
                    return;
                }

                const servicesEnabled = await Location.hasServicesEnabledAsync();
                if (!servicesEnabled) {
                    setLocationStatus("Location services are off");
                    return;
                }

                const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                if (!mounted) return;

                setUserLocation({
                    latitude: current.coords.latitude,
                    longitude: current.coords.longitude,
                });
                setLocationStatus("");
            } catch (error) {
                if (!mounted) return;
                setLocationStatus("Could not detect location");
                console.log("Map location permission failed:", error);
            }
        };

        requestLocation();
        return () => {
            mounted = false;
        };
    }, []);

    const focusProject = (project) => {
        const id = getProjectId(project);
        const hasCoordinate = projectsWithCoordinates.some(({ project: item }) => getProjectId(item) === id);
        setSelectedId(id);

        if (!hasCoordinate) {
            setMapStatus("This project needs latitude and longitude before it can be pinned accurately.");
        } else {
            setMapStatus("");
        }
    };

    const focusAllProjects = () => {
        setSelectedId(null);
        setMapStatus("");
    };

    const handleToggleSave = async (project) => {
        const id = getProjectId(project);
        if (!id) return;

        const isSaved = savedProjects.includes(id);
        if (!isLoggedIn || !token) {
            dispatch(toggleFavourite(id));
            return;
        }

        const image = getProjectImage(project);
        const itemData = {
            id,
            name: getProjectTitle(project),
            title: getProjectTitle(project),
            slug: project.slug,
            area: project.area,
            city: project.city,
            location: getProjectAddress(project),
            cover_image_url: typeof image === "string" ? image : null,
            image: typeof image === "string" ? image : null,
            price_from: project.price_from ?? project.min_price ?? project.budgetMin,
            min_price: project.price_from ?? project.min_price ?? project.budgetMin,
            rera_id: project.reraId || project.rera_id,
        };

        try {
            if (isSaved) {
                await dispatch(unsavePropertyThunk({ itemType: "project", itemId: id })).unwrap();
            } else {
                await dispatch(savePropertyThunk({ itemType: "project", itemId: id, itemData })).unwrap();
            }
            dispatch(fetchSavedPropertiesThunk());
        } catch (error) {
            console.log("Map save toggle failed:", error);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
            <View style={{ flex: 1, position: "relative" }}>
                <NativeProjectMap
                    items={projectsWithCoordinates}
                    selectedId={activeSelectedId}
                    userLocation={userLocation}
                    onSelectProject={focusProject}
                />

                <View style={{ position: "absolute", top: 42, left: 16, right: 16, flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", ...cardShadow }}>
                        <Ionicons name="chevron-back" size={22} color="#111827" />
                    </TouchableOpacity>

                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, paddingHorizontal: 14, height: 42, gap: 8, ...cardShadow }}>
                        <Ionicons name="search-outline" size={16} color="#9CA3AF" />
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder={`Search ${String(title || "projects").toLowerCase()}`}
                            placeholderTextColor="#9CA3AF"
                            style={{ flex: 1, fontSize: 14, color: "#111827" }}
                        />
                    </View>

                    <TouchableOpacity onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: "#111827", alignItems: "center", justifyContent: "center", ...cardShadow }}>
                        <MaterialCommunityIcons name="view-list-outline" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={{ position: "absolute", top: 98, left: 20, right: 20, flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                    <View style={{ backgroundColor: "rgba(255,255,255,0.96)", borderRadius: 16, paddingHorizontal: 13, paddingVertical: 8, ...cardShadow }}>
                        <Text style={{ fontSize: 12, color: "#4B5563", fontWeight: "700" }}>
                            {projectsWithCoordinates.length}/{visibleProjects.length} projects pinned
                        </Text>
                        {!!locationStatus && (
                            <Text style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>{locationStatus}</Text>
                        )}
                    </View>

                    {missingCoordinateCount > 0 && (
                        <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.96)", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, ...cardShadow }}>
                            <Text style={{ fontSize: 10, color: "#EF4444", fontWeight: "700" }} numberOfLines={2}>
                                {missingCoordinateCount} need exact latitude/longitude
                            </Text>
                        </View>
                    )}
                </View>

                {!!selectedProject && (
                    <View style={{ position: "absolute", top: 154, left: 20, right: 76, backgroundColor: "#4A43EC", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, ...cardShadow }}>
                        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "800" }} numberOfLines={1}>
                            {getProjectTitle(selectedProject.project)}
                        </Text>
                        <Text style={{ color: "#DAD7FF", fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                            {getProjectAddress(selectedProject.project)}
                        </Text>
                    </View>
                )}

                {!!mapStatus && (
                    <View style={{ position: "absolute", top: 154, left: 20, right: 76, backgroundColor: "#111827", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, ...cardShadow }}>
                        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }} numberOfLines={2}>
                            {mapStatus}
                        </Text>
                    </View>
                )}

                <View style={{ position: "absolute", right: 16, top: "40%", gap: 8 }}>
                    <TouchableOpacity onPress={focusAllProjects} style={{ width: 42, height: 42, borderRadius: 12, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", ...cardShadow }}>
                        <MaterialCommunityIcons name="map-marker-multiple-outline" size={20} color="#374151" />
                    </TouchableOpacity>
                </View>

                <View style={{ position: "absolute", left: 14, bottom: 244, backgroundColor: "rgba(255,255,255,0.94)", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 }}>
                    <Text style={{ color: "#6B7280", fontSize: 10, fontWeight: "700" }}>{MAP_ATTRIBUTION}</Text>
                </View>

                <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingBottom: 22 }}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 20 }}
                        decelerationRate="fast"
                        snapToInterval={298}
                    >
                        {visibleProjects.map((item, index) => {
                            const id = getProjectId(item);
                            const hasCoordinate = !!getStoredProjectCoordinate(item);
                            return (
                                <MapProjectCard
                                    key={id || index}
                                    item={item}
                                    index={index}
                                    isSelected={id === activeSelectedId || id === selectedId}
                                    isSaved={savedProjects.includes(id)}
                                    hasCoordinate={hasCoordinate}
                                    onSelect={() => focusProject(item)}
                                    onToggleSave={() => handleToggleSave(item)}
                                />
                            );
                        })}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}
