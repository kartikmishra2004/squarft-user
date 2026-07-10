const CATEGORIES = [
    { type: "school", label: "School", icon: "school-outline" },
    { type: "hospital", label: "Hospital", icon: "medical-outline" },
    { type: "shopping_mall", label: "Mall", icon: "bag-handle-outline" },
    { type: "train_station", label: "Station", icon: "train-outline" },
    { type: "bank", label: "Bank", icon: "card-outline" },
    { type: "restaurant", label: "Restaurant", icon: "restaurant-outline" },
];

function toRad(deg) {
    return (deg * Math.PI) / 180;
}

function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters) {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
}

async function fetchCategoryPlaces(category, latitude, longitude, apiKey, radius) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${category.type}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.status !== "OK" || !Array.isArray(data.results)) return [];

        return data.results
            .filter((place) => place.geometry?.location)
            .slice(0, 3)
            .map((place) => ({
                id: place.place_id,
                name: place.name,
                label: category.label,
                icon: category.icon,
                category: category.type,
                latitude: place.geometry.location.lat,
                longitude: place.geometry.location.lng,
            }));
    } catch (error) {
        console.error(`Nearby search failed for ${category.type}:`, error?.message || error);
        return [];
    }
}

export async function fetchNearbyLandmarks({ latitude, longitude, apiKey, radius = 2500, limit = 3 }) {
    if (!apiKey || latitude == null || longitude == null) return [];

    const perCategory = await Promise.all(
        CATEGORIES.map((category) => fetchCategoryPlaces(category, latitude, longitude, apiKey, radius))
    );

    const seen = new Set();
    const merged = [];
    for (const place of perCategory.flat()) {
        if (seen.has(place.id)) continue;
        seen.add(place.id);
        merged.push({
            ...place,
            distanceMeters: haversineDistanceMeters(latitude, longitude, place.latitude, place.longitude),
        });
    }

    merged.sort((a, b) => a.distanceMeters - b.distanceMeters);

    return merged.slice(0, limit).map((place) => ({
        ...place,
        distance: formatDistance(place.distanceMeters),
    }));
}
