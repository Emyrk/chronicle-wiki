export interface TalentEntry {
  id: number;
  name: string;
  tierID: number;
  columnIndex: number;
  maxRank: number;
  tabIndex: number;
  spellRanks: number[];
  iconTexture: string;
  prereqTalent?: number[];
  prereqRank?: number[];
  description?: string;
  effect?: string;
  effects?: string[] | string;
  rankDescriptions?: string[];
  rankDescription?: string[];
}

export interface TalentTabData {
  id: number;
  name: string;
  backgroundFile: string;
  orderIndex: number;
  iconTexture: string;
  talents: TalentEntry[];
}

export interface ClassTalentData {
  id: number;
  name: string;
  tabs: TalentTabData[];
}

export interface TalentTreeJSON {
  classes: Record<string, ClassTalentData>;
}

const sharedMageTabs: TalentTabData[] = [
  {
    id: 81,
    name: "Arcane",
    backgroundFile: "MageArcane",
    orderIndex: 0,
    iconTexture: "spell_holy_magicalsentry",
    talents: [
      { id: 1, name: "Arcane Subtlety", tierID: 0, columnIndex: 1, maxRank: 2, tabIndex: 0, spellRanks: [11210, 12592], iconTexture: "spell_holy_dispelmagic" },
      { id: 2, name: "Arcane Focus", tierID: 0, columnIndex: 2, maxRank: 5, tabIndex: 0, spellRanks: [11222, 12839, 12840, 12841, 12842], iconTexture: "spell_holy_devotion" },
      { id: 3, name: "Improved Arcane Missiles", tierID: 1, columnIndex: 1, maxRank: 5, tabIndex: 0, spellRanks: [11237, 12463, 12464, 16769, 16770], iconTexture: "spell_nature_starfall" },
      { id: 4, name: "Arcane Concentration", tierID: 2, columnIndex: 1, maxRank: 5, tabIndex: 0, spellRanks: [11213, 12574, 12575, 12576, 12577], iconTexture: "spell_shadow_manaburn" },
      { id: 5, name: "Presence of Mind", tierID: 4, columnIndex: 1, maxRank: 1, tabIndex: 0, spellRanks: [12043], iconTexture: "spell_nature_enchantarmor" },
    ],
  },
  {
    id: 41,
    name: "Fire",
    backgroundFile: "MageFire",
    orderIndex: 1,
    iconTexture: "spell_fire_firebolt02",
    talents: [
      { id: 6, name: "Improved Fireball", tierID: 0, columnIndex: 1, maxRank: 5, tabIndex: 1, spellRanks: [11069, 12338, 12339, 12340, 12341], iconTexture: "spell_fire_flamebolt" },
      { id: 7, name: "Ignite", tierID: 1, columnIndex: 1, maxRank: 5, tabIndex: 1, spellRanks: [11119, 11120, 12846, 12847, 12848], iconTexture: "spell_fire_incinerate" },
      { id: 8, name: "Pyroblast", tierID: 2, columnIndex: 1, maxRank: 1, tabIndex: 1, spellRanks: [11366], iconTexture: "spell_fire_fireball02" },
      { id: 9, name: "Blast Wave", tierID: 4, columnIndex: 1, maxRank: 1, tabIndex: 1, spellRanks: [11113], iconTexture: "spell_holy_excorcism_02" },
    ],
  },
  {
    id: 61,
    name: "Frost",
    backgroundFile: "MageFrost",
    orderIndex: 2,
    iconTexture: "spell_frost_frostbolt02",
    talents: [
      { id: 10, name: "Improved Frostbolt", tierID: 0, columnIndex: 1, maxRank: 5, tabIndex: 2, spellRanks: [11070, 12473, 16763, 16765, 16766], iconTexture: "spell_frost_frostbolt02" },
      { id: 11, name: "Ice Shards", tierID: 1, columnIndex: 1, maxRank: 5, tabIndex: 2, spellRanks: [11207, 12672, 15047, 15052, 15053], iconTexture: "spell_frost_iceshard" },
      { id: 12, name: "Cold Snap", tierID: 2, columnIndex: 1, maxRank: 1, tabIndex: 2, spellRanks: [12472], iconTexture: "spell_frost_wizardmark" },
      { id: 13, name: "Ice Barrier", tierID: 6, columnIndex: 1, maxRank: 1, tabIndex: 2, spellRanks: [11426], iconTexture: "spell_ice_lament" },
    ],
  },
];

