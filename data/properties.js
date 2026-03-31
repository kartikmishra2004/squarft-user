import { allProjects } from "./projects";

// Truncate name to 10 chars then ...
function shortName(name) {
    return name.length > 10 ? name.slice(0, 10) + "..." : name;
}

// If price is a range (has –), return only the lower value
function lowerPrice(priceRange) {
    if (!priceRange) return "";
    return priceRange.includes("–") ? priceRange.split("–")[0].trim() : priceRange;
}

export const properties = allProjects.map((p) => ({
    id: p.id,
    title: p.name,
    type: shortName(p.name),
    category: p.propertyType.toLowerCase().replace("/", "-"),
    price: lowerPrice(p.variants[0]?.priceRange ?? p.avgPricePerSqft),
    priceINR: lowerPrice(p.variants[0]?.priceRange ?? p.avgPricePerSqft),
    area: `${p.areaSqft} sqft`,
    beds: parseInt(p.subTypes[0]) || 0,
    baths: 2,
    location: p.location,
    image: p.imageMain,
    imageThumb: p.imageThumb,
    builder: p.builder || "",
    zeroBrokerage: p.zeroBrokerage || false,
    possession: p.possession || "",
    avgPricePerSqft: p.avgPricePerSqft || "",
    rera: p.rera || false,
    totalImages: p.totalImages || 0,
    variants: p.variants || [],
    tags: p.tags,
    isFavourite: false,
    isSeen: false,
    isContacted: false,
    isRecent: false,
}));

export const recommendedProperties = properties.filter((p) =>
    p.tags.includes("recommended")
);

export const featuredProperties = properties.filter((p) =>
    p.tags.includes("featured")
);

export const projectsInFocus = allProjects
    .filter((p) => p.tags.includes("featured"))
    .map((p) => ({
        id: p.id,
        tag: p.possessionStatus.toUpperCase(),
        title: p.name,
        subtitle: `${p.propertyType} · ${p.location}`,
        price: `STARTING ${p.variants[0]?.priceRange?.split("–")[0]?.trim() ?? p.avgPricePerSqft}`,
        image: p.imageMain,
    }));

export const highGrowthLocalities = allProjects.map((p) => ({
    id: p.id,
    title: p.name,
    location: p.location,
    priceRange: p.variants[0]?.priceRange ?? p.avgPricePerSqft,
    bhk: p.subTypes.length > 0 ? p.subTypes.join(", ") + " BHK" : p.propertyType,
    possession: `Poss: ${p.possession}`,
    image: p.imageMain,
}));

export const missedProperties = allProjects
    .filter((p) => p.tags.includes("recommended"))
    .slice(0, 3)
    .map((p, i) => ({
        id: `m${i + 1}`,
        title: p.name,
        location: p.location,
        priceINR: p.variants[0]?.priceRange ?? p.avgPricePerSqft,
        badge: i === 0 ? "TRENDING" : null,
        image: p.imageMain,
        isFavourite: false,
        isSeen: false,
        isContacted: false,
        isRecent: false,
    }));
