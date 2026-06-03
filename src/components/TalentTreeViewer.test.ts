import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { talentTooltipSpellQueryKey } from "../api/chronicle";
import { resolveServerContext } from "../data/servers";
import { fallbackTalentTrees } from "../data/talents";
import type { ClassTalentData, TalentEntry } from "../data/talents";
import {
  calculateRequiredPlayerLevel,
  canUseTalent,
  canonicalTalentBuildUrl,
  copyTalentBuildUrl,
  decodeTalentBuild,
  encodeTalentBuild,
  mergeTalentRankDescriptions,
  normalizeTalentRanks,
  rankDescriptionsForTooltip,
  resetTalentTabRanks,
  prerequisiteArrowPolylinePoints,
  prerequisiteArrowPathData,
  prerequisiteArrows,
  rowPointRequirement,
  searchParamsWithTalentBuild,
  talentTooltipPosition,
  totalTalentPoints,
  updateTalentRank,
  isTalentBackgroundVisible,
  TalentTreeViewer,
} from "./TalentTreeViewer";

function renderTalentTree(data: ClassTalentData, path = "/talents/test") {
  const context = resolveServerContext("turtle");
  if (!context) throw new Error("missing turtle context");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: [path] }, createElement(TalentTreeViewer, { data, context })),
    ),
  );
}

function renderTalentTreeWithCachedSpellNotes(data: ClassTalentData, path: string, spellNotes: Record<number, string>) {
  const context = resolveServerContext("turtle");
  if (!context) throw new Error("missing turtle context");
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  for (const [spellId, notes] of Object.entries(spellNotes)) {
    queryClient.setQueryData(talentTooltipSpellQueryKey(context, Number(spellId)), { id: Number(spellId), name: `Spell ${spellId}`, notes });
  }
  return renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(MemoryRouter, { initialEntries: [path] }, createElement(TalentTreeViewer, { data, context })),
    ),
  );
}

function talent(partial: Partial<TalentEntry> & Pick<TalentEntry, "id" | "tierID" | "columnIndex">): TalentEntry {
  return {
    name: `Talent ${partial.id}`,
    maxRank: 1,
    tabIndex: 0,
    spellRanks: [partial.id],
    iconTexture: "inv_misc_questionmark",
    ...partial,
  };
}

describe("TalentTreeViewer required player level", () => {
  it("derives level from max level, max talent points, and current spend", () => {
    expect(calculateRequiredPlayerLevel(0, { maxLevel: 60, maxTalentPoints: 51 })).toBe(1);
    expect(calculateRequiredPlayerLevel(1, { maxLevel: 60, maxTalentPoints: 51 })).toBe(10);
    expect(calculateRequiredPlayerLevel(31, { maxLevel: 60, maxTalentPoints: 51 })).toBe(40);
    expect(calculateRequiredPlayerLevel(51, { maxLevel: 60, maxTalentPoints: 51 })).toBe(60);
    expect(calculateRequiredPlayerLevel(999, { maxLevel: 60, maxTalentPoints: 51 })).toBe(60);
    expect(calculateRequiredPlayerLevel(71, { maxLevel: 80, maxTalentPoints: 71 })).toBe(80);
  });

  it("tracks required level as ranks are added and removed through builder rules", () => {
    const first = talent({ id: 1, tierID: 0, columnIndex: 0, maxRank: 5 });
    const second = talent({ id: 2, tierID: 0, columnIndex: 1, maxRank: 5 });
    const tabTalents = [first, second];
    const flavor = { maxLevel: 60, maxTalentPoints: 51 };

    const onePoint = updateTalentRank(first, 1, tabTalents, {}, { maxPoints: 5 });
    const capped = updateTalentRank(second, 1, tabTalents, { 1: 5 }, { maxPoints: 5 });
    const removed = updateTalentRank(first, 4, tabTalents, { 1: 5 }, { maxPoints: 5 });

    expect(calculateRequiredPlayerLevel(totalTalentPoints(onePoint), flavor)).toBe(10);
    expect(calculateRequiredPlayerLevel(totalTalentPoints(capped), flavor)).toBe(14);
    expect(calculateRequiredPlayerLevel(totalTalentPoints(removed), flavor)).toBe(13);
  });

  it("renders spent points and required level restored from URL build state", () => {
    const data: ClassTalentData = {
      id: 1,
      name: "Mage",
      tabs: [
        {
          id: 81,
          name: "Arcane",
          backgroundFile: "MageArcane",
          orderIndex: 0,
          iconTexture: "spell_holy_magicalsentry",
          talents: [talent({ id: 10, tierID: 0, columnIndex: 0, maxRank: 5 })],
        },
      ],
    };

    const html = renderTalentTree(data, `/talents/mage?build=${encodeTalentBuild({ 10: 3 })}`);

    expect(html).toContain("Reset 3/51 points");
    expect(html).toContain("Requires level 12");
  });
});

