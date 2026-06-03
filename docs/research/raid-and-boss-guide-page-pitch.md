# Raid and boss guide page pitch

Recommendation: build Chronicle Wiki raid guides as prep-first hubs, then make boss pages the fast operational view for raid leaders and players. The raid page should answer "what are we walking into and where do I go next?" The boss page should answer "what do I do on this pull?" Chronicle logs and WoWDB data should support those answers as evidence links, not take over the page.

## Sources reviewed

| Source | URL | Useful patterns | Gaps / cautions |
| --- | --- | --- | --- |
| Wowhead Molten Core raid overview | https://www.wowhead.com/classic/guide/molten-core-raid-overview-wow-classic | Strong raid overview shape: facts, location, attunement, reputation, loot, boss list, and links to boss strategy pages. | Heavy site chrome and cross-guide ad density do not fit Chronicle Wiki. |
| Icy Veins Molten Core raid guide | https://www.icy-veins.com/wow-classic/molten-core-raid-guides | Good raid logistics: entry methods, attunement, dangerous trash, difficulty variants, loot links, and boss guide index. | Long article flow can bury the raid-night checklist. Chronicle should make the first screen more scannable. |
| Icy Veins Blackwing Lair raid guide | https://www.icy-veins.com/wow-classic/blackwing-lair-raid-guides | Good pattern for recommended composition, attunement steps, notable trash, boss order, and phase or season differences. | Composition recommendations can become stale across private servers. Treat them as metadata plus realm notes, not hardcoded gospel. |
| Warcraft Tavern Molten Core loot table | https://www.warcrafttavern.com/wow-classic/tools/loot/zone/molten%20core/ | Loot is useful as a filterable database by class, role, source, resistance, quality, slot, type, drop chance, and patch. | Chronicle should link or summarize loot from typed item data instead of turning every guide page into a full loot database. |
| Wowhead Molten Core loot guide | https://www.wowhead.com/classic/guide/molten-core-loot-wow-classic | Shows value of raid-level loot themes: Tier 1, Tier 2 legs, trash BoEs, legendaries, and boss drop patterns. | Boss pages need concise loot highlights, not exhaustive duplicate tables if an item explorer exists. |
| Wowhead Lucifron strategy guide | https://www.wowhead.com/classic/guide/lucifron-molten-core-strategy-wow-classic | Boss page patterns: before-pull setup, kill order, ability explanations, class callouts, consumables, and loot. | Written for generic Classic. Chronicle needs server/flavor overrides and log evidence. |
| Icy Veins Lucifron boss guide | https://www.icy-veins.com/wow-classic/lucifron-guide-strategy-abilities-loot | Strong role breakdown for tanks, healers, and DPS. Clear ability list and over-geared farm note. | Role blocks should be more compact above the fold for raid-night use. |
| Legacy WoW Lucifron guide | https://legacy-wow.com/molten-core-boss-guide-lucifron/ | Private-server-era guide style emphasizes pull execution, add control, dispel ownership, and practical wipe causes. | Useful as structure reference only. Do not copy prose or assume every private server mirrors 1.12 behavior. |
| Turtle WoW Molten Core wiki | https://turtle-wow.fandom.com/wiki/Molten_Core | Shows private-server context value: trash mechanics, respawn timers, custom community notes, and lore framing. | Stub-like structure. Chronicle needs a cleaner product hierarchy and stronger typed links. |

## Product framing

Chronicle Wiki should not compete with generic guide sites by writing another long Classic article. It should combine concise player guidance with Chronicle-specific confidence:

- Server-scoped routes and flavor inheritance choose the correct baseline guide.
- Realm notes explain where Turtle, Octo, Vanilla Plus, Warmane, or future servers diverge.
- Chronicle WoWDB links connect guide claims to units, spells, items, and talents.
- Chronicle logs and raid review links answer "what actually happened on this server?" without turning the guide into a report dashboard.
- Static content ships first. Typed metadata powers navigation, search, related data, and future log callouts.

## Proposed raid guide page

Route shape:

```text
/:serverSlug/raids/:instanceSlug
```

The raid page is the instance hub. It should be useful before raid night, during route planning, and when jumping into a boss guide.

### Above the fold

Example heading slots:

```text
Molten Core
40-player raid · Level 60 · Blackrock Mountain · 10 encounters
Server: Turtle · Guide family: Nightmares of Ursol · Status: Available
```

Recommended hero content:

- One concise raid summary.
- Instance facts: raid size, level, location, encounter count, final boss, guide status.
- Server/flavor badges, including custom-content caveat when relevant.
- Primary calls to action:
  - Start at first boss.
  - Open boss list.
  - View loot overview.
  - Open Chronicle raid evidence.
- Small "what changed on this server" callout when a realm patch changes boss order, mechanics, loot, or entry requirements.

Why: raid leaders need orientation first. They should not scroll past paragraphs of lore before finding entry, bosses, or required prep.

### Page outline

```text
# Molten Core
## Quick facts
## Raid prep checklist
## Boss order
## Trash and route notes
## Attunement, quests, and reputation
## Recommended raid composition
## Consumables and resistance prep
## Loot overview
## Maps and positioning references
## Chronicle evidence
## Server-specific notes
## Related guides and tools
```

### Section recommendations

#### Quick facts

Use typed facts, not markdown prose, for repeated fields:

- Raid size.
- Recommended level.
- Location and entrance.
- Encounter count.
- Final boss.
- Required or recommended attunement.
- Main reputation.
- Guide family and server override status.

Sample content slot:

```text
Molten Core is a 40-player level 60 raid under Blackrock Mountain. It has 10 encounters, starts with Lucifron, and ends with Ragnaros. Most groups should complete Attunement to the Core before raid night.
```

#### Raid prep checklist

Keep this short and operational:

- Required access or attunement.
- Consumables or resistance targets.
- Required utility, for example hunters with Tranquilizing Shot after Lucifron.
- Assignment setup needed before first pull.
- Server-specific warning, if current realm changes the baseline.

This section should be scannable on mobile.

#### Boss order

Boss cards should be the page's main navigation. Each card should show:

- Boss name and role.
- Encounter status: guide available, coming soon, planned.
- One-line mechanic summary.
- Key prep tags, for example dispel, decurse, fear, frenzy, add control, fire resistance.
- Link to the boss guide.
- Previous and next position in the raid.

Chronicle-specific data belongs as small evidence chips, not paragraphs:

```text
Tracked units: 2 · Tracked spells: 5 · Recent logs available
```

#### Trash and route notes

Trash deserves raid-page space because Classic raids often wipe on trash. Icy Veins and Turtle community notes both treat Molten Core trash as materially important.

Group by route segment, not creature encyclopedia:

- Entrance to Lucifron.
- Lucifron to Magmadar.
- Garr and Baron Geddon area.
- Sulfuron and Golemagg area.
- Ragnaros setup.

Each segment should list only the dangerous patterns: respawns, banishes, knockbacks, frontal attacks, split adds, and patrol risks. Detailed unit data should link to the unit explorer.

#### Attunement, quests, and reputation

Put logistics here:

- Entrance methods.
- Attunement quest steps and required level.
- Raid-relevant quests.
- Reputation gates, for example Hydraxian Waterlords and Aqual Quintessence.
- Server differences.

This section can link to a future dedicated quest or attunement guide if it grows.

#### Recommended raid composition

Use this as guidance, not law:

- Tank count and off-tank expectations.
- Healer count and dispel coverage.
- Required utility by class.
- Optional role targets.
- Server/flavor caveats.

Avoid pretending Chronicle knows one perfect 40-man comp for every private server.

#### Consumables and resistance prep

Group by purpose:

- Required or strongly recommended.
- Useful for progression.
- Farm status or optional.
- Resistance gear targets when server mechanics require them.

The page should link items to Chronicle item data when available.

#### Loot overview

The raid page should summarize loot themes:

- Tier set coverage.
- Notable boss drops.
- Trash BoEs.
- Legendary components.
- Class or role filter link into item tooling.

Do not render a full 135-item loot table on the guide page. That belongs in an item explorer or loot page.

#### Maps and positioning references

P0 can be static image or simple text route. P1 can add boss room diagrams. P2 can add interactive maps.

The important requirement is linkability:

- Boss room anchors.
- Pull route anchors.
- Map pins tied to encounter slugs.

#### Chronicle evidence

Keep this compact:

- Link to recent raid logs filtered to this instance and server.
- Link to raid review for this instance.
- Highlight only stable, aggregate insights, for example "most recent tracked wipes involved Lucifron curse uptime".
- Never dump raw log tables into the guide page.

The guide should remain a guide. Chronicle evidence should increase trust and help validation.

## Proposed boss guide page

