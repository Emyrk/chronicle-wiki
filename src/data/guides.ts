import type { CreatureGuideEntry, GuidePage, GuidePatch } from "@/types";
import { getRaidInstance } from "./instances";
import { flavors, getServer } from "./servers";

const garrCreatures: CreatureGuideEntry[] = [
  {
    id: 12057,
    name: "Garr",
    role: "Boss",
    notes: "Elemental boss built around add control, dispels, and stabilizing raid damage while Firesworn are managed.",
    spells: [
      { id: 19492, name: "Antimagic Pulse", school: "Arcane", notes: "Raid-wide pulse that can remove magic effects." },
      { id: 19514, name: "Magma Shackles", school: "Fire", notes: "Movement pressure and raid damage." },
    ],
  },
  {
    id: 12099,
    name: "Firesworn",
    role: "Add",
    notes: "Eight adds start with Garr. Banish, tank, and kill them in a controlled order.",
    spells: [
      { id: 19496, name: "Magma Splash", school: "Fire", notes: "Add death/explosion pressure. Verify exact spell IDs per server logs." },
    ],
  },
];

export const baseGuides: Record<string, GuidePage> = {
  "legacy/raids/molten-core/garr": {
    slug: "raids/molten-core/garr",
    title: "Garr",
    raid: "Molten Core",
    boss: "garr",
    summary: "Garr is an add-control encounter. The baseline plan is to banish or tank Firesworn, kill them deliberately, dispel dangerous effects, and avoid turning add deaths into raid-wide chaos.",
    sourceLabel: "Legacy Vanilla baseline",
    spellIds: [19492, 19514, 19496],
    creatures: garrCreatures,
    callouts: [
      {
        title: "Baseline, not gospel",
        body: "This page is the Legacy fallback. Server pages should patch mechanics once Chronicle logs confirm differences.",
        tone: "info",
      },
    ],
    sections: [
      {
        title: "Strategy",
        body: [
          "Assign banishes before the pull. Garr begins with enough adds that improvising control after combat starts is how raids donate repair gold.",
          "Kill Firesworn one at a time. Treat each add death as a raid event, not background cleave damage.",
          "Keep Garr positioned away from uncontrolled adds so tanks can stabilize threat and healers can see who is actually in danger.",
        ],
      },
      {
        title: "Tanks",
        body: [
          "Main tank holds Garr steady. Off tanks pick up assigned Firesworn that are not banished.",
          "Do not drag multiple low-health Firesworn through the raid unless your goal is performance art.",
        ],
      },
      {
        title: "Healers",
        body: [
          "Watch add tanks during banish breaks and transitions. Raid damage spikes when multiple adds are active or dying close together.",
          "Dispel assignments matter more than raw throughput if server mechanics add extra magic effects.",
        ],
      },
      {
        title: "DPS",
        body: [
          "Follow the add kill order. Chronicle should eventually make target discipline painfully visible here.",
          "Avoid padding into banished or controlled adds unless the raid leader explicitly calls for swaps.",
        ],
      },
    ],
  },
};

export const flavorPatches: Record<string, Record<string, GuidePatch>> = {
  "nightmares-of-ursol": {
    "raids/molten-core/garr": {
      sourceLabel: "Nightmares of Ursol override",
      summary: "Turtle-style servers share the Legacy Garr shell until log-derived creature spell lists prove exact custom behavior. Use this page as the place to record Nightmares of Ursol differences.",
      callouts: [
        {
          title: "Needs log-derived spell confirmation",
          body: "Turtle, Octo, and other Nightmares of Ursol deployments may share content, but each server route still queries its own Chronicle API for live data.",
          tone: "warning",
        },
      ],
      addSections: [
        {
          title: "Nightmares of Ursol notes",
          body: [
            "This override is intentionally thin until Chronicle logs provide the exact spells cast by Garr and Firesworn in Molten Core.",
            "When those spell lists arrive, add or remove spells here instead of forking the whole guide.",
          ],
        },
      ],
      addSpells: [
        { id: 0, name: "Pending Turtle-specific spell", notes: "Placeholder for log-confirmed custom mechanic." },
      ],
    },
  },
  vanillaplus: {
    "raids/molten-core/garr": {
      sourceLabel: "Vanilla+ override",
      summary: "Vanilla+ Garr starts from the Legacy guide, with server-specific custom mechanics to be filled from Chronicle spell-cast evidence.",
      callouts: [
        {
          title: "Vanilla+ custom content expected",
          body: "This guide is wired for Vanilla+ overrides. The current MVP keeps mechanics conservative until log-derived spells are added.",
          tone: "warning",
        },
      ],
      addSections: [
        {
          title: "Vanilla+ notes",
          body: [
            "Use the unit explorer to attach Vanilla+ creature spell lists once available.",
            "Prefer structured spell additions and removals over duplicating the Legacy page.",
          ],
        },
      ],
    },
  },
};

export const serverPatches: Record<string, Record<string, GuidePatch>> = {
  turtle: {
    "raids/molten-core/garr": {
      sourceLabel: "Turtle server note",
      callouts: [
        {
          title: "Turtle route",
          body: "This page uses Turtle branding and Turtle Chronicle API calls, while inheriting shared Nightmares of Ursol guide content.",
          tone: "info",
        },
      ],
    },
  },
  octo: {
    "raids/molten-core/garr": {
      sourceLabel: "Octo server note",
      callouts: [
        {
          title: "Octo route",
          body: "Octo shares Nightmares of Ursol content but should query Octo Chronicle logs for live evidence.",
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
  const server = getServer(serverSlug);
  if (!server) return undefined;
  const flavor = flavors[server.flavor];
  const baseFlavor = flavor.fallbackFlavor ?? flavor.slug;
  const base = baseGuides[`${baseFlavor}/${guideSlug}`] ?? baseGuides[`legacy/${guideSlug}`];
  if (!base) return undefined;

  let guide = cloneGuide(base);
  const flavorPatch = flavorPatches[flavor.slug]?.[guideSlug];
  if (flavorPatch) guide = applyPatch(guide, flavorPatch);
  const serverPatch = serverPatches[server.slug]?.[guideSlug];
  if (serverPatch) guide = applyPatch(guide, serverPatch);
  return guide;
}

export const moltenCoreBosses = getRaidInstance("molten-core")?.encounters.map(({ slug, name, status }) => ({ slug, name, status })) ?? [];