describe("TalentTreeViewer talent locking", () => {
  it("requires five points per talent row before a row can be used", () => {
    const firstRow = talent({ id: 1, tierID: 0, columnIndex: 0 });
    const secondRow = talent({ id: 2, tierID: 1, columnIndex: 0 });
    const thirdRow = talent({ id: 3, tierID: 2, columnIndex: 0 });
    const tabTalents = [firstRow, secondRow, thirdRow];

    expect(rowPointRequirement(firstRow)).toBe(0);
    expect(rowPointRequirement(secondRow)).toBe(5);
    expect(rowPointRequirement(thirdRow)).toBe(10);
    expect(canUseTalent(secondRow, tabTalents, { 1: 4 })).toBe(false);
    expect(canUseTalent(secondRow, tabTalents, { 1: 5 })).toBe(true);
    expect(canUseTalent(thirdRow, tabTalents, { 1: 5, 2: 4 })).toBe(false);
    expect(canUseTalent(thirdRow, tabTalents, { 1: 5, 2: 5 })).toBe(true);
  });

  it("requires prerequisite arrow sources to be full before the target can be used", () => {
    const source = talent({ id: 10, tierID: 0, columnIndex: 1, maxRank: 3 });
    const filler = talent({ id: 12, tierID: 0, columnIndex: 2, maxRank: 5 });
    const target = talent({ id: 11, tierID: 1, columnIndex: 1, prereqTalent: [10], prereqRank: [1] });
    const tabTalents = [source, filler, target];

    expect(canUseTalent(target, tabTalents, { 10: 2, 12: 5 })).toBe(false);
    expect(canUseTalent(target, tabTalents, { 10: 3, 12: 5 })).toBe(true);
  });

  it("does not add points to locked talents", () => {
    const source = talent({ id: 20, tierID: 0, columnIndex: 1, maxRank: 2 });
    const filler = talent({ id: 22, tierID: 0, columnIndex: 2, maxRank: 5 });
    const target = talent({ id: 21, tierID: 1, columnIndex: 1, prereqTalent: [20] });
    const tabTalents = [source, filler, target];

    expect(updateTalentRank(target, 1, tabTalents, { 20: 1, 22: 5 })).toEqual({ 20: 1, 22: 5 });
    expect(updateTalentRank(target, 1, tabTalents, { 20: 2, 22: 5 })).toEqual({ 20: 2, 21: 1, 22: 5 });
  });

  it("does not remove row-unlocking points while lower-row talents are spent", () => {
    const first = talent({ id: 40, tierID: 0, columnIndex: 0, maxRank: 5 });
    const second = talent({ id: 41, tierID: 1, columnIndex: 0, maxRank: 5 });
    const tabTalents = [first, second];

    expect(updateTalentRank(first, 4, tabTalents, { 40: 5, 41: 1 })).toEqual({ 40: 5, 41: 1 });
    expect(updateTalentRank(first, 4, tabTalents, { 40: 5, 41: 0 })).toEqual({ 40: 4, 41: 0 });
  });

  it("enforces a total point cap while adding ranks", () => {
    const first = talent({ id: 50, tierID: 0, columnIndex: 0, maxRank: 5 });
    const second = talent({ id: 51, tierID: 0, columnIndex: 1, maxRank: 5 });
    const tabTalents = [first, second];

    expect(updateTalentRank(second, 1, tabTalents, { 50: 5 }, { maxPoints: 5 })).toEqual({ 50: 5 });
    expect(updateTalentRank(second, 1, tabTalents, { 50: 4 }, { maxPoints: 5 })).toEqual({ 50: 4, 51: 1 });
  });
});

describe("TalentTreeViewer rank description merging", () => {
  it("builds mergeable tooltip descriptions from fetched spell rank notes when talent data omits rank text", () => {
    expect(rankDescriptionsForTooltip([], 0, undefined, "Reduces the casting time of your Fireball spell by 0.1 sec.", [
      "Reduces the casting time of your Fireball spell by 0.1 sec.",
      "Reduces the casting time of your Fireball spell by 0.2 sec.",
      "Reduces the casting time of your Fireball spell by 0.3 sec.",
      "Reduces the casting time of your Fireball spell by 0.4 sec.",
      "Reduces the casting time of your Fireball spell by 0.5 sec.",
    ])).toEqual([
      "Reduces the casting time of your Fireball spell by 0.1 sec.",
      "Reduces the casting time of your Fireball spell by 0.2 sec.",
      "Reduces the casting time of your Fireball spell by 0.3 sec.",
      "Reduces the casting time of your Fireball spell by 0.4 sec.",
      "Reduces the casting time of your Fireball spell by 0.5 sec.",
    ]);
  });

  it("overlays selected middle-rank fetched spell notes before merging real tooltip text", () => {
    const descriptions = rankDescriptionsForTooltip([], 3, "Reduces the casting time of your Fireball spell by 0.3 sec.", "Reduces the casting time of your Fireball spell by 0.4 sec.", [
      "Reduces the casting time of your Fireball spell by 0.1 sec.",
      "Reduces the casting time of your Fireball spell by 0.2 sec.",
      "Reduces the casting time of your Fireball spell by 0.3 sec.",
      "Reduces the casting time of your Fireball spell by 0.4 sec.",
      "Reduces the casting time of your Fireball spell by 0.5 sec.",
    ]);

    expect(mergeTalentRankDescriptions(descriptions, 3)).toEqual([
      { type: "text", text: "Reduces the casting time of your Fireball spell by " },
      { type: "ladder", values: ["0.1", "0.2", "0.3", "0.4", "0.5"], activeIndex: 2 },
      { type: "text", text: " sec." },
    ]);
  });

  it("collapses one changing percent value into an inline ladder", () => {
    expect(mergeTalentRankDescriptions([
      "Gives your Fireball 2% chance to stun for 2 sec.",
      "Gives your Fireball 4% chance to stun for 2 sec.",
      "Gives your Fireball 6% chance to stun for 2 sec.",
    ], 1)).toEqual([
      { type: "text", text: "Gives your Fireball " },
      { type: "ladder", values: ["2", "4", "6"], activeIndex: 0 },
      { type: "text", text: "% chance to stun for 2 sec." },
    ]);
  });

  it("highlights the current rank in the middle of the ladder", () => {
    expect(mergeTalentRankDescriptions([
      "Increases your chance to hit by 1%.",
      "Increases your chance to hit by 2%.",
      "Increases your chance to hit by 3%.",
    ], 2)?.[1]).toEqual({ type: "ladder", values: ["1", "2", "3"], activeIndex: 1 });
  });

  it("does not merge structurally different descriptions", () => {
    expect(mergeTalentRankDescriptions([
      "+1% hit.",
      "Causes 28 to 35 Holy damage within 10 yards.",
      "+3% hit.",
    ], 1)).toBeNull();
  });

  it("merges descriptions after WoW spell variables have already resolved", () => {
    expect(mergeTalentRankDescriptions([
      "Reduces the casting time of your Fireball spell by 0.1 sec.",
      "Reduces the casting time of your Fireball spell by 0.2 sec.",
      "Reduces the casting time of your Fireball spell by 0.3 sec.",
    ], 3)).toEqual([
      { type: "text", text: "Reduces the casting time of your Fireball spell by " },
      { type: "ladder", values: ["0.1", "0.2", "0.3"], activeIndex: 2 },
      { type: "text", text: " sec." },
    ]);
  });
});

