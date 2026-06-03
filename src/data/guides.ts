import type { CreatureGuideEntry, GuidePage, GuidePatch } from "@/types";
import { getRaidInstance } from "./instances";
import { resolveWikiMetadata } from "./servers";

// Strategy sources, rewritten into Chronicle copy:
// https://www.wowhead.com/classic/guide/molten-core-raid-overview-wow-classic
// https://www.icy-veins.com/wow-classic/molten-core-raid-guides
// https://www.icy-veins.com/wow-classic/lucifron-guide-strategy-abilities-loot
// https://www.icy-veins.com/wow-classic/magmadar-guide-strategy-abilities-loot
// https://www.icy-veins.com/wow-classic/gehennas-guide-strategy-abilities-loot
// https://www.icy-veins.com/wow-classic/garr-guide-strategy-abilities-loot
// https://www.icy-veins.com/wow-classic/shazzrah-guide-strategy-abilities-loot
// https://www.icy-veins.com/wow-classic/baron-geddon-guide-strategy-abilities-loot
// https://www.icy-veins.com/wow-classic/golemagg-the-incinerator-guide-strategy-abilities-loot
// https://www.icy-veins.com/wow-classic/sulfuron-harbinger-guide-strategy-abilities-loot
// https://www.icy-veins.com/wow-classic/majordomo-executus-guide-strategy-abilities-loot
// https://www.icy-veins.com/wow-classic/ragnaros-guide-strategy-abilities-loot

function creature(id: number, name: string, role: string, notes: string, spells: CreatureGuideEntry["spells"] = []): CreatureGuideEntry {
  return { id, name, role, notes, spells };
}

function bossGuide(input: {
  slug: string;
  title: string;
  summary: string;
  spellIds: number[];
  creatures: CreatureGuideEntry[];
  quickPlan: string[];
  abilities: string[];
  roleNotes: string[];
  wipeRisks: string[];
}): GuidePage {
  return {
    slug: `raids/molten-core/${input.slug}`,
    title: input.title,
    raid: "Molten Core",
    boss: input.slug,
    summary: input.summary,
    sourceLabel: "Legacy Vanilla",
    spellIds: input.spellIds,
    creatures: input.creatures,
    sections: [
      { title: "Quick plan", body: input.quickPlan },
      { title: "Important abilities", body: input.abilities },
      { title: "Role notes", body: input.roleNotes },
      { title: "Common wipe risks", body: input.wipeRisks },
    ],
  };
}

