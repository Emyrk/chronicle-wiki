export type I18nText = Record<string, string>;

export interface SpellDuration {
  ID: number;
  Duration: number;
  DurationPerLevel: number;
  MaxDuration: number;
}

export interface SpellRange {
  ID: number;
  RangeMin: number;
  RangeMax: number;
  Flags: number;
  Name: string;
}

export interface SpellRadius {
  ID: number;
  Radius: number;
  RadiusPerLevel: number;
  RadiusMin: number;
  RadiusMax: number;
}

export interface WoWSpell {
  id: number;
  name?: I18nText;
  description?: I18nText;
  aura_description?: I18nText;
  spell_level?: number;
  base_level?: number;
  max_level?: number;
  school?: { string?: string };
  duration?: SpellDuration;
  range?: SpellRange;
  effect_base_points?: number[];
  effect_die_sides?: number[];
  effect_base_dice?: number[];
  effect_dice_per_level?: number[];
  effect_real_points_per_level?: number[];
  effect_aura_period?: number[];
  effect_radius?: SpellRadius[];
  effect_amplitude?: number[];
  effect_chain_targets?: number[];
  effect_points_per_combo?: number[];
  proc_charges?: number;
  proc_chance?: number;
  cumulative_aura?: number;
  max_target_level?: number;
}

export function getEnglishText(text: I18nText | string | undefined): string {
  if (!text) return "";
  if (typeof text === "string") return text;
  return text["0"] || Object.values(text)[0] || "";
}

function formatDurationMs(ms: number): string {
  if (ms <= 0) return "0 sec";
  const seconds = ms / 1000;
  if (seconds >= 3600) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (mins === 0) return `${hours} hour${hours !== 1 ? "s" : ""}`;
    return `${hours} hour${hours !== 1 ? "s" : ""} ${mins} min`;
  }
  if (seconds >= 60) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (secs === 0) return `${mins} min`;
    return `${mins} min ${secs} sec`;
  }
  if (seconds < 10 && seconds !== Math.floor(seconds)) return `${seconds.toFixed(1)} sec`;
  return `${Math.floor(seconds)} sec`;
}

function getEffectiveLevel(spell: WoWSpell, forLevel: number): number {
  const maxLevel = spell.max_level || forLevel;
  return Math.max(0, Math.min(maxLevel, forLevel) - Math.max(spell.base_level ?? 0, spell.spell_level ?? 0));
}

function getScaledValue(spell: WoWSpell, index: number, forLevel: number, op?: (n: number) => number): number[] {
  if (index < 0 || index >= 3) return [0];
  const base = spell.effect_base_points?.[index] ?? 0;
  const baseDice = spell.effect_base_dice?.[index] ?? 0;
  const dieSides = spell.effect_die_sides?.[index] ?? 0;
  const dicePerLevel = spell.effect_dice_per_level?.[index] ?? 0;
  const realPointsPerLevel = spell.effect_real_points_per_level?.[index] ?? 0;
  const level = getEffectiveLevel(spell, forLevel);
  const diceCount = baseDice + dicePerLevel * level;
  const min = diceCount;
  const max = dieSides * diceCount;
  const scaling = realPointsPerLevel * level;
  const applyOp = (n: number) => {
    const abs = Math.abs(n);
    return op ? op(abs) : abs;
  };
  return max > min ? [applyOp(base + min + scaling), applyOp(base + max + scaling)] : [applyOp(base + min + scaling)];
}

function getPeriodicTotal(spell: WoWSpell, index: number, forLevel: number, op?: (n: number) => number): number[] {
  if (index < 0 || index >= 3) return [0];
  const values = getScaledValue(spell, index, forLevel, op);
  const amplitude = spell.effect_aura_period?.[index] ?? 0;
  const duration = spell.duration?.Duration ?? 0;
  if (amplitude <= 0 || duration <= 0) return values;
  const ticks = duration / amplitude;
  return values.map((value) => value * ticks);
}

function formatValue(values: number[], floating?: boolean): string {
  const format = (value: number) => (floating ? value.toFixed(1).replace(/\.0$/, "") : String(Math.floor(value)));
  return values.map(format).join(" to ");
}

function resolveVariable(spell: WoWSpell, variable: string, forLevel?: number): string {
  const level = forLevel ?? spell.spell_level ?? 1;

  if (variable === "$d") return formatDurationMs(spell.duration?.Duration ?? 0);

  const indexedMatch = variable.match(/^\$([a-zA-Z])(\d)$/);
  if (indexedMatch) {
    const type = indexedMatch[1].toLowerCase();
    const index = Number.parseInt(indexedMatch[2], 10) - 1;

    switch (type) {
      case "s":
      case "m":
        return formatValue(getScaledValue(spell, index, level));
      case "o":
        return formatValue(getPeriodicTotal(spell, index, level));
      case "t": {
        const period = spell.effect_aura_period?.[index] ?? 0;
        return period > 0 ? String(Math.round(period / 1000)) : "0";
      }
      case "a": {
        const radius = spell.effect_radius?.[index];
        return radius ? String(radius.Radius) : "0";
      }
      case "e":
        return String(spell.effect_amplitude?.[index] ?? 0);
      case "x":
        return String(spell.effect_chain_targets?.[index] ?? 0);
      case "b":
        return String(spell.effect_points_per_combo?.[index] ?? 0);
      case "d":
        return formatDurationMs(spell.duration?.Duration ?? 0);
      case "f":
        return String(spell.cumulative_aura || 0);
    }
  }

  switch (variable) {
    case "$n":
      return String(spell.proc_charges || 1);
    case "$h":
      return String(spell.proc_chance || 0);
    case "$r":
      return String(spell.range?.RangeMax || 0);
    case "$u":
      return String(spell.cumulative_aura || 0);
    case "$v":
      return String(spell.max_target_level || 0);
    case "$t": {
      const period = spell.effect_aura_period?.[0] ?? 0;
      return period > 0 ? String(Math.round(period / 1000)) : "0";
    }
    case "$z":
      return "[Home]";
    case "$c":
      return "the caster";
    case "$l":
      return variable;
    default:
      return variable;
  }
}