describe("TalentTreeViewer tooltips", () => {
  it("renders a compact inline rank ladder for repeated numeric rank text", () => {
    const described = talent({
      id: 90,
      name: "Impact",
      tierID: 0,
      columnIndex: 0,
      maxRank: 3,
      spellRanks: [1001, 1002, 1003],
      description: "Gives your Fire spells a chance to stun the target.",
      rankDescriptions: [
        "Gives your Fireball 2% chance to stun for 2 sec.",
        "Gives your Fireball 4% chance to stun for 2 sec.",
        "Gives your Fireball 6% chance to stun for 2 sec.",
      ],
    } as Partial<TalentEntry> & Pick<TalentEntry, "id" | "tierID" | "columnIndex"> & { description: string; rankDescriptions: string[] });
    const data: ClassTalentData = {
      id: 1,
      name: "Mage",
      tabs: [{ id: 261, name: "Fire", backgroundFile: "MageFire", orderIndex: 0, iconTexture: "spell_fire_flamebolt", talents: [described] }],
    };

    const html = renderTalentTree(data, `/talents/mage?build=${encodeTalentBuild({ 90: 2 })}`);

    expect(html).toContain("Impact");
    expect(html).toContain("Rank 2/3");
    expect(html).not.toContain("Gives your Fire spells a chance to stun the target.");
    expect(html).toContain("Gives your Fireball ");
    expect(html).toContain("rank-ladder-value-active");
    expect(html).toContain("2</span><span class=\"text-zinc-500\">/</span><strong class=\"rank-ladder-value-active text-amber-100\">4</strong><span class=\"text-zinc-500\">/</span><span class=\"text-zinc-500\">6</span>");
    expect(html).toContain("% chance to stun for 2 sec.");
    expect(html).not.toContain("Current rank:");
    expect(html).not.toContain("Next rank:");
    expect(html).not.toContain("Tooltip");
  });

  it("renders fallback Mage Improved Fireball as a mergeable tooltip ladder for local visual checks", () => {
    const context = resolveServerContext("turtle");
    if (!context) throw new Error("missing turtle context");
    const mage = fallbackTalentTrees.classes["8"];
    if (!mage) throw new Error("missing fallback mage talents");

    const html = renderTalentTree(mage, `/talents/mage?build=${encodeTalentBuild({ 6: 3 })}`);

    expect(html).toContain("Improved Fireball");
    expect(html).toContain("Rank 3/5");
    expect(html).toContain("Reduces the casting time of your Fireball spell by ");
    expect(html).toContain("0.1</span><span class=\"text-zinc-500\">/</span><span class=\"text-zinc-500\">0.2</span><span class=\"text-zinc-500\">/</span><strong class=\"rank-ladder-value-active text-amber-100\">0.3</strong><span class=\"text-zinc-500\">/</span><span class=\"text-zinc-500\">0.4</span><span class=\"text-zinc-500\">/</span><span class=\"text-zinc-500\">0.5</span>");
    expect(html).toContain(" sec.");
  });

  it("renders a compact ladder from cached real spell rank tooltip notes when remote talent data omits rank descriptions", () => {
    const improvedFireball = talent({
      id: 6,
      name: "Improved Fireball",
      tierID: 0,
      columnIndex: 1,
      maxRank: 5,
      tabIndex: 1,
      spellRanks: [11069, 12338, 12339, 12340, 12341],
      iconTexture: "spell_fire_flamebolt",
      description: "Reduces the casting time of your Fireball spell.",
    });
    const data: ClassTalentData = {
      id: 8,
      name: "Mage",
      tabs: [{ id: 41, name: "Fire", backgroundFile: "MageFire", orderIndex: 1, iconTexture: "spell_fire_firebolt02", talents: [improvedFireball] }],
    };

    const html = renderTalentTreeWithCachedSpellNotes(data, `/talents/mage?build=${encodeTalentBuild({ 6: 3 })}`, {
      11069: "Reduces the casting time of your Fireball spell by 0.1 sec.",
      12338: "Reduces the casting time of your Fireball spell by 0.2 sec.",
      12339: "Reduces the casting time of your Fireball spell by 0.3 sec.",
      12340: "Reduces the casting time of your Fireball spell by 0.4 sec.",
      12341: "Reduces the casting time of your Fireball spell by 0.5 sec.",
    });

    expect(html).toContain("Improved Fireball");
    expect(html).toContain("Rank 3/5");
    expect(html).toContain("Reduces the casting time of your Fireball spell by ");
    expect(html).toContain("0.1</span><span class=\"text-zinc-500\">/</span><span class=\"text-zinc-500\">0.2</span><span class=\"text-zinc-500\">/</span><strong class=\"rank-ladder-value-active text-amber-100\">0.3</strong><span class=\"text-zinc-500\">/</span><span class=\"text-zinc-500\">0.4</span><span class=\"text-zinc-500\">/</span><span class=\"text-zinc-500\">0.5</span>");
    expect(html).not.toContain("Current rank:");
    expect(html).not.toContain("Next rank:");
  });

  it("renders a keyboard-focusable tooltip with rank, description, current rank, and next rank text", () => {
    const described = talent({
      id: 90,
      name: "Precision",
      tierID: 0,
      columnIndex: 0,
      maxRank: 3,
      spellRanks: [1001, 1002, 1003],
      description: "Hurls a fiery ball that causes 25 to 31 Fire damage and an additional 12 Fire damage over 8 sec.",
      rankDescriptions: ["+1% hit", "Causes 28 to 35 Holy damage within 10 yards.", "+3% hit"],
    } as Partial<TalentEntry> & Pick<TalentEntry, "id" | "tierID" | "columnIndex"> & { description: string; rankDescriptions: string[] });
    const data: ClassTalentData = {
      id: 1,
      name: "Warrior",
      tabs: [{ id: 161, name: "Arms", backgroundFile: "WarriorArms", orderIndex: 0, iconTexture: "ability_warrior_savageblow", talents: [described] }],
    };

    const html = renderTalentTree(data, `/talents/warrior?build=${encodeTalentBuild({ 90: 1 })}`);

    expect(html).toContain('aria-describedby="talent-tooltip-90"');
    expect(html).toContain('id="talent-tooltip-90"');
    expect(html).toContain('role="tooltip"');
    expect(html).toContain("group-focus-visible:block");
    expect(html).toContain("Precision");
    expect(html).toContain("Rank 1/3");
    expect(html).not.toContain("Hurls a fiery ball that causes 25 to 31 Fire damage and an additional 12 Fire damage over 8 sec.");
    expect(html).toContain("Current rank: +1% hit");
    expect(html).toContain("Next rank: Causes 28 to 35 Holy damage within 10 yards.");
    expect(html).not.toMatch(/\$s1|\$o2|\$d|\$23455s1|\$23455a1|\$lpoint:points;/);
    expect(html).not.toContain("Spell ranks:");
  });

  it("does not render spell rank IDs as player-facing tooltip text", () => {
    const described = talent({
      id: 94,
      name: "Debug Rank Leak",
      tierID: 0,
      columnIndex: 0,
      maxRank: 3,
      spellRanks: [48123, 48124, 48125],
      description: "Player-facing talent summary.",
      rankDescriptions: ["Rank one player text.", "Rank two player text.", "Rank three player text."],
    } as Partial<TalentEntry> & Pick<TalentEntry, "id" | "tierID" | "columnIndex"> & { description: string; rankDescriptions: string[] });
    const data: ClassTalentData = {
      id: 1,
      name: "Warrior",
      tabs: [{ id: 161, name: "Arms", backgroundFile: "WarriorArms", orderIndex: 0, iconTexture: "ability_warrior_savageblow", talents: [described] }],
    };

    const html = renderTalentTree(data, `/talents/warrior?build=${encodeTalentBuild({ 94: 1 })}`);

    expect(html).toContain("Debug Rank Leak");
    expect(html).not.toContain("Player-facing talent summary.");
    expect(html).toContain("Current rank: Rank one player text.");
    expect(html).toContain("Next rank: Rank two player text.");
    expect(html).not.toContain("48123");
    expect(html).not.toContain("48124");
    expect(html).not.toContain("48125");
    expect(html).not.toContain("Spell ranks:");
  });

  it("explains row and prerequisite blockers for locked talents", () => {
    const source = talent({ id: 91, name: "Tactical Mastery", tierID: 0, columnIndex: 0, maxRank: 2 });
    const locked = talent({ id: 92, name: "Anger Management", tierID: 1, columnIndex: 0, maxRank: 1, prereqTalent: [91] });
    const data: ClassTalentData = {
      id: 1,
      name: "Warrior",
      tabs: [{ id: 161, name: "Arms", backgroundFile: "WarriorArms", orderIndex: 0, iconTexture: "ability_warrior_savageblow", talents: [source, locked] }],
    };

    const html = renderTalentTree(data, `/talents/warrior?build=${encodeTalentBuild({ 91: 1 })}`);

    expect(html).toContain("Locked");
    expect(html).toContain("Spend 5 points in this tree to unlock this row.");
    expect(html).toContain("Requires Tactical Mastery at rank 2/2.");
  });

  it("degrades gracefully when description text is missing", () => {
    const data: ClassTalentData = {
      id: 1,
      name: "Warrior",
      tabs: [{ id: 161, name: "Arms", backgroundFile: "WarriorArms", orderIndex: 0, iconTexture: "ability_warrior_savageblow", talents: [talent({ id: 93, name: "Deflection", tierID: 0, columnIndex: 0, maxRank: 5 })] }],
    };

    const html = renderTalentTree(data);

    expect(html).not.toContain("No description data available yet.");
    expect(html).toContain("Talent details unavailable.");
    expect(html).toContain("Rank 0/5");
  });
});

