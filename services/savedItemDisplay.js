import { buildProjectAddress, buildProjectPrice } from "./projectDisplay";

export function getSavedItemType(item = {}) {
  return item.type || item.item_type || item.data?.item_type || "property";
}

export function getSavedItemId(item = {}) {
  return item.item_id || item.data?.id || item.id;
}

export function getSavedItemDetails(item = {}, projectList = []) {
  const data = item.data || {};
  const itemId = getSavedItemId(item);
  const itemType = getSavedItemType(item);
  const matchedProject = itemType === "project"
    ? projectList.find((project) => String(project.id || project.project_id) === String(itemId))
    : null;

  return {
    ...data,
    ...(matchedProject || {}),
    ...data,
    id: data.id || matchedProject?.id || itemId,
    item_type: itemType,
  };
}

export function getSavedImageUrl(value) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.url || value.thumbnail_url || null;
}

export function getSavedPrimaryImage(details = {}) {
  return getSavedImageUrl(
    details.cover_image_url
      || details.cover_image
      || details.image_url
      || details.image
      || details.imageMain
      || details.images?.[0],
  );
}

export function getSavedSecondaryImage(details = {}) {
  return getSavedImageUrl(details.images?.[1]);
}

export function getSavedLocation(details = {}) {
  return details.display_location
    || buildProjectAddress(details)
    || [details.area, details.city].filter(Boolean).join(", ")
    || "Location on request";
}

export function getSavedPrice(details = {}) {
  return details.display_price
    || buildProjectPrice(details)
    || "Price on request";
}

export function getSavedSummary(details = {}, isProject = false) {
  const bhk = details.bedrooms || details.bhk;
  const bhkText = !isProject && bhk ? `${bhk} BHK` : null;
  const areaText = details.total_area_sqft || details.area_sqft
    ? `${details.total_area_sqft || details.area_sqft} sqft`
    : null;

  return [bhkText, areaText].filter(Boolean).join(" • ") || (isProject ? "Project" : "Property");
}
