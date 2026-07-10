const cleanValue = (value) => String(value ?? '').trim();

const toTitleCase = (value) => cleanValue(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const getCategory = (property = {}) => cleanValue(
    property.property_type || property.type || property.category,
).toLowerCase();

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
        return [bedroomLabel, subtypeLabel].filter(Boolean).join(' • ');
    }

    if (category === 'commercial') {
        return subtypeLabel;
    }

    return subtypeLabel || bedroomLabel;
};