describe("TalentTreeViewer visual talent states", () => {
  it("renders locked, available, selected, and maxed talents with stable state hooks and distinct treatments", () => {
    const data: ClassTalentData = {
      id: 1,
      name: "Mage",
      tabs: [
        {
          id: 81,
          name: "Arcane",
          backgroundFile: "MageArcane",
          orderIndex: 0,
          iconTexture: "spell_holy_magicalsentry",
          talents: [
            talent({ id: 201, name: "Available Focus", tierID: 0, columnIndex: 0, maxRank: 3 }),
            talent({ id: 202, name: "Selected Focus", tierID: 0, columnIndex: 1, maxRank: 3 }),
            talent({ id: 203, name: "Maxed Focus", tierID: 0, columnIndex: 2, maxRank: 2 }),
            talent({ id: 204, name: "Locked Focus", tierID: 1, columnIndex: 0, maxRank: 1 }),
          ],
        },
      ],
    };

    const html = renderTalentTree(data, `/talents/mage?build=${encodeTalentBuild({ 202: 1, 203: 2 })}`);

    expect(html).toContain('data-state="available"');
    expect(html).toContain('data-state="selected"');
    expect(html).toContain('data-state="maxed"');
    expect(html).toContain('data-state="locked"');
    expect(html).toContain("talent-state-available");
    expect(html).toContain("talent-state-selected");
    expect(html).toContain("talent-state-maxed");
    expect(html).toContain("talent-state-locked");
    expect(html).toContain("talent-locked-icon-readable grayscale opacity-70 contrast-110");
    expect(html).toContain("talent-locked-icon-veil absolute inset-0 rounded bg-black/25");
    expect(html).toContain("border-zinc-500/70 bg-zinc-900 text-zinc-100");
    expect(html).not.toContain("grayscale opacity-35");
    expect(html).not.toContain("absolute inset-0 rounded bg-black/45");
    expect(html).toContain("Available Focus");
    expect(html).toContain("Selected Focus");
    expect(html).toContain("Maxed Focus");
    expect(html).toContain("Locked Focus");
  });
});