const sharedWarriorTabs: TalentTabData[] = [
  {
    id: 161,
    name: "Arms",
    backgroundFile: "WarriorArms",
    orderIndex: 0,
    iconTexture: "ability_warrior_savageblow",
    talents: [
      { id: 20, name: "Improved Heroic Strike", tierID: 0, columnIndex: 1, maxRank: 3, tabIndex: 0, spellRanks: [12282, 12663, 12664], iconTexture: "ability_rogue_ambush" },
      { id: 21, name: "Deflection", tierID: 0, columnIndex: 2, maxRank: 5, tabIndex: 0, spellRanks: [16462, 16463, 16464, 16465, 16466], iconTexture: "ability_parry" },
      { id: 22, name: "Sweeping Strikes", tierID: 4, columnIndex: 1, maxRank: 1, tabIndex: 0, spellRanks: [12292], iconTexture: "ability_rogue_slicedice" },
    ],
  },
  {
    id: 163,
    name: "Fury",
    backgroundFile: "WarriorFury",
    orderIndex: 1,
    iconTexture: "ability_warrior_innerrage",
    talents: [
      { id: 23, name: "Cruelty", tierID: 0, columnIndex: 1, maxRank: 5, tabIndex: 1, spellRanks: [12320, 12852, 12853, 12855, 12856], iconTexture: "ability_rogue_eviscerate" },
      { id: 24, name: "Piercing Howl", tierID: 2, columnIndex: 1, maxRank: 1, tabIndex: 1, spellRanks: [12323], iconTexture: "spell_shadow_deathscream" },
      { id: 25, name: "Bloodthirst", tierID: 6, columnIndex: 1, maxRank: 1, tabIndex: 1, spellRanks: [23881], iconTexture: "spell_nature_bloodlust" },
    ],
  },
  {
    id: 164,
    name: "Protection",
    backgroundFile: "WarriorProtection",
    orderIndex: 2,
    iconTexture: "ability_warrior_defensivestance",
    talents: [
      { id: 26, name: "Shield Specialization", tierID: 0, columnIndex: 1, maxRank: 5, tabIndex: 2, spellRanks: [12298, 12724, 12725, 12726, 12727], iconTexture: "inv_shield_06" },
      { id: 27, name: "Last Stand", tierID: 2, columnIndex: 1, maxRank: 1, tabIndex: 2, spellRanks: [12975], iconTexture: "spell_holy_ashestoashes" },
      { id: 28, name: "Shield Slam", tierID: 6, columnIndex: 1, maxRank: 1, tabIndex: 2, spellRanks: [23922], iconTexture: "inv_shield_05" },
    ],
  },
];