export const baseGuides: Record<string, GuidePage> = {
  "legacy/raids/molten-core/lucifron": bossGuide({
    slug: "lucifron",
    title: "Lucifron",
    summary: "Lucifron opens Molten Core with two Flamewaker Protectors, repeated Magic debuffs, and a curse that punishes slow cleanup.",
    spellIds: [20604, 19702, 19703],
    creatures: [
      creature(12118, "Lucifron", "Boss", "Opening Flamewaker boss. Keep dispels and decurses moving while the adds die.", [
        { id: 19702, name: "Lucifron's Curse", school: "Shadow", notes: "Curse that makes spell use expensive. Mages and Druids remove it quickly." },
        { id: 19703, name: "Impending Doom", school: "Shadow", notes: "Magic damage over time. Priests dispel it before it rolls through the raid." },
      ]),
      creature(12119, "Flamewaker Protector", "Add", "Two adds accompany Lucifron and can mind-control players.", [
        { id: 20604, name: "Dominate Mind", school: "Shadow", notes: "Magic control effect. Priests remove it immediately." },
      ]),
    ],
    quickPlan: [
      "Clear nearby core hounds, then pull Lucifron with both Flamewaker Protectors controlled by assigned tanks.",
      "Kill the Protectors first, keep every target faced away, and finish Lucifron after the add pressure ends.",
    ],
    abilities: [
      "Dominate Mind turns a player hostile until a Priest dispels it.",
      "Lucifron's Curse slows casters and healers badly if Mages and Druids fall behind.",
      "Impending Doom is a Magic debuff that should be removed before it becomes free raid damage.",
    ],
    roleNotes: [
      "Tanks split Lucifron and his two adds, then keep frontal attacks away from the raid.",
      "Healers prioritize debuff cleanup and add tanks until the Protectors die.",
      "DPS kills Protectors first. Mages decurse before chasing meters.",
    ],
    wipeRisks: [
      "Loose Protectors cleave or mind-control the raid.",
      "Missed curse and Magic dispels turn a simple pull into a healer collapse.",
    ],
  }),

  "legacy/raids/molten-core/magmadar": bossGuide({
    slug: "magmadar",
    title: "Magmadar",
    summary: "Magmadar is a single core hound boss where Hunter Tranq Shot and tank fear recovery carry the fight.",
    spellIds: [19451, 19408],
    creatures: [
      creature(11982, "Magmadar", "Boss", "Core hound boss after Lucifron. Frenzy removal is the pull's main check.", [
        { id: 19451, name: "Frenzy", school: "Physical", notes: "Attack-speed enrage. Hunters remove it with Tranquilizing Shot." },
        { id: 19408, name: "Panic", school: "Shadow", notes: "Fear effect that can move the tank or nearby players out of control." },
      ]),
    ],
    quickPlan: [
      "Clear the core hound room, then tank Magmadar faced away from the raid.",
      "Hunters remove every Frenzy. Ranged and healers stay at range while melee returns after fears.",
    ],
    abilities: [
      "Frenzy makes Magmadar hit far faster until a Hunter removes it.",
      "Panic fears nearby players. Tank recovery matters more than perfect damage uptime.",
    ],
    roleNotes: [
      "Tank keeps the boss steady and uses fear tools when available.",
      "Healers keep the tank safe through fear windows and Frenzy mistakes.",
      "Hunters rotate Tranquilizing Shot. DPS stays behind the boss and avoids dragging threat during fears.",
    ],
    wipeRisks: [
      "Frenzy stays up and crushes the tank.",
      "A fear sends the tank or melee through uncleared trash.",
    ],
  }),

  "legacy/raids/molten-core/gehennas": bossGuide({
    slug: "gehennas",
    title: "Gehennas",
    summary: "Gehennas pairs two Flamewaker adds with a healing-reduction curse and Rain of Fire movement checks.",
    spellIds: [19716, 19717, 20277],
    creatures: [
      creature(12259, "Gehennas", "Boss", "Flamewaker boss that punishes stacked players and missed decurses.", [
        { id: 19716, name: "Gehennas' Curse", school: "Shadow", notes: "Curse that reduces healing received. Remove it quickly, especially from tanks." },
        { id: 19717, name: "Rain of Fire", school: "Fire", notes: "Ground damage. Move out immediately." },
      ]),
      creature(11661, "Flamewaker", "Add", "Two adds should die before Gehennas.", [
        { id: 20277, name: "Fist of Ragnaros", school: "Fire", notes: "Short-range stun that disrupts melee and tanks." },
      ]),
    ],
    quickPlan: [
      "Assign one tank to Gehennas and one tank to each Flamewaker.",
      "Kill both adds first, remove Gehennas' Curse quickly, and move out of Rain of Fire immediately.",
    ],
    abilities: [
      "Gehennas' Curse reduces healing taken and is most dangerous on tanks or players already low.",
      "Rain of Fire creates avoidable ground damage. Do not finish a cast inside it.",
      "Flamewaker stuns make messy pulls worse if adds are not controlled.",
    ],
    roleNotes: [
      "Tanks face Gehennas and adds away from the raid.",
      "Mages and Druids keep curses off high-risk players.",
      "DPS kills Flamewakers one at a time before swapping to Gehennas.",
    ],
    wipeRisks: [
      "Cursed tanks receive weak healing during add damage.",
      "Players stand in Rain of Fire because the fight feels simple.",
    ],
  }),

  "legacy/raids/molten-core/garr": bossGuide({
    slug: "garr",
    title: "Garr",
    summary: "Garr is an elemental add-control fight where banishes, tank assignments, and controlled Firesworn deaths decide the pull.",
    spellIds: [19492, 19514, 19496],
    creatures: [
      creature(12057, "Garr", "Boss", "Elemental boss built around add control, dispels, and stable raid damage.", [
        { id: 19492, name: "Antimagic Pulse", school: "Arcane", notes: "Raid-wide pulse that can remove Magic effects." },
        { id: 19514, name: "Magma Shackles", school: "Fire", notes: "Movement pressure and raid damage." },
      ]),
      creature(12099, "Firesworn", "Add", "Eight adds start with Garr. Banish, tank, and kill them deliberately.", [
        { id: 19496, name: "Eruption", school: "Fire", notes: "Explosion when an add dies. Keep deaths away from the raid." },
      ]),
    ],
    quickPlan: [
      "Mark every Firesworn and assign each one to a Warlock banish or a tank before the pull.",
      "Burn Garr first if add control is stable, then kill Firesworn one at a time away from the raid.",
    ],
    abilities: [
      "Firesworn Eruption makes uncontrolled add deaths lethal near the raid.",
      "Antimagic Pulse and Magma Shackles add raid pressure while tanks and Warlocks keep targets stable.",
    ],
    roleNotes: [
      "Tanks hold Garr and any unbanished Firesworn with clear spacing between targets.",
      "Healers track many small tank assignments instead of one obvious danger target.",
      "Warlocks maintain banishes. DPS follows the add kill order after Garr dies.",
    ],
    wipeRisks: [
      "A banish breaks without a tank ready.",
      "Multiple Firesworn die near the raid or at the same time.",
    ],
  }),

  "legacy/raids/molten-core/shazzrah": bossGuide({
    slug: "shazzrah",
    title: "Shazzrah",
    summary: "Shazzrah is a fast arcane fight where purge, decurse, and teleport recovery matter more than a long plan.",
    spellIds: [19712, 19713, 19714, 23138],
    creatures: [
      creature(12264, "Shazzrah", "Boss", "Arcane Flamewaker boss with teleports and high nearby damage.", [
        { id: 19712, name: "Arcane Explosion", school: "Arcane", notes: "Heavy damage around Shazzrah. Move away after teleports." },
        { id: 19713, name: "Shazzrah's Curse", school: "Arcane", notes: "Curse that amplifies Magic damage. Remove it quickly." },
        { id: 19714, name: "Deaden Magic", school: "Arcane", notes: "Self-buff that reduces Magic damage taken. Priests purge it." },
        { id: 23138, name: "Blink", school: "Arcane", notes: "Teleport and threat reset. Tanks must regain control fast." },
      ]),
    ],
    quickPlan: [
      "Tank Shazzrah away from the raid, then recover quickly whenever he teleports.",
      "Priests purge Deaden Magic, Mages and Druids decurse, and nearby players move out after every Blink.",
    ],
    abilities: [
      "Arcane Explosion punishes anyone near Shazzrah after a teleport.",
      "Deaden Magic should be purged so caster damage keeps working.",
      "Shazzrah's Curse makes Arcane damage far more dangerous until removed.",
      "Blink resets threat and forces the raid to re-form around the new location.",
    ],
    roleNotes: [
      "Tanks stay ready to pick Shazzrah up after each Blink.",
      "Priests purge the boss. Mages and Druids clean curses from the raid.",
      "Ranged spread out and move if Shazzrah appears nearby.",
    ],
    wipeRisks: [
      "A teleport puts Shazzrah on top of ranged players and nobody moves.",
      "Deaden Magic stays active while curses make Arcane Explosion lethal.",
    ],
  }),

  "legacy/raids/molten-core/baron-geddon": bossGuide({
    slug: "baron-geddon",
    title: "Baron Geddon",
    summary: "Baron Geddon is a burn fight where Living Bomb discipline and Mana debuff cleanup prevent the obvious wipe.",
    spellIds: [20475, 19659, 19695],
    creatures: [
      creature(12056, "Baron Geddon", "Boss", "Patrolling elemental boss with one raid-wiping personal mechanic.", [
        { id: 20475, name: "Living Bomb", school: "Fire", notes: "Target runs away before exploding, then returns." },
        { id: 19659, name: "Ignite Mana", school: "Fire", notes: "Magic debuff that burns Mana and should be dispelled." },
        { id: 19695, name: "Inferno", school: "Fire", notes: "Pulsing damage around the boss. Melee leave until it ends." },
      ]),
    ],
    quickPlan: [
      "Pull Baron into clear space and give Living Bomb targets a simple run-out direction.",
      "Burn the boss, dispel Ignite Mana, and have melee leave during Inferno.",
    ],
    abilities: [
      "Living Bomb marks one player who must leave the group before exploding.",
      "Inferno forces melee away from the boss until the channel ends.",
      "Ignite Mana drains casters and healers if Priests do not dispel it.",
    ],
    roleNotes: [
      "Tank keeps Baron in heal range while leaving room for bomb targets.",
      "Healers top the Living Bomb target and dispel Ignite Mana.",
      "DPS uses strong damage early. Melee runs during Inferno instead of gambling.",
    ],
    wipeRisks: [
      "Living Bomb explodes in the raid.",
      "Melee greeds through Inferno or healers run out of Mana from missed dispels.",
    ],
  }),

  "legacy/raids/molten-core/golemagg-the-incinerator": bossGuide({
    slug: "golemagg-the-incinerator",
    title: "Golemagg the Incinerator",
    summary: "Golemagg is a tank-control fight where the Core Hounds stay alive and all damage goes into the boss.",
    spellIds: [13879, 20228],
    creatures: [
      creature(11988, "Golemagg the Incinerator", "Boss", "Magma giant with stacking melee pressure.", [
        { id: 13879, name: "Magma Splash", school: "Fire", notes: "Stacking debuff on melee attackers. Boss tanks swap when stacks climb." },
      ]),
      creature(11673, "Core Rager", "Add", "Two hounds are held away for the entire encounter, not killed.", [
        { id: 20228, name: "Ancient Dread", school: "Shadow", notes: "Pressure on the assigned hound tanks." },
      ]),
    ],
    quickPlan: [
      "Hold each Core Hound away from Golemagg and face them away from the raid.",
      "DPS ignores the hounds. Golemagg tanks swap when Magma Splash stacks become unsafe.",
    ],
    abilities: [
      "Magma Splash stacks on players attacking Golemagg in melee and drives tank swaps.",
      "The Core Hounds stay active, so hound tanks and healers need their own attention.",
    ],
    roleNotes: [
      "Two tanks rotate Golemagg. Two more tanks hold the hounds away from the raid.",
      "Healers split coverage across spread tanks and watch the swap moment.",
      "DPS stays on Golemagg and does not cleave the hounds down.",
    ],
    wipeRisks: [
      "The inactive boss tank attacks too early and stacks Magma Splash before taunting.",
      "A hound faces the raid or healers lose track of a side tank.",
    ],
  }),

  "legacy/raids/molten-core/sulfuron-harbinger": bossGuide({
    slug: "sulfuron-harbinger",
    title: "Sulfuron Harbinger",
    summary: "Sulfuron Harbinger is an add fight where target separation and Dark Mending interrupts keep the pull clean.",
    spellIds: [19779, 19775],
    creatures: [
      creature(12098, "Sulfuron Harbinger", "Boss", "Flamewaker leader who empowers nearby adds.", [
        { id: 19779, name: "Inspire", school: "Fire", notes: "Buffs nearby adds. Keep Sulfuron away from them." },
      ]),
      creature(11662, "Flamewaker Priest", "Healer add", "Four healer adds must be separated and killed one at a time.", [
        { id: 19775, name: "Dark Mending", school: "Shadow", notes: "Large heal. Interrupt it on the active kill target." },
      ]),
    ],
    quickPlan: [
      "Separate Sulfuron, the waiting adds, and the current kill target into clear groups.",
      "Kill adds one at a time, interrupt Dark Mending, then finish Sulfuron after the last add dies.",
    ],
    abilities: [
      "Inspire makes nearby adds much stronger, so the boss should not sit with them.",
      "Dark Mending can undo progress unless the active add is interrupted.",
    ],
    roleNotes: [
      "Tanks split Sulfuron, idle adds, and the marked kill target.",
      "Healers assign coverage because tanks are spread out.",
      "DPS follows marks and melee interrupts every Dark Mending cast on the active add.",
    ],
    wipeRisks: [
      "Adds stand close enough to heal or receive Inspire.",
      "Interrupts miss and the same add gets healed repeatedly.",
    ],
  }),

  "legacy/raids/molten-core/majordomo-executus": bossGuide({
    slug: "majordomo-executus",
    title: "Majordomo Executus",
    summary: "Majordomo Executus is an eight-add control encounter where the raid defeats his guards instead of killing him.",
    spellIds: [20619, 20229],
    creatures: [
      creature(12018, "Majordomo Executus", "Encounter leader", "The encounter ends when his Flamewaker guards are defeated.", [
        { id: 20619, name: "Teleport", school: "Fire", notes: "Moves a player into the center hazard. Leave quickly." },
      ]),
      creature(11664, "Flamewaker Elite", "Elite add", "Larger adds that should die before healer adds.", [
        { id: 20229, name: "Magic Reflection", school: "Arcane", notes: "Reflects spell damage. Casters stop while it is active." },
      ]),
      creature(11663, "Flamewaker Healer", "Healer add", "Smaller adds controlled at the start, then killed after Elites."),
    ],
    quickPlan: [
      "Control the healer adds, pull Elite adds away from them, and kill marked Elites one at a time.",
      "After the Elites die, pick up the healers, keep marks clear, and stop casting into Magic Reflection.",
    ],
    abilities: [
      "Magic Reflection punishes casters who keep firing into reflected targets.",
      "Teleport drops players into a center hazard and demands quick movement out.",
      "Healer adds become dangerous if control breaks while Elites are still active.",
    ],
    roleNotes: [
      "Tanks pick up Majordomo and the Elite adds while staying ready for broken control.",
      "Mages control healer adds at the start and refresh carefully.",
      "DPS kills marked Elites first, then healer adds. Casters watch reflection timers.",
    ],
    wipeRisks: [
      "AoE breaks control before tanks are ready.",
      "Casters ignore Magic Reflection or players stay in the center after Teleport.",
    ],
  }),

  "legacy/raids/molten-core/ragnaros": bossGuide({
    slug: "ragnaros",
    title: "Ragnaros",
    summary: "Ragnaros ends Molten Core with a short burn window, knockback recovery, spread ranged groups, and Son of Flame control.",
    spellIds: [20566, 21154, 19780],
    creatures: [
      creature(11502, "Ragnaros", "Final boss", "The Firelord is spawned after Majordomo and fights from the lava ring.", [
        { id: 20566, name: "Wrath of Ragnaros", school: "Fire", notes: "Knocks back nearby players. Melee leave before the cast." },
        { id: 21154, name: "Lava Burst", school: "Fire", notes: "Hits a ranged target and nearby players. Spread out." },
      ]),
      creature(12143, "Son of Flame", "Submerge add", "Adds that spawn if Ragnaros submerges.", [
        { id: 19780, name: "Hand of Ragnaros", school: "Fire", notes: "Control and kill Sons quickly during submerge." },
      ]),
    ],
    quickPlan: [
      "Open with both tanks ready in front, melee behind, and ranged groups spread around the room.",
      "Burn hard before the first submerge. If Sons spawn, control them quickly and return to Ragnaros.",
    ],
    abilities: [
      "Wrath of Ragnaros knocks back nearby players, so melee leaves before the timer and tanks recover threat.",
      "Lava Burst punishes stacked ranged players. Keep spacing stable for the whole phase.",
      "Sons of Flame spawn during submerge and must be controlled before they reach casters.",
    ],
    roleNotes: [
      "Two tanks stand ready so a knockback does not leave Ragnaros loose.",
      "Healers keep ranged groups alive through Fire damage and maintain tank coverage.",
      "Melee watches Wrath timers. Ranged spreads and swaps to Sons immediately if submerge happens.",
    ],
    wipeRisks: [
      "Melee eats Wrath and loses threat control for the raid.",
      "Ranged stacks too tightly or Sons run into healers during submerge.",
    ],
  }),
};