Route shape:

```text
/:serverSlug/raids/:instanceSlug/:bossSlug
```

The boss page is the tactical unit. It should support two modes:

1. Prep mode: understand the fight, assignments, abilities, and loot.
2. Raid-night mode: quickly check positioning, role duties, and wipe causes.

### Above the fold

Example heading slots:

```text
Lucifron
Molten Core · Boss 1 of 10 · Dispel · Decurse · Add control
Turtle · Nightmares of Ursol baseline with Turtle notes
```

Recommended top content:

- One-sentence fight summary.
- Pull plan in 3 to 5 bullets.
- Role summary cards for tanks, healers, DPS, and special assignments.
- Key abilities with icons and dispel or decurse ownership.
- Server-specific warning, if active.
- Links to previous boss, next boss, raid overview, and Chronicle evidence.

Why: the first screen should be useful while a raid leader is explaining the next pull.

### Page outline

```text
# Lucifron
## Quick summary
## Pull and positioning
## Role responsibilities
## Abilities
## Phases and timeline
## Assignments
## Common wipe causes
## Loot highlights
## Related units and spells
## Chronicle log insights
## Server-specific notes
## Previous and next encounters
```

### Section recommendations

#### Quick summary

This should be the raid-night card.

Sample content slot:

```text
Kill both Flamewaker Protectors before Lucifron. Keep enemies faced away from the raid. Priests dispel Impending Doom and Dominate Mind. Mages and Druids remove Lucifron's Curse. Stay out of unnecessary 40-yard debuff range when possible.
```

Recommended fields:

- Difficulty tags.
- Key mechanics.
- Required dispels or decurses.
- Kill order.
- Tank count.
- Assignment count.
- Common progression blocker.

#### Pull and positioning

Show the physical plan before the ability encyclopedia:

- Where to clear first.
- Where boss and adds should stand.
- Where ranged and healers should stand.
- What not to pull.
- Safe farm variation, if relevant.

For Lucifron, the research repeatedly flags pull execution, add pickup, entrance tunnel respawns, and 40-yard range management. This should appear before loot.

#### Role responsibilities

Use compact cards, not long prose.

Example slots:

```text
Tanks
- Main tank holds Lucifron.
- Two off-tanks pick up Flamewaker Protectors.
- Face all targets away from the raid.

Healers
- Priests dispel Impending Doom and Dominate Mind.
- Druids remove Lucifron's Curse.
- Prioritize tanks while debuffs are active.

DPS
- Kill Flamewaker Protectors first.
- Melee attack from behind.
- Mages decurse before padding damage.

Special assignments
- Hunters or pull team help separate adds.
- Decurse and dispel leads call missed debuffs.
```

#### Abilities

Each ability needs typed metadata and a player-facing response:

- Name.
- Source creature.
- School.
- Range.
- Duration or cooldown when known.
- Dispel type or counter.
- Role owner.
- Link to Chronicle spell page.
- Evidence status: confirmed, inherited baseline, or needs realm verification.

Chronicle can display icons and current spell text from WoWDB, but guide copy should say what players do.

#### Phases and timeline

Not every Classic boss needs a complex phase chart. Still reserve the section because later bosses do.

For simple fights:

```text
Single-phase fight. The timeline is pull, stabilize adds, kill adds, finish boss while continuing dispels and decurses.
```

For complex fights:

- Phase cards.
- Trigger conditions.
- Timed mechanics.
- Submerge or intermission windows.
- Enrage or soft-enrage notes.

P1 can add a visual timeline. P0 can use ordered text.

#### Assignments

Assignment slots should be explicit and reusable:

- Tanks by target.
- Dispel groups.
- Decurse groups.
- Banish or crowd-control targets.
- Interrupt rotations.
- Soak groups.
- Position markers.

This is where Chronicle can later support copyable assignment templates. Do not build that in P0.

#### Common wipe causes

This is high value and should be near the tactical sections:

- Pulling extra trash.
- Adds cleaving the raid.
- Missed dispels.
- Missed decurses.
- Killing mind-controlled players.
- Standing in the wrong range band.
- Server-specific mechanic differences.

Chronicle logs can make this section stronger later by surfacing common tracked failure patterns.

#### Loot highlights

Boss pages should show a compact loot subset:

- Tier pieces.
- Class-critical drops.
- Quest or legendary drops.
- Notable recipes.
- Link to full loot table or item explorer.

