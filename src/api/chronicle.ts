import { classList, fallbackTalentTrees, type ClassTalentData, type TalentTreeJSON } from "../data/talents";
import type { ResolvedServerContext, SpellRef } from "../types";
import { extractReferencedSpellIds, getEnglishText, resolvedSpellNotes, type WoWSpell } from "./wowdb";

export function apiUrl(context: ResolvedServerContext, path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${context.chronicle.baseUrl}${cleanPath}`;
}

async function normalizeTalentTreeData(context: ResolvedServerContext, data: TalentTreeJSON): Promise<TalentTreeJSON> {
  const spellIds = Array.from(new Set(
    Object.values(data.classes)
      .flatMap((classData) => classData.tabs ?? [])
      .flatMap((tab) => tab.talents ?? [])
      .flatMap((talent) => talent.spellRanks ?? []),
  ));
  const spellEntries = await Promise.all(spellIds.map(async (spellId) => [spellId, await fetchSpell(context, spellId)] as const));
  const spells = new Map(spellEntries.filter((entry): entry is readonly [number, SpellRef] => Boolean(entry[1])));

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
              talents: (tab.talents ?? []).map((talent) => {
                const rankSpells = (talent.spellRanks ?? []).map((spellId) => spells.get(spellId));
                const spellDescriptions = rankSpells.map((spell) => spell?.notes).filter((description): description is string => Boolean(description));
                const rankDescriptions = talent.rankDescriptions ?? talent.rankDescription ?? (Array.isArray(talent.effects) ? talent.effects : spellDescriptions);
                return {
                  ...talent,
                  name: talent.name ?? rankSpells[0]?.name ?? `Talent ${talent.id}`,
                  description: talent.description ?? talent.effect ?? (typeof talent.effects === "string" ? talent.effects : spellDescriptions[0]),
                  rankDescriptions,
                };
              }),
            })),
        };
        return [classId, normalizedClass];
      }),
    ),
  };
}

export async function fetchTalentTrees(context: ResolvedServerContext): Promise<{ data: TalentTreeJSON; source: "remote" | "fallback" }> {
  const url = apiUrl(context, "/api/v1/wowdb/talent-trees");
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as TalentTreeJSON;
    if (!data.classes || Object.keys(data.classes).length === 0) throw new Error("empty talent tree response");
    return { data: await normalizeTalentTreeData(context, data), source: "remote" };
  } catch {
    return { data: fallbackTalentTrees, source: "fallback" };
  }
}

async function fetchSpellRaw(context: ResolvedServerContext, spellId: number): Promise<WoWSpell | undefined> {
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

async function fetchReferencedSpells(context: ResolvedServerContext, spell: WoWSpell): Promise<Map<number, WoWSpell>> {
  const templates = [getEnglishText(spell.description), getEnglishText(spell.aura_description)];
  const referencedIds = Array.from(new Set(templates.flatMap(extractReferencedSpellIds))).filter((id) => id !== spell.id);
  const entries = await Promise.all(referencedIds.map(async (spellId) => [spellId, await fetchSpellRaw(context, spellId)] as const));
  return new Map(entries.filter((entry): entry is readonly [number, WoWSpell] => Boolean(entry[1])));
}

export async function fetchSpell(context: ResolvedServerContext, spellId: number): Promise<SpellRef | undefined> {
  const spell = await fetchSpellRaw(context, spellId);
  if (!spell) return undefined;
  const referencedSpells = await fetchReferencedSpells(context, spell);
  const name = getEnglishText(spell.name) || `Spell ${spellId}`;
  const notes = resolvedSpellNotes(spell, referencedSpells);
  return { id: spell.id ?? spellId, name, school: spell.school?.string, notes };
}