export const flavorPatches: Record<string, Record<string, GuidePatch>> = {
  "nightmares-of-ursol": {
    "raids/molten-core/garr": {
      sourceLabel: "Nightmares of Ursol",
      summary: "Turtle-style servers start from the Legacy Garr plan, then add Nightmares of Ursol differences where the fight diverges.",
      callouts: [
        {
          title: "Check your realm",
          body: "Turtle, Octo, and other Nightmares of Ursol realms can share a guide family while still differing in exact spell behavior.",
          tone: "warning",
        },
      ],
      addSections: [
        {
          title: "Nightmares of Ursol notes",
          body: [
            "Treat the Legacy assignments as the starting point, then adjust for any realm-specific Garr and Firesworn behavior your raid sees.",
            "Keep add control, dispels, and kill timing explicit so raid leaders can adapt the plan quickly.",
          ],
        },
      ],
      addSpells: [{ id: 0, name: "Realm-specific mechanic", notes: "Record custom Garr or Firesworn behavior once your raid confirms it." }],
    },
  },
  vanillaplus: {
    "raids/molten-core/garr": {
      sourceLabel: "Vanilla+",
      summary: "Vanilla+ Garr starts from the Legacy guide while raids confirm server-specific mechanics.",
      callouts: [
        {
          title: "Vanilla+ custom content expected",
          body: "This guide keeps the core Garr plan conservative. Adjust banishes, dispels, and add timing if Vanilla+ mechanics demand it.",
          tone: "warning",
        },
      ],
      addSections: [
        {
          title: "Vanilla+ notes",
          body: [
            "Use observed Vanilla+ creature behavior to refine the raid plan.",
            "Call out any mechanic that changes assignments, dispels, or kill order.",
          ],
        },
      ],
    },
  },
};