const sharedDeathKnightTabs: TalentTabData[] = [
  {
    id: 398,
    name: "Blood",
    backgroundFile: "DeathKnightBlood",
    orderIndex: 0,
    iconTexture: "spell_deathknight_bloodpresence",
    talents: [
      { id: 100, name: "Butchery", tierID: 0, columnIndex: 0, maxRank: 2, tabIndex: 0, spellRanks: [48979, 49483], iconTexture: "inv_axe_68" },
      { id: 101, name: "Subversion", tierID: 0, columnIndex: 1, maxRank: 3, tabIndex: 0, spellRanks: [48997, 49490, 49491], iconTexture: "spell_deathknight_subversion" },
      { id: 102, name: "Blade Barrier", tierID: 0, columnIndex: 2, maxRank: 5, tabIndex: 0, spellRanks: [49182, 49500, 49501, 55225, 55226], iconTexture: "ability_upgrademoonglaive" },
      { id: 103, name: "Rune Tap", tierID: 2, columnIndex: 1, maxRank: 1, tabIndex: 0, spellRanks: [48982], iconTexture: "spell_deathknight_runetap" },
      { id: 104, name: "Hysteria", tierID: 6, columnIndex: 1, maxRank: 1, tabIndex: 0, spellRanks: [49016], iconTexture: "spell_deathknight_bladedarmor" },
      { id: 105, name: "Heart Strike", tierID: 10, columnIndex: 1, maxRank: 1, tabIndex: 0, spellRanks: [55050], iconTexture: "inv_weapon_shortblade_40" },
    ],
  },
  {
    id: 399,
    name: "Frost",
    backgroundFile: "DeathKnightFrost",
    orderIndex: 1,
    iconTexture: "spell_deathknight_frostpresence",
    talents: [
      { id: 110, name: "Improved Icy Touch", tierID: 0, columnIndex: 1, maxRank: 3, tabIndex: 1, spellRanks: [49175, 50031, 51456], iconTexture: "spell_deathknight_icetouch" },
      { id: 111, name: "Toughness", tierID: 0, columnIndex: 2, maxRank: 5, tabIndex: 1, spellRanks: [49042, 49786, 49787, 49788, 49789], iconTexture: "spell_holy_devotion" },
      { id: 112, name: "Lichborne", tierID: 2, columnIndex: 1, maxRank: 1, tabIndex: 1, spellRanks: [49039], iconTexture: "spell_shadow_raisedead" },
      { id: 113, name: "Howling Blast", tierID: 10, columnIndex: 1, maxRank: 1, tabIndex: 1, spellRanks: [49184], iconTexture: "spell_frost_arcticwinds" },
    ],
  },
  {
    id: 400,
    name: "Unholy",
    backgroundFile: "DeathKnightUnholy",
    orderIndex: 2,
    iconTexture: "spell_deathknight_unholypresence",
    talents: [
      { id: 120, name: "Vicious Strikes", tierID: 0, columnIndex: 1, maxRank: 2, tabIndex: 2, spellRanks: [51745, 51746], iconTexture: "spell_deathknight_plaguestrike" },
      { id: 121, name: "Virulence", tierID: 0, columnIndex: 2, maxRank: 3, tabIndex: 2, spellRanks: [48962, 49567, 49568], iconTexture: "spell_shadow_burningspirit" },
      { id: 122, name: "Master of Ghouls", tierID: 2, columnIndex: 1, maxRank: 1, tabIndex: 2, spellRanks: [52143], iconTexture: "spell_shadow_animatedead" },
      { id: 123, name: "Summon Gargoyle", tierID: 10, columnIndex: 1, maxRank: 1, tabIndex: 2, spellRanks: [49206], iconTexture: "ability_hunter_pet_bat" },
    ],
  },
];

export const fallbackTalentTrees: TalentTreeJSON = {
  classes: {
    "1": { id: 1, name: "Warrior", tabs: sharedWarriorTabs },
    "6": { id: 6, name: "Death Knight", tabs: sharedDeathKnightTabs },
    "8": { id: 8, name: "Mage", tabs: sharedMageTabs },
  },
};

export const classList = [
  { id: 1, slug: "warrior", name: "Warrior", iconTexture: "inv_sword_27" },
  { id: 2, slug: "paladin", name: "Paladin", iconTexture: "spell_holy_sealofmight" },
  { id: 3, slug: "hunter", name: "Hunter", iconTexture: "inv_weapon_bow_07" },
  { id: 4, slug: "rogue", name: "Rogue", iconTexture: "ability_backstab" },
  { id: 5, slug: "priest", name: "Priest", iconTexture: "inv_staff_30" },
  { id: 6, slug: "death-knight", name: "Death Knight", iconTexture: "spell_deathknight_classicon" },
  { id: 7, slug: "shaman", name: "Shaman", iconTexture: "spell_nature_bloodlust" },
  { id: 8, slug: "mage", name: "Mage", iconTexture: "inv_staff_13" },
  { id: 9, slug: "warlock", name: "Warlock", iconTexture: "spell_nature_faeriefire" },
  { id: 11, slug: "druid", name: "Druid", iconTexture: "inv_misc_monsterclaw_04" },
];

export function classFromSlug(slug: string | undefined) {
  if (!slug) return undefined;
  return classList.find((cls) => cls.slug === slug.toLowerCase());
}

export function classListForClassIds(classIds: number[]) {
  const supported = new Set(classIds);
  return classList.filter((cls) => supported.has(cls.id));
}

export function classIdFromSlug(slug: string | undefined, classIds = classList.map((cls) => cls.id)) {
  if (!slug) return classIds.includes(8) ? 8 : classIds[0];
  const cls = classFromSlug(slug);
  if (!cls || !classIds.includes(cls.id)) return undefined;
  return cls.id;
}
