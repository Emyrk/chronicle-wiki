import type { QueryClient } from "@tanstack/react-query";
import { classList, type ClassTalentData, type TalentTreeJSON } from "../data/talents";
import type { ResolvedServerContext, SpellRef } from "../types";
import { extractReferencedSpellIds, getEnglishText, resolvedSpellNotes, type WoWSpell } from "./wowdb";

const RECENT_RAID_LOG_API_LIMIT = 24;
const RECENT_RAID_LOG_CARD_LIMIT = 5;

export type RecentRaidLog = {
  id: string;
  slug: string;
  name: string;
  realmName: string;
  uploaderName: string;
  uploadedAt: string;
  firstEncounterTime: string;
  playerCount: number;
  bossCount: number;
  bossKills: number;
  durationMs: number;
};

type RecentRaidLogRecord = {
  id?: string;
  slug?: string;
  name?: string;
  realm_name?: string;
  uploader_name?: string;
  uploaded_at?: string;
  first_encounter_time?: string;
  player_count?: number;
  boss_count?: number;
  boss_kills?: number;
  duration_ms?: number;
};

type RecentRaidLogResponse = {
  instances?: RecentRaidLogRecord[];
};

const SPELL_CACHE_TIME = 30 * 60 * 1000;
const REFERENCED_SPELL_FETCH_CONCURRENCY = 4;

export function spellRecordQueryKey(context: ResolvedServerContext, spellId: number) {
  return ["chronicle", context.chronicle.baseUrl, "wowdb", "spell", spellId] as const;
}

export function talentTooltipSpellQueryKey(context: ResolvedServerContext, spellId: number) {
  return ["chronicle", context.chronicle.baseUrl, "wowdb", "spell-tooltip", spellId] as const;
}

