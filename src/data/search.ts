import { allGuideEntries } from "./guideIndex";
import { allInstances, instanceAnchorId } from "./instances";
import { baseGuides, flavorPatches, serverPatches } from "./guides";
import { resolveServerContext, serverList } from "./servers";
import { classList, classListForClassIds, fallbackTalentTrees } from "./talents";

export interface SearchResult {
  title: string;
  description: string;
  href: string;
  category: string;
  keywords: string[];
}

interface SearchCandidate extends SearchResult {
  priority: number;
}

export function globalSearchResults(serverSlug: string, query: string): SearchResult[] {
  const terms = searchTerms(query);
  const candidates = searchCandidates(serverSlug);
  if (terms.length === 0) return candidates.map(stripPriority);

  return candidates
    .map((candidate) => ({ candidate, score: scoreCandidate(candidate, terms) }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => right.score - left.score || right.candidate.priority - left.candidate.priority || left.candidate.title.localeCompare(right.candidate.title))
    .map(({ candidate }) => stripPriority(candidate));
}

function searchCandidates(serverSlug: string): SearchCandidate[] {
  const currentContext = resolveServerContext(serverSlug);
  const currentServer = currentContext?.server ?? serverList.find((server) => server.slug === serverSlug);
  const serverKeywords = currentServer ? serverSearchKeywords(currentServer) : [serverSlug];
  const staticResults: SearchCandidate[] = [
    {
      title: currentServer?.name ?? serverSlug,
      description: currentServer?.description ?? "Server home and wiki tools.",
      href: `/${serverSlug}`,
      category: "Servers",
      keywords: [...serverKeywords, "home", "overview", "server"],
      priority: 95,
    },
    {
      title: "Guides",
      description: "Browse raid and dungeon guide sections.",
      href: `/${serverSlug}/guides`,
      category: "Navigation",
      keywords: ["guides", "raids", "dungeons", "bosses", "instances", "strategy", "assignments", "dispels", "raid planning"],
      priority: 110,
    },
    {
      title: "Talent calculator",
      description: "Plan and share class builds for the selected server.",
      href: `/${serverSlug}/talents`,
      category: "Tools",
      keywords: [...serverKeywords, "talents", "calculator", "build", "class", "spec", "specialization", "template"],
      priority: 93,
    },
    {
      title: "Unit explorer",
      description: "Creatures and spells cast, organized for raid planning.",
      href: `/${serverSlug}/explorer`,
      category: "Tools",
      keywords: ["units", "creatures", "spells", "casts", "explorer", ...unitExplorerKeywords()],
      priority: 55,
    },
    {
      title: "Creatures and units",
      description: "Explore raid creatures, adds, and unit notes for the selected server.",
      href: `/${serverSlug}/explorer`,
      category: "Units",
      keywords: ["units", "creatures", "adds", "flamewaker", "firesworn", "core hound", "lava spawn", "elemental"],
      priority: 105,
    },
    {
      title: "Spell casts",
      description: "Review tracked encounter spells and cast evidence for raid planning.",
      href: `/${serverSlug}/explorer`,
      category: "Spells",
      keywords: ["spells", "casts", "living bomb", "magma shackles", "magma splash", "antimagic pulse", "curse", "fear", "dispel"],
      priority: 104,
    },
  ];

  const guideResults: SearchCandidate[] = allGuideEntries().map((entry) => ({
    title: entry.title,
    description: entry.description,
    href: entry.href(serverSlug),
    category: entry.section,
    keywords: [...entry.keywords, entry.section, entry.sectionSlug, "guide", "strategy", "boss", "raid"],
    priority: 90,
  }));

  const bossResults: SearchCandidate[] = allInstances().flatMap((instance) =>
    instance.encounters.map((encounter) => ({
      title: encounter.name,
      description: encounter.summary,
      href: `/${serverSlug}/raids/${instance.slug}#${instanceAnchorId(encounter.slug)}`,
      category: "Bosses",
      keywords: [instance.title, instance.slug, encounter.name, encounter.slug, encounter.role ?? "boss", encounter.summary, ...bossAliases(encounter.name)],
      priority: 100,
    })),
  );

  const serverResults: SearchCandidate[] = serverList.filter((server) => server.slug !== serverSlug).map((server) => ({
    title: server.name,
    description: server.description,
    href: `/${server.slug}`,
    category: "Servers",
    keywords: [...serverSearchKeywords(server), server.subtitle, server.flavor, server.iconBucket],
    priority: server.slug === serverSlug ? 95 : 45,
  }));

  const talentClasses = currentContext ? classListForClassIds(currentContext.talents.classIds) : classList;
  const talentResults: SearchCandidate[] = talentClasses.flatMap((cls) => {
    const tree = fallbackTalentTrees.classes[String(cls.id)];
    const classResult: SearchCandidate = {
      title: `${cls.name} talents`,
      description: `Plan ${cls.name} builds and talent points for the selected server.`,
      href: `/${serverSlug}/talents/${cls.slug}`,
      category: "Talents",
      keywords: [cls.name, cls.slug, "talents", "talent calculator", "class", "build", "spec", ...(tree?.tabs.map((tab) => tab.name) ?? [])],
      priority: 92,
    };
    const tabResults: SearchCandidate[] = tree?.tabs.map((tab) => ({
      title: `${cls.name} ${tab.name} talents`,
      description: `Plan ${tab.name} ${cls.name} talent builds.`,
      href: `/${serverSlug}/talents/${cls.slug}`,
      category: "Talents",
      keywords: [cls.name, cls.slug, tab.name, `${tab.name} spec`, "talents", "build", "spec", ...tab.talents.flatMap((talent) => [talent.name, talent.description ?? "", talent.effect ?? ""])],
      priority: 89,
    })) ?? [];
    return [classResult, ...tabResults];
  });

  return [...bossResults, ...guideResults, ...talentResults, ...staticResults, ...serverResults];
}

function scoreCandidate(candidate: SearchCandidate, terms: string[]) {
  const title = candidate.title.toLowerCase();
  const haystack = [candidate.title, candidate.description, candidate.category, ...candidate.keywords].join(" ").toLowerCase();
  if (!terms.every((term) => haystack.includes(term))) return 0;

  const titleMatches = terms.filter((term) => title.includes(term)).length;
  return candidate.priority + titleMatches * 25;
}

function searchTerms(query: string) {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

function stripPriority({ priority: _priority, ...result }: SearchCandidate): SearchResult {
  return result;
}

function serverSearchKeywords(server: (typeof serverList)[number]) {
  return [server.slug, server.name, server.shortName, server.subtitle, server.description, ...server.tags];
}

function unitExplorerKeywords() {
  return [
    ...Object.values(baseGuides).flatMap((guide) => guide.creatures.flatMap((creature) => [creature.name, creature.role, creature.notes, ...creature.spells.flatMap((spell) => [spell.name, spell.school ?? "", spell.notes ?? ""])])),
    ...Object.values(flavorPatches).flatMap((patches) => Object.values(patches).flatMap((patch) => [
      ...(patch.addCreatures?.flatMap((creature) => [creature.name, creature.role, creature.notes, ...creature.spells.flatMap((spell) => [spell.name, spell.school ?? "", spell.notes ?? ""])]) ?? []),
      ...(patch.addSpells?.flatMap((spell) => [spell.name, spell.notes ?? ""]) ?? []),
    ])),
    ...Object.values(serverPatches).flatMap((patches) => Object.values(patches).flatMap((patch) => [
      ...(patch.addCreatures?.flatMap((creature) => [creature.name, creature.role, creature.notes, ...creature.spells.flatMap((spell) => [spell.name, spell.school ?? "", spell.notes ?? ""])]) ?? []),
      ...(patch.addSpells?.flatMap((spell) => [spell.name, spell.notes ?? ""]) ?? []),
    ])),
  ];
}

function bossAliases(name: string) {
  const normalized = name.toLowerCase();
  if (normalized === "ragnaros") return ["rag", "firelord", "rags"];
  if (normalized === "baron geddon") return ["geddon", "living bomb", "baron"];
  if (normalized === "gehennas") return ["gehenas"];
  return [];
}
