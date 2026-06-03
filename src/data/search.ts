import { allGuideEntries, searchGuideEntries } from "./guideIndex";

export interface SearchResult {
  title: string;
  description: string;
  href: string;
  category: string;
  keywords: string[];
}

export function globalSearchResults(serverSlug: string, query: string): SearchResult[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const staticResults: SearchResult[] = [
    {
      title: "Guides",
      description: "Browse raid and dungeon guide sections.",
      href: `/${serverSlug}/guides`,
      category: "Navigation",
      keywords: ["guides", "raids", "dungeons", "bosses", "instances"],
    },
    {
      title: "Talent calculator",
      description: "Plan and share class builds for the selected server.",
      href: `/${serverSlug}/talents`,
      category: "Tools",
      keywords: ["talents", "calculator", "build", "class"],
    },
    {
      title: "Unit explorer",
      description: "Creatures and spells cast, organized for raid planning.",
      href: `/${serverSlug}/explorer`,
      category: "Tools",
      keywords: ["units", "creatures", "spells", "casts", "explorer"],
    },
  ];

  const guideResults = (terms.length === 0 ? allGuideEntries() : searchGuideEntries(query)).map((entry) => ({
    title: entry.title,
    description: entry.description,
    href: entry.href(serverSlug),
    category: entry.section,
    keywords: entry.keywords,
  }));

  const candidates = [...guideResults, ...staticResults];
  if (terms.length === 0) return candidates;

  return candidates.filter((result) => {
    const haystack = [result.title, result.description, result.category, ...result.keywords].join(" ").toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