export function apiUrl(context: ResolvedServerContext, path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${context.chronicle.baseUrl}${cleanPath}`;
}

export function bossSuccessRatesUrl(context: ResolvedServerContext, instanceName: string) {
  const params = new URLSearchParams({ instance_name: instanceName });
  return apiUrl(context, `/api/v1/rankings/success-rates?${params.toString()}`);
}

export function recentRaidLogsUrl(context: ResolvedServerContext, instanceName: string) {
  const params = new URLSearchParams({
    limit: String(RECENT_RAID_LOG_API_LIMIT),
    instance_name: instanceName,
  });
  return apiUrl(context, `/api/v1/raidlogs/recent?${params.toString()}`);
}

function normalizeRecentRaidLog(record: RecentRaidLogRecord): RecentRaidLog | null {
  if (!record.id || !record.slug) return null;
  return {
    id: record.id,
    slug: record.slug,
    name: record.name ?? "Raid log",
    realmName: record.realm_name ?? "Unknown realm",
    uploaderName: record.uploader_name ?? "Unknown recorder",
    uploadedAt: record.uploaded_at ?? "",
    firstEncounterTime: record.first_encounter_time ?? record.uploaded_at ?? "",
    playerCount: record.player_count ?? 0,
    bossCount: record.boss_count ?? 0,
    bossKills: record.boss_kills ?? 0,
    durationMs: record.duration_ms ?? 0,
  };
}

export async function fetchRecentRaidLogs(context: ResolvedServerContext, instanceName: string): Promise<RecentRaidLog[]> {
  const response = await fetch(recentRaidLogsUrl(context, instanceName));
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json() as RecentRaidLogResponse;
  return (data.instances ?? [])
    .map(normalizeRecentRaidLog)
    .filter((raid): raid is RecentRaidLog => Boolean(raid))
    .slice(0, RECENT_RAID_LOG_CARD_LIMIT);
}

function normalizeTalentTreeData(data: TalentTreeJSON): TalentTreeJSON {
  return {
    classes: Object.fromEntries(
      Object.entries(data.classes).map(([classId, classData]) => {
        const numericClassId = Number(classId);
        const knownClass = classList.find((cls) => cls.id === numericClassId);
        const normalizedClass: ClassTalentData = {
          ...classData,
          id: classData.id ?? numericClassId,
          name: classData.name ?? knownClass?.name ?? `Class ${classId}`,
          tabs: [...(classData.tabs ?? [])]
            .sort((left, right) => left.orderIndex - right.orderIndex)
            .map((tab) => ({
              ...tab,
              talents: (tab.talents ?? []).map((talent) => ({
                ...talent,
                name: talent.name ?? "",
                description: talent.description ?? talent.effect ?? (typeof talent.effects === "string" ? talent.effects : undefined),
                rankDescriptions: talent.rankDescriptions ?? talent.rankDescription ?? (Array.isArray(talent.effects) ? talent.effects : undefined),
              })),
            })),
        };
        return [classId, normalizedClass];
      }),
    ),
  };
}

export async function fetchTalentTrees(context: ResolvedServerContext): Promise<{ data: TalentTreeJSON | null; source: "remote" | "missing" }> {
  const url = apiUrl(context, "/api/v1/wowdb/talent-trees");
  const response = await fetch(url);
  if (response.status === 404) return { data: null, source: "missing" };
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = (await response.json()) as TalentTreeJSON;
  if (!data.classes || Object.keys(data.classes).length === 0) throw new Error("empty talent tree response");
  return { data: normalizeTalentTreeData(data), source: "remote" };
}

export async function fetchSpellRaw(context: ResolvedServerContext, spellId: number): Promise<WoWSpell | undefined> {
  if (spellId <= 0) return undefined;
  const url = apiUrl(context, `/api/v1/wowdb/spell/${spellId}`);
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const spell = await response.json() as WoWSpell;
    return { ...spell, id: spell.id ?? spellId };
  } catch {
    return undefined;
  }
}

async function mapWithConcurrency<T, U>(items: T[], limit: number, mapper: (item: T) => Promise<U>): Promise<U[]> {
  const results: U[] = [];
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }
  const workerCount = Math.min(Math.max(1, limit), items.length);
  await Promise.all(Array.from({ length: workerCount }, worker));
  return results;
}

async function fetchReferencedSpells(context: ResolvedServerContext, spell: WoWSpell): Promise<Map<number, WoWSpell>> {
  const templates = [getEnglishText(spell.description), getEnglishText(spell.aura_description)];
  const referencedIds = Array.from(new Set(templates.flatMap(extractReferencedSpellIds))).filter((id) => id !== spell.id);
  const entries = await mapWithConcurrency(
    referencedIds,
    REFERENCED_SPELL_FETCH_CONCURRENCY,
    async (spellId) => [spellId, await fetchSpellRaw(context, spellId)] as const,
  );
  return new Map(entries.filter((entry): entry is readonly [number, WoWSpell] => Boolean(entry[1])));
}

async function fetchCachedSpellRaw(queryClient: QueryClient, context: ResolvedServerContext, spellId: number): Promise<WoWSpell | null> {
  if (spellId <= 0) return null;
  return queryClient.fetchQuery({
    queryKey: spellRecordQueryKey(context, spellId),
    queryFn: async () => (await fetchSpellRaw(context, spellId)) ?? null,
    staleTime: Infinity,
    gcTime: SPELL_CACHE_TIME,
  });
}

async function fetchCachedReferencedSpells(queryClient: QueryClient, context: ResolvedServerContext, spell: WoWSpell): Promise<Map<number, WoWSpell>> {
  const templates = [getEnglishText(spell.description), getEnglishText(spell.aura_description)];
  const referencedIds = Array.from(new Set(templates.flatMap(extractReferencedSpellIds))).filter((id) => id !== spell.id);
  const entries = await mapWithConcurrency(
    referencedIds,
    REFERENCED_SPELL_FETCH_CONCURRENCY,
    async (spellId) => [spellId, await fetchCachedSpellRaw(queryClient, context, spellId)] as const,
  );
  return new Map(entries.filter((entry): entry is readonly [number, WoWSpell] => Boolean(entry[1])));
}

function spellRefFromRecord(spell: WoWSpell, spellId: number, referencedSpells?: Map<number, WoWSpell>): SpellRef {
  const name = getEnglishText(spell.name) || `Spell ${spellId}`;
  const notes = resolvedSpellNotes(spell, referencedSpells);
  return { id: spell.id ?? spellId, name, school: spell.school?.string, notes };
}

export async function fetchSpell(context: ResolvedServerContext, spellId: number): Promise<SpellRef | undefined> {
  const spell = await fetchSpellRaw(context, spellId);
  if (!spell) return undefined;
  const referencedSpells = await fetchReferencedSpells(context, spell);
  return spellRefFromRecord(spell, spellId, referencedSpells);
}

export async function fetchTalentTooltipSpell(queryClient: QueryClient, context: ResolvedServerContext, spellId: number): Promise<SpellRef | undefined> {
  const spell = await fetchCachedSpellRaw(queryClient, context, spellId);
  if (!spell) return undefined;
  const referencedSpells = await fetchCachedReferencedSpells(queryClient, context, spell);
  return spellRefFromRecord(spell, spellId, referencedSpells);
}

export async function prefetchTalentTooltipSpell(queryClient: QueryClient, context: ResolvedServerContext, spellId: number): Promise<void> {
  await fetchCachedSpellRaw(queryClient, context, spellId);
}
