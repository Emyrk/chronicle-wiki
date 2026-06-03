export type GuideSectionSlug = "raids" | "dungeons";

export interface GuideIndexEntry {
  slug: string;
  title: string;
  description: string;
  status: "mvp" | "stub" | "planned";
  href: (serverSlug: string) => string;
  keywords: string[];
}

export interface GuideIndexSection {
  slug: GuideSectionSlug;
  title: string;
  description: string;
  entries: GuideIndexEntry[];
}

export const guideSections: GuideIndexSection[] = [
  {
    slug: "raids",
    title: "Raids",
    description: "Raid hubs, boss guides, and log-backed mechanics by server.",
    entries: [
      {
        slug: "molten-core",
        title: "Molten Core",
        description: "First raid guide hub. Garr is the initial boss guide, with the rest staged as structured placeholders.",
        status: "mvp",
        href: (serverSlug) => `/${serverSlug}/raids/molten-core`,
        keywords: ["mc", "molten core", "garr", "lucifron", "magmadar", "gehennas", "ragnaros"],
      },
    ],
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
