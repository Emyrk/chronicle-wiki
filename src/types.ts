export type {
  Expansion,
  ResolvedWikiMetadata as ResolvedServerContext,
  WikiFlavorMetadata as WikiFlavor,
  WikiServerMetadata as WikiServer,
} from "@/data/metadata";


export interface SpellRef {
  id: number;
  name: string;
  school?: string;
  notes?: string;
}

export interface CreatureGuideEntry {
  id: number;
  name: string;
  role: string;
  notes: string;
  spells: SpellRef[];
}

export interface GuidePage {
  slug: string;
  title: string;
  raid: string;
  boss: string;
  summary: string;
  sections: Array<{ title: string; body: string[] }>;
  creatures: CreatureGuideEntry[];
  spellIds: number[];
  callouts?: Array<{ title: string; body: string; tone?: "info" | "warning" }>;
  sourceLabel: string;
}

export interface GuidePatch {
  summary?: string;
  addSections?: GuidePage["sections"];
  replaceSections?: Record<string, string[]>;
  addCreatures?: CreatureGuideEntry[];
  removeCreatureIds?: number[];
  addSpells?: SpellRef[];
  removeSpellIds?: number[];
  callouts?: GuidePage["callouts"];
  sourceLabel: string;
}