describe("TalentTreeViewer tree reset and framing", () => {
  it("renders proper talent background images from backgroundFile in each tab's CDN bucket", () => {
    const data: ClassTalentData = {
      id: 1,
      name: "Mage",
      tabs: [
        {
          id: 81,
          name: "Arcane",
          backgroundFile: "MageArcane",
          orderIndex: 0,
          iconTexture: "spell_holy_magicalsentry",
          talents: [talent({ id: 301, tierID: 0, columnIndex: 0, maxRank: 5 })],
        },
        {
          id: 82,
          name: "Fire",
          backgroundFile: "MageFire",
          orderIndex: 1,
          iconTexture: "spell_fire_flamebolt",
          talents: [talent({ id: 302, tierID: 0, columnIndex: 0, maxRank: 5 })],
        },
      ],
    };

    const html = renderTalentTree(data, `/talents/mage?build=${encodeTalentBuild({ 301: 3, 302: 2 })}`);

    expect(html).toContain('data-talent-background-image="true"');
    expect(html).toContain('src="https://icons.chronicleclassic.com/turtle/magearcane.webp"');
    expect(html).toContain('src="https://icons.chronicleclassic.com/turtle/magefire.webp"');
    expect(html).not.toContain("https://icons.chronicleclassic.com/icons/");
  });

  it("treats a failed talent background load as hidden while keeping fallback styling", () => {
    const backgroundUrl = "https://icons.chronicleclassic.com/turtle/magefire.webp";

    expect(isTalentBackgroundVisible(backgroundUrl, null)).toBe(true);
    expect(isTalentBackgroundVisible(backgroundUrl, backgroundUrl)).toBe(false);
    expect(isTalentBackgroundVisible(null, backgroundUrl)).toBe(false);
  });

  it("renders a per-tree reset control beside each visible tree header", () => {
    const data: ClassTalentData = {
      id: 1,
      name: "Mage",
      tabs: [
        {
          id: 81,
          name: "Arcane",
          backgroundFile: "MageArcane",
          orderIndex: 0,
          iconTexture: "spell_holy_magicalsentry",
          talents: [talent({ id: 301, tierID: 0, columnIndex: 0, maxRank: 5 })],
        },
        {
          id: 82,
          name: "Fire",
          backgroundFile: "MageFire",
          orderIndex: 1,
          iconTexture: "spell_fire_flamebolt",
          talents: [talent({ id: 302, tierID: 0, columnIndex: 0, maxRank: 5 })],
        },
      ],
    };

    const html = renderTalentTree(data, `/talents/mage?build=${encodeTalentBuild({ 301: 3, 302: 2 })}`);

    expect(html).toContain('aria-label="Reset Arcane tree"');
    expect(html).toContain('aria-label="Reset Fire tree"');
    expect(html).toContain("Reset tree");
    expect(html).toContain("Arcane");
    expect(html).toContain("3 points spent");
    expect(html).toContain("Fire");
    expect(html).toContain("2 points spent");
    expect(html).toContain("talent-tree-card");
    expect(html).toContain("border-amber-400/20");
  });

  it("resets one tree through the same normalized build-state path without clearing other trees", () => {
    const arcane = [talent({ id: 310, tierID: 0, columnIndex: 0, maxRank: 5 })];
    const fire = [talent({ id: 320, tierID: 0, columnIndex: 0, maxRank: 5 })];
    const frost = [talent({ id: 330, tierID: 0, columnIndex: 0, maxRank: 5 })];

    const resetArcane = resetTalentTabRanks([arcane, fire, frost], { 310: 3, 320: 2, 330: 1 }, arcane, 51);

    expect(resetArcane).toEqual({ 320: 2, 330: 1 });
    expect(searchParamsWithTalentBuild(new URLSearchParams("build=old"), resetArcane).toString()).toBe("build=8w.2_96.1");
  });

  it("reset-all still clears every tree and removes the canonical build param", () => {
    expect(searchParamsWithTalentBuild(new URLSearchParams("build=8m.3_8w.2"), {}).toString()).toBe("");
  });
});

