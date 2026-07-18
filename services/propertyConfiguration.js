const cleanValue = (value) => String(value ?? '').trim();

const toTitleCase = (value) => cleanValue(value)
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());

const CONFIG_SUBTYPES = new Set(['apartment', 'rowhouse', 'villa']);

const getBedroomLabel = (property = {}) => {
    const bedrooms = Number(property.bedrooms);
    return Number.isInteger(bedrooms) && bedrooms > 0 ? `${bedrooms} BHK` : '';
};

export const getPropertySubtypeLabel = (property = {}) => {
    const subtype = cleanValue(property.sub_type || property.property_subtype);
    return subtype ? toTitleCase(subtype) : '';
};

export const getProjectPropertyCardConfig = (property = {}) => {
    const subtype = cleanValue(property.sub_type || property.property_subtype).toLowerCase();
    const subtypeLabel = getPropertySubtypeLabel(property);

    if (CONFIG_SUBTYPES.has(subtype)) {
        const configLabel = cleanValue(property.description) || getBedroomLabel(property);
        return [configLabel, subtypeLabel].filter(Boolean).join(' • ');
    }

    return subtypeLabel;
};