export const serverPatches: Record<string, Record<string, GuidePatch>> = {
  turtle: {
    "raids/molten-core/garr": {
      sourceLabel: "Turtle",
      callouts: [
        {
          title: "Turtle WoW notes",
          body: "Use the Nightmares of Ursol Garr plan as the starting point, then adjust for Turtle-specific raid behavior.",
          tone: "info",
        },
      ],
    },
  },
  octo: {
    "raids/molten-core/garr": {
      sourceLabel: "Octo",
      callouts: [
        {
          title: "Octo notes",
          body: "Use the Nightmares of Ursol Garr plan as the starting point, then adjust for Octo-specific raid behavior.",
          tone: "info",
        },
      ],
    },
  },
};

function cloneGuide(guide: GuidePage): GuidePage {
  return {
    ...guide,
    sections: guide.sections.map((section) => ({ ...section, body: [...section.body] })),
    creatures: guide.creatures.map((creature) => ({
      ...creature,
      spells: creature.spells.map((spell) => ({ ...spell })),
    })),
    spellIds: [...guide.spellIds],
    callouts: guide.callouts?.map((callout) => ({ ...callout })),
  };
}

export function applyPatch(guide: GuidePage, patch: GuidePatch): GuidePage {
  const next = cloneGuide(guide);
  if (patch.summary) next.summary = patch.summary;
  next.sourceLabel = patch.sourceLabel;

  if (patch.replaceSections) {
    next.sections = next.sections.map((section) =>
      patch.replaceSections?.[section.title]
        ? { ...section, body: patch.replaceSections[section.title] }
        : section,
    );
  }
  if (patch.addSections) next.sections.push(...patch.addSections);

  if (patch.removeCreatureIds?.length) {
    const remove = new Set(patch.removeCreatureIds);
    next.creatures = next.creatures.filter((creature) => !remove.has(creature.id));
  }
  if (patch.addCreatures) next.creatures.push(...patch.addCreatures);

  if (patch.removeSpellIds?.length) {
    const remove = new Set(patch.removeSpellIds);
    next.spellIds = next.spellIds.filter((spellId) => !remove.has(spellId));
    next.creatures = next.creatures.map((creature) => ({
      ...creature,
      spells: creature.spells.filter((spell) => !remove.has(spell.id)),
    }));
  }
  if (patch.addSpells) {
    const existing = new Set(next.spellIds);
    for (const spell of patch.addSpells) {
      if (spell.id > 0 && !existing.has(spell.id)) next.spellIds.push(spell.id);
    }
  }
  if (patch.callouts) next.callouts = [...(next.callouts ?? []), ...patch.callouts];
  return next;
}

export function resolveGuide(serverSlug: string, guideSlug: string): GuidePage | undefined {
  const context = resolveWikiMetadata(serverSlug);
  if (!context) return undefined;
  const base = baseGuides[`${context.guideBaseFlavorSlug}/${guideSlug}`] ?? baseGuides[`legacy/${guideSlug}`];
  if (!base) return undefined;

  let guide = cloneGuide(base);
  const flavorPatch = flavorPatches[context.flavor.slug]?.[guideSlug];
  if (flavorPatch) guide = applyPatch(guide, flavorPatch);
  const serverPatch = serverPatches[context.server.slug]?.[guideSlug];
  if (serverPatch) guide = applyPatch(guide, serverPatch);
  return guide;
}

export const moltenCoreBosses = getRaidInstance("molten-core")?.encounters.map(({ slug, name, status }) => ({ slug, name, status })) ?? [];