export function extractReferencedSpellIds(template: string): number[] {
  if (!template) return [];
  const ids = new Set<number>();
  const regex = /\$(\d+)([a-zA-Z])(\d)?/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(template)) !== null) ids.add(Number.parseInt(match[1], 10));
  return Array.from(ids);
}

function evaluateArithmetic(expression: string): number | null {
  if (!/^[\d+\-*/().\s]+$/.test(expression)) return null;
  try {
    const result = new Function(`return (${expression})`)() as unknown;
    if (typeof result !== "number" || !Number.isFinite(result)) return null;
    return Math.round(result);
  } catch {
    return null;
  }
}

export function resolveSpellDescription(
  spell: WoWSpell,
  template: string,
  referencedSpells?: Map<number, WoWSpell>,
  forLevel?: number,
): string {
  if (!template) return "";

  const level = forLevel ?? spell.spell_level ?? 1;
  let result = template;

  result = result.replace(/\$\*(\d+);([a-zA-Z])(\d)?/g, (match, multiplier, type, index) => {
    const factor = Number.parseInt(multiplier, 10);
    const tokenType = type.toLowerCase();
    const slot = index ? Number.parseInt(index, 10) - 1 : 0;
    if (tokenType === "s" || tokenType === "m") return formatValue(getScaledValue(spell, slot, level, (value) => value * factor));
    if (tokenType === "o") return formatValue(getPeriodicTotal(spell, slot, level, (value) => value * factor));
    const resolved = resolveVariable(spell, `$${type}${index || ""}`, level);
    const number = Number(resolved);
    if (Number.isNaN(number)) return match;
    const multiplied = number * factor;
    return Number.isInteger(multiplied) ? String(multiplied) : multiplied.toFixed(1).replace(/\.0$/, "");
  });

  result = result.replace(/\$\/(\d+);([a-zA-Z])(\d)?/g, (match, divisor, type, index) => {
    const denominator = Number.parseInt(divisor, 10);
    if (denominator === 0) return match;
    const tokenType = type.toLowerCase();
    const slot = index ? Number.parseInt(index, 10) - 1 : 0;
    if (tokenType === "s" || tokenType === "m") return formatValue(getScaledValue(spell, slot, level, (value) => value / denominator), true);
    if (tokenType === "o") return formatValue(getPeriodicTotal(spell, slot, level, (value) => value / denominator), true);
    const resolved = resolveVariable(spell, `$${type}${index || ""}`, level);
    const number = Number(resolved);
    if (Number.isNaN(number)) return match;
    const divided = number / denominator;
    return Number.isInteger(divided) ? String(divided) : divided.toFixed(1).replace(/\.0$/, "");
  });

  result = result.replace(/(-?)\$(\d+)([a-zA-Z])(\d)?/g, (match, negative, spellId, type, index) => {
    const referencedSpell = referencedSpells?.get(Number.parseInt(spellId, 10));
    if (!referencedSpell) return match;
    const resolved = resolveVariable(referencedSpell, `$${type}${index || ""}`, level);
    if (negative === "-" && !Number.isNaN(Number(resolved))) return String(-Math.abs(Number(resolved)));
    return resolved;
  });

  result = result.replace(/(-?)\$([a-zA-Z])(\d)?/g, (_match, negative, type, index) => {
    const resolved = resolveVariable(spell, `$${type}${index || ""}`, level);
    if (negative === "-" && !Number.isNaN(Number(resolved))) return String(-Math.abs(Number(resolved)));
    return resolved;
  });

  result = result.replace(/\$\{([^}]+)\}/g, (match, expression: string) => {
    const evaluated = evaluateArithmetic(expression);
    return evaluated !== null ? String(evaluated) : match;
  });

  result = result.replace(/\$l([^:]+):([^;]+);/g, (_match, singular, plural, offset) => {
    const before = result.substring(0, offset);
    const numberMatch = before.match(/(\d+)[^\d]*$/);
    if (numberMatch) return Number.parseInt(numberMatch[1], 10) === 1 ? singular : plural;
    return plural;
  });

  result = result.replace(/\$g([^:]+):([^;]+);/gi, (_match, male) => male);

  return result;
}

export function resolvedSpellNotes(spell: WoWSpell, referencedSpells?: Map<number, WoWSpell>): string | undefined {
  const description = resolveSpellDescription(spell, getEnglishText(spell.description), referencedSpells);
  if (description) return description;
  const auraDescription = resolveSpellDescription(spell, getEnglishText(spell.aura_description), referencedSpells);
  return auraDescription || undefined;
}
