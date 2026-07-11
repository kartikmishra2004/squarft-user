const cleanValue = (value) => String(value ?? '').trim();

const toTitleCase = (value) => cleanValue(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const COMMERCIAL_SUBTYPES = new Set(['shop', 'office', 'showroom']);

const getCategory = (property = {}) => {
    const explicitCategory = cleanValue(
        property.property_type || property.type || property.category,
    ).toLowerCase();
    if (explicitCategory === 'residential' || explicitCategory === 'commercial') return explicitCategory;

    const subtype = cleanValue(property.sub_type || property.property_subtype).toLowerCase();
    if (COMMERCIAL_SUBTYPES.has(subtype)) return 'commercial';
    if (property.bedrooms !== null && property.bedrooms !== undefined) return 'residential';
    return explicitCategory;
};

const getBedroomLabel = (property = {}) => {
    const bedrooms = Number(property.bedrooms);
    return Number.isInteger(bedrooms) && bedrooms > 0 ? `${bedrooms} BHK` : '';
};

export const getPropertySubtypeLabel = (property = {}) => {
    const subtype = cleanValue(property.sub_type || property.property_subtype);
    return subtype ? toTitleCase(subtype) : '';
};

export const getProjectPropertyCardConfig = (property = {}) => {
    const category = getCategory(property);
    const bedroomLabel = getBedroomLabel(property);
    const subtypeLabel = getPropertySubtypeLabel(property);

    if (category === 'residential') {
        const descriptionLabel = cleanValue(property.description) || bedroomLabel;
        return [descriptionLabel, subtypeLabel].filter(Boolean).join(' ');
    }

    if (category === 'commercial') return subtypeLabel;
    return subtypeLabel || bedroomLabel;
};