For Lucifron, Tome of Tranquilizing Shot is more tactically important than a generic full drop list because it affects later Magmadar prep.

#### Related units and spells

Keep the current Chronicle direction here:

- Boss unit.
- Add units.
- Tracked spells.
- Links to WoWDB creature, spell, and item pages.
- Related talents when a mechanic depends on class capability, for example range talents or dispel coverage.

This is evidence and exploration, not the main strategy body.

#### Chronicle log insights

Use a small insight panel:

- Recent kills and wipes link.
- Common debuff uptime issue.
- Top failed mechanic by count, if confidently computed.
- "Needs more data" fallback when no logs exist.

Do not expose raw implementation wording, API source labels, fallback fixtures, or debug copy.

## Content model requirements

Static markdown should hold narrative and recommendations. Typed metadata should hold anything reused by routes, nav, search, cards, filters, or data links.

### Raid model

```ts
type RaidGuide = {
  slug: string;
  title: string;
  kind: "raid";
  serverScope: "global" | "flavor" | "server";
  guideBaseFlavorSlug: string;
  status: "available" | "stub" | "planned";
  summary: string;
  facts: {
    raidSize?: number;
    recommendedLevel?: number;
    location?: string;
    entrance?: string;
    encounterCount: number;
    finalBossSlug?: string;
    attunementRequired?: boolean;
    mainReputationSlug?: string;
  };
  prepTags: string[];
  encounters: RaidEncounterRef[];
  sections: ContentSection[];
  relatedQuestIds?: number[];
  relatedFactionIds?: number[];
  relatedItemIds?: number[];
  relatedSpellIds?: number[];
  relatedCreatureIds?: number[];
  lootThemeIds?: string[];
  mapAssetPath?: string;
  backgroundImagePath?: string;
  evidenceLinks?: ChronicleEvidenceLink[];
};

type RaidEncounterRef = {
  slug: string;
  name: string;
  order: number;
  role?: string;
  status: "available" | "guide-pending" | "planned";
  summary: string;
  mechanicTags: string[];
  guideSlug?: string;
};
```

### Boss model

```ts
type BossGuide = {
  slug: string;
  raidSlug: string;
  title: string;
  bossSlug: string;
  order: number;
  sourceLabel: string;
  serverScope: "global" | "flavor" | "server";
  status: "available" | "stub" | "planned";
  summary: string;
  mechanicTags: string[];
  quickPlan: string[];
  roleResponsibilities: RoleResponsibility[];
  positioning: ContentSection[];
  abilities: BossAbilityRef[];
  phases?: BossPhase[];
  assignments?: AssignmentSlot[];
  wipeCauses: string[];
  lootHighlights: LootHighlight[];
  creatures: CreatureGuideEntry[];
  spellIds: number[];
  itemIds?: number[];
  relatedTalentRefs?: TalentRef[];
  evidenceLinks?: ChronicleEvidenceLink[];
  callouts?: GuideCallout[];
  sections: ContentSection[];
};

type BossAbilityRef = {
  spellId: number;
  name: string;
  sourceCreatureId?: number;
  school?: string;
  rangeYards?: number;
  durationSeconds?: number;
  dispelType?: "magic" | "curse" | "poison" | "disease" | "none";
  ownerRoles: Array<"tank" | "healer" | "melee" | "ranged" | "raid-lead" | "class-lead">;
  playerResponse: string;
  evidenceStatus: "confirmed" | "baseline" | "needs-verification";
};
```

### Shared model notes

- Use slugs for routes and stable content references.
- Use numeric IDs for Chronicle units, spells, items, quests, factions, and talents.
- Keep server and flavor patches as overlays, similar to current `GuidePatch` behavior.
- Add `mechanicTags` for search and cards.
- Add `evidenceStatus` so private-server overrides can be honest about unverified behavior.
- Keep prose sections serializable and portable. Do not mix React components into the content model until the static approach runs out of road.

## UX and navigation

Recommended flow:

```text
/:serverSlug/guides
  Raids
    Molten Core -> /:serverSlug/raids/molten-core
      Lucifron -> /:serverSlug/raids/molten-core/lucifron
      Magmadar -> /:serverSlug/raids/molten-core/magmadar
  Dungeons
    Coming soon
```

Navigation requirements:

- Breadcrumbs: Guides > Raids > Molten Core > Lucifron.
- Raid page side nav: quick facts, prep, boss order, trash, attunement, loot, evidence.
- Boss page side nav or sticky compact tabs: summary, roles, abilities, positioning, loot, evidence.
- Previous and next boss links on boss pages.
- Boss cards should link back to the raid overview.
- Global search should return server-scoped links.
- Mobile layout should keep the quick summary and role cards before long sections.
- Horizontal chips can work on mobile for contents, but the raid-night summary must not require precise scrolling.

Server/flavor handling:

- Route remains server-scoped.
- Server resolves to flavor and guide base.
- Flavor patches handle families such as legacy or Nightmares of Ursol.
- Server patches handle exact realm differences.
- UI should disclose when a guide is inherited baseline versus confirmed for the server.

## MVP scope

### P0, tight first slice

Build one useful Molten Core slice without building a guide platform.

1. Expand the existing Molten Core raid overview into the recommended raid outline, backed by static typed metadata.
2. Add one complete boss guide, preferably Lucifron because it teaches the page structure: pull, roles, abilities, wipe causes, loot highlights, units, spells, and evidence links.
3. Keep `/SERVER/guides` as the hub with Raids and Dungeons sections.
4. Add breadcrumbs and previous/next boss links.
5. Add mechanic tags to raid boss cards and search entries.
6. Link Chronicle WoWDB units and spells from boss pages.
7. Add server/flavor disclosure copy that is player-facing.
8. Add tests for server-scoped guide routes, boss order links, search links, and absence of implementation/debug copy.

What not to build in P0:

- Interactive raid maps.
- Full loot database UI.
- Log analytics dashboards inside guide pages.
- User-authored guides.
- Assignment template editor.
- Rich markdown CMS.
- Automated guide generation from logs.

### P1, depth and polish

1. Add the rest of Molten Core boss pages.
2. Add trash route sections with dangerous mob groups and respawn notes.
3. Add compact loot summaries from item metadata.
4. Add static positioning diagrams for high-risk bosses.
5. Add log insight panels with conservative aggregate facts.
6. Add realm-specific patches for Turtle, Octo, Vanilla Plus, and Warmane where verified.
7. Improve mobile raid-night scanning with sticky summary affordances.

### P2, platform growth

1. Add interactive maps and route pins.
2. Add copyable assignment templates.
3. Add richer loot explorer filters by class, role, source, and resistance.
4. Add authoring workflow or moderation only if Chronicle needs runtime content editing.
5. Add log-derived recommendations after data quality is high enough.
6. Add side-by-side server comparison for private-server differences.

## Implementation roadmap and possible follow-up cards

Do not spawn these until Steven reviews this pitch.

1. Implement Molten Core raid page content model expansion.
   - Add typed quick facts, prep tags, trash route notes, attunement, loot themes, and evidence links.
2. Implement Lucifron boss guide as the page-structure pilot.
   - Add quick plan, role cards, abilities, wipe causes, loot highlights, and unit/spell links.
3. Add guide breadcrumbs and previous/next encounter navigation.
   - Cover raid and boss routes with tests.
4. Add mechanic tags to guide search and raid boss cards.
   - Keep search results server-scoped.
5. Add player-facing server/flavor disclosure patterns.
   - Ensure inherited baseline and server-confirmed guides are distinct without debug wording.

## Open questions for Steven

1. Should P0 use Lucifron as the boss-page pilot because it is first in encounter order, or Garr because the repo already has a Garr guide stub?
2. Should Chronicle show "baseline", "server-confirmed", and "needs verification" labels directly to players, or keep that status more subtle?
3. Should loot highlights link to an internal item explorer first, or out to Chronicle WoWDB item pages until internal loot tooling exists?
4. Should raid composition be included in P0, or postponed until enough server-specific expectations are known?
5. How much Chronicle log insight should appear before the raid review product has a stable public link pattern?
6. Should boss pages prioritize raid leader assignment prep, casual player role reminders, or an even split?

## Final pitch

For the MVP, Chronicle Wiki should ship a focused Molten Core raid hub plus one excellent boss guide. The raid hub should organize the instance, prep, boss order, trash, attunement, loot themes, and evidence links. The boss guide should put quick plan, role responsibilities, abilities, positioning, wipe causes, loot highlights, and related Chronicle data in a repeatable structure.

This gives Chronicle a clear guide shape without overbuilding. It also leaves room for the product's real advantage: server-scoped private-server data and Chronicle log evidence that makes guide claims trustworthy.
