export type InstanceKind = "raid" | "dungeon";
export type InstanceStatus = "available" | "guide-pending" | "planned";

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
  backgroundImagePath?: string;
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
    description: "A ten-boss level 60 raid below Blackrock Mountain, built for quick boss lookup and server-scoped Chronicle context.",
    status: "available",
    backgroundImagePath: "/assets/instances/molten-core/background.jpg",
    overviewSections: [
      {
        id: "overview",
        title: "Overview",
        body: [
          "Molten Core is a 40-player raid set inside Blackrock Mountain. The run starts with Flamewaker and core hound checks, moves through elemental and add-control fights, and ends with Ragnaros.",
          "Use this page as the raid hub: scan the boss order, jump into the next encounter, then use Chronicle links for current server raid history.",
        ],
      },
      {
        id: "encounters",
        title: "Encounters",
        body: [
          "Every boss has a short guide focused on the pull, the abilities that cause wipes, and what each role needs to remember.",
        ],
      },
    ],
    encounters: [
      {
        slug: "lucifron",
        name: "Lucifron",
        status: "available",
        role: "Boss with adds",
        summary: "Opening Flamewaker fight centered on add control, Magic dispels, and curse removal.",
      },
      {
        slug: "magmadar",
        name: "Magmadar",
        status: "available",
        role: "Core hound boss",
        summary: "Single-boss core hound fight where Frenzy removal and fear recovery keep the tank alive.",
      },
      {
        slug: "gehennas",
        name: "Gehennas",
        status: "available",
        role: "Boss with adds",
        summary: "Two-add Flamewaker fight with dangerous healing reduction and Rain of Fire movement checks.",
      },
      {
        slug: "garr",
        name: "Garr",
        status: "available",
        role: "Boss with adds",
        summary: "Elemental add-control fight where banishes, tank assignments, and controlled add deaths decide the pull.",
      },
      {
        slug: "shazzrah",
        name: "Shazzrah",
        status: "available",
        role: "Arcane boss",
        summary: "Fast arcane fight built around purging Deaden Magic, decursing, and reacting to teleports.",
      },
      {
        slug: "baron-geddon",
        name: "Baron Geddon",
        status: "available",
        role: "Elemental boss",
        summary: "Burn fight where Living Bomb run-outs, Inferno movement, and Mana dispels prevent raid wipes.",
      },
      {
        slug: "golemagg-the-incinerator",
        name: "Golemagg the Incinerator",
        status: "available",
        role: "Giant boss",
        summary: "Tank-swap fight with two Core Hounds held away while all damage goes into Golemagg.",
      },
      {
        slug: "sulfuron-harbinger",
        name: "Sulfuron Harbinger",
        status: "available",
        role: "Boss with healer adds",
        summary: "Add fight where the raid separates targets, interrupts Dark Mending, then burns Sulfuron last.",
      },
      {
        slug: "majordomo-executus",
        name: "Majordomo Executus",
        status: "available",
        role: "Council encounter",
        summary: "Eight-add control fight with Polymorph targets, reflection awareness, and steady target marks.",
      },
      {
        slug: "ragnaros",
        name: "Ragnaros",
        status: "available",
        role: "Final boss",
        summary: "Final Firelord encounter focused on burst damage, ranged spacing, knockback recovery, and Son of Flame control.",
      },
    ],
    keywords: [
      "mc",
      "molten core",
      "lucifron",
      "magmadar",
      "gehennas",
      "garr",
      "shazzrah",
      "baron geddon",
      "geddon",
      "living bomb",
      "golemagg",
      "sulfuron",
      "majordomo",
      "executus",
      "ragnaros",
      "rag",
    ],
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
