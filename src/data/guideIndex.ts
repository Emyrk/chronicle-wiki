import { allRaidInstances } from "./instances";

export type GuideSectionSlug = "raids" | "dungeons";

export interface GuideIndexEntry {
  slug: string;
  title: string;
  description: string;
  status: "mvp" | "stub" | "planned";
  href: (serverSlug: string) => string;
  keywords: string[];
  backgroundImageUrl?: string;
}

export interface GuideIndexSection {
  slug: GuideSectionSlug;
  title: string;
  description: string;
  entries: GuideIndexEntry[];
}

function chronicleAssetUrl(path: string | undefined) {
  if (!path) return undefined;
  return path.startsWith("/") ? path : `/${path}`;
}

export const guideSections: GuideIndexSection[] = [
  {
    slug: "raids",
    title: "Raids",
    description: "Raid hubs, boss guides, and log-backed mechanics by server.",
    entries: allRaidInstances().map((instance) => ({
      slug: instance.slug,
      title: instance.title,
      description: instance.description,
      status: instance.status,
      href: (serverSlug) => `/${serverSlug}/raids/${instance.slug}`,
      keywords: instance.keywords,
      backgroundImageUrl: chronicleAssetUrl(instance.backgroundImagePath),
    })),
  },
  {
    slug: "dungeons",
    title: "Dungeons",
    description: "Dungeon guides will live here once Chronicle has enough instance-level data to avoid hand-wavy filler.",
    entries: [],
  },
];

export function allGuideEntries() {
  return guideSections.flatMap((section) => section.entries.map((entry) => ({ ...entry, section: section.title, sectionSlug: section.slug })));
}

export function searchGuideEntries(query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const entries = allGuideEntries();
  if (terms.length === 0) return entries;

  return entries.filter((entry) => {
    const haystack = [entry.title, entry.description, entry.section, ...entry.keywords].join(" ").toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
