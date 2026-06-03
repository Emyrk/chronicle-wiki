import { allRaidInstances } from "./instances";
import { resolveInstanceMetadata } from "./metadata";

export type GuideSectionSlug = "raids" | "dungeons";

export interface GuideIndexEntry {
  slug: string;
  title: string;
  description: string;
  status: "available" | "guide-pending" | "planned";
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
    entries: allRaidInstances().map((instance) => {
      const metadata = resolveInstanceMetadata(instance);
      return {
        slug: metadata.slug,
        title: metadata.title,
        description: instance.description,
        status: metadata.status,
        href: (serverSlug) => `/${serverSlug}/raids/${metadata.slug}`,
        keywords: instance.keywords,
        backgroundImageUrl: chronicleAssetUrl(metadata.backgroundImagePath),
      };
    }),
  },
  {
    slug: "dungeons",
    title: "Dungeons",
    description: "Coming soon. Dungeon guides will appear here when player-ready notes are added.",
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
