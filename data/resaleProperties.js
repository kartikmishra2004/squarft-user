import { allProjects } from "./projects";

// Generate 2 resale listings per project
export const resaleProperties = allProjects.flatMap((p) =>
    p.variants.slice(0, 2).map((v, i) => ({
        id: `${p.id}-resale-${i + 1}`,
        projectId: p.id,
        title: p.name,
        name: p.name,
        location: p.location,
        image: p.imageMain,
        imageMain: p.imageMain,
        priceINR: v.priceRange.split("–")[0].trim(),
        variants: [{ priceRange: v.priceRange }],
        type: v.type,
        areaSqft: p.areaSqft,
        isFavourite: false,
        tags: p.tags,
    }))
);

export function getResaleByProject(projectId) {
    return resaleProperties.filter((r) => r.projectId === projectId);
}