describe("TalentTreeViewer render geometry", () => {
  it("isolates talent-grid horizontal scrolling for narrow mobile screens", () => {
    const data: ClassTalentData = {
      id: 1,
      name: "Warrior",
      tabs: [
        {
          id: 161,
          name: "Arms",
          backgroundFile: "WarriorArms",
          orderIndex: 0,
          iconTexture: "ability_warrior_savageblow",
          talents: [talent({ id: 1, tierID: 0, columnIndex: 0 })],
        },
      ],
    };

    const html = renderTalentTree(data);

    expect(html).toContain('aria-label="Scrollable talent tree grid"');
    expect(html).toContain("overflow-x-auto");
    expect(html).toContain("min-w-max");
    expect(html).toContain("overscroll-x-contain");
    expect(html).toContain("touch-pan-x");
  });

  it("keeps touch tooltip positions inside a phone viewport", () => {
    const position = talentTooltipPosition(
      { left: 288, top: 160, right: 332, bottom: 204, width: 44, height: 44 },
      { innerWidth: 360, innerHeight: 320 },
    );

    expect(position.left).toBeLessThanOrEqual(56);
    expect(position.left).toBeGreaterThanOrEqual(16);
    expect(position.top).toBeLessThanOrEqual(80);
    expect(position.top).toBeGreaterThanOrEqual(16);
  });

  it("keeps talent buttons and tooltips usable on touch screens", () => {
    const data: ClassTalentData = {
      id: 1,
      name: "Warrior",
      tabs: [
        {
          id: 161,
          name: "Arms",
          backgroundFile: "WarriorArms",
          orderIndex: 0,
          iconTexture: "ability_warrior_savageblow",
          talents: [talent({ id: 1, tierID: 0, columnIndex: 0 })],
        },
      ],
    };

    const html = renderTalentTree(data);

    expect(html).toContain("before:absolute before:-inset-0.5");
    expect(html).toContain("w-[min(18rem,calc(100vw-2rem))]");
    expect(html).toContain("fixed z-[100]");
    expect(html).toContain("max-h-[min(24rem,calc(100vh-2rem))]");
    expect(html).toContain("data-talent-tooltip-trigger");
  });

  it("keeps an airy 4-column talent grid with room for short prerequisite arrows", () => {
    const data: ClassTalentData = {
      id: 1,
      name: "Warrior",
      tabs: [
        {
          id: 161,
          name: "Arms",
          backgroundFile: "WarriorArms",
          orderIndex: 0,
          iconTexture: "ability_warrior_savageblow",
          talents: [
            talent({ id: 1, tierID: 0, columnIndex: 0 }),
            talent({ id: 2, tierID: 2, columnIndex: 3 }),
          ],
        },
      ],
    };

    const html = renderTalentTree(data);

    expect(html).toContain("width:272px;height:222px");
    expect(html).toContain("grid-template-columns:repeat(4, 52px)");
    expect(html).toContain("grid-auto-rows:58px");
    expect(html).toContain("gap:16px");
    expect(html).toContain("h-11 w-11");
    expect(html).toContain("grid min-w-0 gap-4 xl:grid-cols-3");
  });

  it("expands the tab layout and grid height for Wrath-depth talent rows", () => {
    const data: ClassTalentData = {
      id: 6,
      name: "Death Knight",
      tabs: [
        {
          id: 398,
          name: "Blood",
          backgroundFile: "DeathKnightBlood",
          orderIndex: 0,
          iconTexture: "spell_deathknight_bloodpresence",
          talents: [
            talent({ id: 100, tierID: 0, columnIndex: 1, maxRank: 5 }),
            talent({ id: 101, tierID: 5, columnIndex: 2, maxRank: 1 }),
            talent({ id: 102, tierID: 10, columnIndex: 1, maxRank: 1, prereqTalent: [101] }),
          ],
        },
        {
          id: 399,
          name: "Frost",
          backgroundFile: "DeathKnightFrost",
          orderIndex: 1,
          iconTexture: "spell_deathknight_frostpresence",
          talents: [talent({ id: 103, tierID: 10, columnIndex: 1, maxRank: 1 })],
        },
        {
          id: 400,
          name: "Unholy",
          backgroundFile: "DeathKnightUnholy",
          orderIndex: 2,
          iconTexture: "spell_deathknight_unholypresence",
          talents: [talent({ id: 104, tierID: 10, columnIndex: 1, maxRank: 1 })],
        },
      ],
    };

    const html = renderTalentTree(data);

    expect(html).toContain("grid min-w-0 gap-4 xl:grid-cols-2 2xl:grid-cols-3");
    expect(html).toContain("width:272px;height:814px");
    expect(html).toContain('viewBox="0 0 272 814"');
    expect(html).toContain("Talent 102");
  });
});

