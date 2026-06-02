import { fallbackTalentTrees, type TalentTreeJSON } from "../data/talents";
import type { ResolvedServerContext, SpellRef } from "../types";

export function apiUrl(context: ResolvedServerContext, path: string) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${context.server.chronicleBaseUrl}${cleanPath}`;
}

export async function fetchTalentTrees(context: ResolvedServerContext): Promise<{ data: TalentTreeJSON; source: "remote" | "fallback" }> {
  const url = apiUrl(context, "/api/v1/wowdb/talent-trees");
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as TalentTreeJSON;
    if (!data.classes || Object.keys(data.classes).length === 0) throw new Error("empty talent tree response");
    return { data, source: "remote" };
  } catch {
    return { data: fallbackTalentTrees, source: "fallback" };
  }
}

export async function fetchSpell(context: ResolvedServerContext, spellId: number): Promise<SpellRef | undefined> {
  if (spellId <= 0) return undefined;
  const url = apiUrl(context, `/api/v1/wowdb/spell/${spellId}`);
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const spell = await response.json() as { id?: number; name?: string | Record<string, string>; school?: { string?: string } };
    const name = typeof spell.name === "string" ? spell.name : spell.name?.["0"] ?? `Spell ${spellId}`;
    return { id: spell.id ?? spellId, name, school: spell.school?.string };
  } catch {
    return undefined;
  }
}
