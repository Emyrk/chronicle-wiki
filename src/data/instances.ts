export type InstanceKind = "raid" | "dungeon";
export type InstanceStatus = "mvp" | "stub" | "planned";

export interface InstanceEncounter {
  slug: string;
  name: string;
  status: InstanceStatus;
  role?: string;
  summary: string;
}

export interface InstanceOverviewSection {
  id: string;
  title: string;
  body: string[];
}

export interface InstanceDefinition {
  slug: string;
  title: string;
  kind: InstanceKind;
  description: string;
  status: InstanceStatus;
  encounters: InstanceEncounter[];
  overviewSections: InstanceOverviewSection[];
  keywords: string[];
}

export interface InstanceTableOfContentsEntry {
  label: string;
  href: string;
  depth: 1 | 2;
}

export interface InstanceOverviewModel {
  instance: InstanceDefinition;
  tableOfContents: InstanceTableOfContentsEntry[];
}

export const raidInstances: InstanceDefinition[] = [
  {
    slug: "molten-core",
    title: "Molten Core",
    kind: "raid",
    description: "A ten-encounter elemental raid below Blackrock Mountain, organized by boss order with server-specific guides linked from each encounter.",
    status: "mvp",
    overviewSections: [
      {
        id: "overview",
        title: "Overview",
        body: [
          "Molten Core is the first Chronicle raid guide hub. The page keeps the full encounter order visible and links directly to available boss guides.",
          "Use the encounter list to jump directly to each boss, then open a completed guide for detailed mechanics and unit evidence.",
        ],
      },
      {
        id: "encounters",
        title: "Encounters",
        body: [
          "Bosses are listed in encounter order when the instance data knows that order. Chronicle-specific mechanics and unit evidence live on the linked boss pages.",
        ],
      },
    ],
    encounters: [
      {
        slug: "lucifron",
        name: "Lucifron",
        status: "stub",
        role: "Boss",
        summary: "Opening encounter with Lucifron and Flamewaker adds. Expect curse pressure, mind control, and an early check on dispels and target control.",
      },
      {
        slug: "magmadar",
        name: "Magmadar",
        status: "stub",
        role: "Boss",
        summary: "Core hound encounter built around fear control, frenzy handling, and steady raid positioning.",
      },
      {
        slug: "gehennas",
        name: "Gehennas",
        status: "stub",
        role: "Boss",
        summary: "Curse and add-control encounter with sustained raid damage and Flamewaker pressure.",
      },
      {
        slug: "garr",
        name: "Garr",
        status: "mvp",
        role: "Boss with adds",
        summary: "Add-control encounter with a completed baseline guide and server override hooks.",
      },
      {
        slug: "ragnaros",
        name: "Ragnaros",
        status: "stub",
        role: "Final boss",
        summary: "Final encounter against the Firelord, with phase timing, submerge pressure, and add control defining the fight.",
      },
    ],
    keywords: ["mc", "molten core", "lucifron", "magmadar", "gehennas", "garr", "ragnaros"],
  },
];

const instanceByKind: Record<InstanceKind, InstanceDefinition[]> = {
  raid: raidInstances,
  dungeon: [],
};

export function allRaidInstances() {
  return [...raidInstances];
}

export function getRaidInstance(slug: string) {
  return raidInstances.find((instance) => instance.slug === slug);
}

export function allInstances(kind?: InstanceKind) {
  if (kind) return [...instanceByKind[kind]];
  return [...raidInstances];
}

export function instanceAnchorId(labelOrSlug: string) {
  return `encounter-${slugify(labelOrSlug)}`;
}

export function buildInstanceOverview(instance: InstanceDefinition): InstanceOverviewModel {
  return {
    instance,
    tableOfContents: [
      ...instance.overviewSections.map((section) => ({ label: section.title, href: `#${section.id}`, depth: 1 as const })),
      ...instance.encounters.map((encounter) => ({ label: encounter.name, href: `#${instanceAnchorId(encounter.slug)}`, depth: 2 as const })),
    ],
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