describe("TalentTreeViewer prerequisite arrows", () => {
  it("maps prerequisite talent metadata into arrows", () => {
    const source = talent({ id: 1, tierID: 1, columnIndex: 2, maxRank: 2 });
    const target = talent({ id: 2, tierID: 3, columnIndex: 2, prereqTalent: [1], prereqRank: [2] });

    expect(prerequisiteArrows([source, target])).toEqual([
      { from: source, to: target, requiredRank: 2 },
    ]);
  });

  it("uses the source max rank for arrow state even when prereqRank says less", () => {
    const source = talent({ id: 1, tierID: 1, columnIndex: 2, maxRank: 2 });
    const target = talent({ id: 2, tierID: 3, columnIndex: 2, prereqTalent: [1], prereqRank: [1] });

    expect(prerequisiteArrows([source, target])).toEqual([
      { from: source, to: target, requiredRank: 2 },
    ]);
  });

  it("falls back to the source max rank when prereqRank is absent", () => {
    const source = talent({ id: 10, tierID: 1, columnIndex: 1, maxRank: 5 });
    const target = talent({ id: 11, tierID: 2, columnIndex: 1, prereqTalent: [10] });

    expect(prerequisiteArrows([source, target])[0]?.requiredRank).toBe(5);
  });

  it("ignores prerequisites outside the current tab", () => {
    const target = talent({ id: 3, tierID: 2, columnIndex: 1, prereqTalent: [999], prereqRank: [1] });

    expect(prerequisiteArrows([target])).toEqual([]);
  });

  it("draws same-row prerequisites horizontally from side edge to side edge", () => {
    const source = talent({ id: 20, tierID: 2, columnIndex: 1 });
    const target = talent({ id: 21, tierID: 2, columnIndex: 2, prereqTalent: [20] });

    expect(prerequisiteArrowPolylinePoints(source, target)).toBe("116,170 130,170");
  });

  it("keeps one-row vertical prerequisites compact instead of arrowhead dominated", () => {
    const source = talent({ id: 22, tierID: 0, columnIndex: 1 });
    const target = talent({ id: 23, tierID: 1, columnIndex: 1, prereqTalent: [22] });

    expect(prerequisiteArrowPolylinePoints(source, target)).toBe("90,48 90,68");
  });

  it("routes one-column-right and two-row-down prerequisites through the gap above the target row", () => {
    const source = talent({ id: 30, tierID: 0, columnIndex: 1 });
    const target = talent({ id: 31, tierID: 2, columnIndex: 2, prereqTalent: [30] });

    expect(prerequisiteArrowPolylinePoints(source, target)).toBe("90,48 90,128 158,128 158,142");
  });

  it("routes VanillaPlus Fire Mage prerequisite arrows around intervening talent icons", () => {
    const source = talent({ id: 32, tierID: 2, columnIndex: 1, tabIndex: 8, spellRanks: [11113] });
    const blocker = talent({ id: 31, tierID: 3, columnIndex: 1, tabIndex: 10, spellRanks: [33897, 33898] });
    const target = talent({ id: 1766, tierID: 4, columnIndex: 2, tabIndex: 14, spellRanks: [34125], prereqTalent: [32], prereqRank: [0] });

    expect(prerequisiteArrowPolylinePoints(source, target, [source, blocker, target])).toBe("90,196 130,196 130,276 158,276 158,290");
  });

  it("softens kinked prerequisite paths so turns do not read like flowchart elbows", () => {
    expect(prerequisiteArrowPathData("88,44 88,128 156,128 156,142")).toBe(
      "M 88 44 L 88 122 Q 88 128 94 128 L 150 128 Q 156 128 156 134 L 156 142",
    );
  });

  it("renders prerequisite arrows as lower-weight engraved game UI accents", () => {
    const source = talent({ id: 40, tierID: 0, columnIndex: 1, maxRank: 2 });
    const target = talent({ id: 41, tierID: 1, columnIndex: 1, prereqTalent: [40] });
    const data: ClassTalentData = {
      id: 1,
      name: "Mage",
      tabs: [{ id: 81, name: "Fire", backgroundFile: "MageFire", orderIndex: 0, iconTexture: "spell_fire_flamebolt", talents: [source, target] }],
    };

    const html = renderTalentTree(data);

    expect(html).toContain('markerWidth="4.5"');
    expect(html).toContain('stroke-width="1.5"');
    expect(html).toContain("stroke-[#6d5a3f]/45");
    expect(html).toContain("stroke-[#2b241a]/80");
    expect(html).toContain("fill-[#8b744f]/70");
  });
});

