export type Expansion = "vanilla" | "tbc" | "wotlk";

export interface WikiServer {
  slug: string;
  name: string;
  shortName: string;
  subtitle: string;
  description: string;
  status?: "open" | "closed" | "archived";
  tags: string[];
  chronicleBaseUrl: string;
  websiteUrl?: string;
  logoUrl: string;
  bannerUrl: string;
  flavor: string;
  theme: {
    primary: string;
    accent: string;
  };
}

export interface WikiFlavor {
  slug: string;
  name: string;
  expansion: Expansion;
  clientVersion: string;
  defaultDatasetId?: string;
  maxLevel: number;
  maxTalentPoints: number;
  fallbackFlavor?: string;
}

export interface ResolvedServerContext {
  server: WikiServer;
  flavor: WikiFlavor;
}

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