describe("TalentTreeViewer URL build state", () => {
  it("encodes and decodes nonzero ranks with compact URL-safe tokens", () => {
    expect(encodeTalentBuild({ 20: 2, 10: 0, 30: 1 })).toBe("k.2_u.1");
    expect(decodeTalentBuild("k.2_u.1_bad_14.0")).toEqual({ 20: 2, 30: 1 });
    expect(decodeTalentBuild("20:2,30:1,wat:2,40:0")).toEqual({ 20: 2, 30: 1 });
  });

  it("writes compact build state into URL search params without percent-escaped separators", () => {
    const params = searchParamsWithTalentBuild(new URLSearchParams("foo=bar"), { 12: 2, 30: 1 });
    expect(params.toString()).toBe("foo=bar&build=c.2_u.1");
  });

  it("normalizes shared ranks through row, arrow, max-rank, and point-cap rules", () => {
    const source = talent({ id: 1, tierID: 0, columnIndex: 0, maxRank: 2 });
    const filler = talent({ id: 2, tierID: 0, columnIndex: 1, maxRank: 5 });
    const target = talent({ id: 3, tierID: 1, columnIndex: 0, maxRank: 3, prereqTalent: [1], prereqRank: [1] });
    const tabTalents = [source, filler, target];

    expect(normalizeTalentRanks([tabTalents], { 1: 1, 2: 5, 3: 9 }, 6)).toEqual({ 1: 1, 2: 5 });
    expect(normalizeTalentRanks([tabTalents], { 1: 2, 2: 5, 3: 9 }, 8)).toEqual({ 1: 2, 2: 5, 3: 1 });
  });

  it("clears build state from URL search params without dropping other params", () => {
    const params = searchParamsWithTalentBuild(new URLSearchParams("foo=bar"), { 12: 2, 30: 1 });
    const cleared = searchParamsWithTalentBuild(params, {});
    expect(cleared.toString()).toBe("foo=bar");
  });

  it("builds the canonical copy URL from the current server route, class route, and encoded build state", () => {
    const url = canonicalTalentBuildUrl("https://wiki.chronicleclassic.com/turtle/talents/mage?foo=bar", { 12: 2, 30: 1 });

    expect(url).toBe("https://wiki.chronicleclassic.com/turtle/talents/mage?foo=bar&build=c.2_u.1");
  });

  it("copies the canonical build URL through the Copy build link action", async () => {
    const copied: string[] = [];

    await copyTalentBuildUrl({ writeText: async (value) => { copied.push(value); } }, "https://wiki.chronicleclassic.com/turtle/talents/mage?build=stale", { 12: 2 });

    expect(copied).toEqual(["https://wiki.chronicleclassic.com/turtle/talents/mage?build=c.2"]);
  });

  it("renders a player-facing Copy build link control near the talent point summary", () => {
    const data: ClassTalentData = {
      id: 1,
      name: "Mage",
      tabs: [
        {
          id: 81,
          name: "Arcane",
          backgroundFile: "MageArcane",
          orderIndex: 0,
          iconTexture: "spell_holy_magicalsentry",
          talents: [talent({ id: 10, tierID: 0, columnIndex: 0, maxRank: 5 })],
        },
      ],
    };

    const html = renderTalentTree(data, `/turtle/talents/mage?build=${encodeTalentBuild({ 10: 3 })}`);

    expect(html).toContain("Reset 3/51 points");
    expect(html).toContain("Copy build link");
    expect(html).toContain("Share your current talents");
    expect(html).not.toContain("canonical");
  });

  it("normalizes invalid or stale shared build strings before generating the canonical copy URL", () => {
    const valid = talent({ id: 1, tierID: 0, columnIndex: 0, maxRank: 2 });
    const stale = talent({ id: 2, tierID: 1, columnIndex: 0, maxRank: 3 });
    const normalized = normalizeTalentRanks([[valid, stale]], decodeTalentBuild("1.9_2.2_missing"), 2);

    expect(normalized).toEqual({ 1: 2 });
    expect(canonicalTalentBuildUrl("https://wiki.chronicleclassic.com/turtle/talents/mage?build=1.9_2.2_missing", normalized)).toBe(
      "https://wiki.chronicleclassic.com/turtle/talents/mage?build=1.2",
    );
  });
});
