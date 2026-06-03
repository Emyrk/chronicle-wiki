import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { resolveServerContext } from "../data/servers";
import type { ClassTalentData, TalentEntry } from "../data/talents";
import {
  calculateRequiredPlayerLevel,
  canUseTalent,
  decodeTalentBuild,
  encodeTalentBuild,
  normalizeTalentRanks,
  prerequisiteArrows,
  rowPointRequirement,
  searchParamsWithTalentBuild,
  totalTalentPoints,
  updateTalentRank,
  TalentTreeViewer,
} from "./TalentTreeViewer";

function renderTalentTree(data: ClassTalentData, path = "/talents/test") {
  const context = resolveServerContext("turtle");
  if (!context) throw new Error("missing turtle context");
  return renderToStaticMarkup(
    createElement(MemoryRouter, { initialEntries: [path] }, createElement(TalentTreeViewer, { data, context })),
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

describe("TalentTreeViewer tooltips", () => {
  it("renders a keyboard-focusable tooltip with rank, description, current rank, and next rank text", () => {
    const described = talent({
      id: 90,
      name: "Precision",
      tierID: 0,
      columnIndex: 0,
      maxRank: 3,
      spellRanks: [1001, 1002, 1003],
      description: "Increases your chance to hit by 1% per rank.",
      rankDescriptions: ["+1% hit", "+2% hit", "+3% hit"],
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
    expect(html).toContain("Increases your chance to hit by 1% per rank.");
    expect(html).toContain("Current rank: +1% hit");
    expect(html).toContain("Next rank: +2% hit");
    expect(html).toContain("Spell ranks: 1001, 1002, 1003");
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

    expect(html).toContain("No description data available yet.");
    expect(html).toContain("Rank 0/5");
  });
});

describe("TalentTreeViewer render geometry", () => {
  it("matches ChronicleClassic's compact 4-column talent grid geometry", () => {
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

    expect(html).toContain("width:192px;height:168px");
    expect(html).toContain("grid-template-columns:repeat(4, 40px)");
    expect(html).toContain("grid-auto-rows:48px");
    expect(html).toContain("gap:8px");
    expect(html).toContain("h-10 w-10");
    expect(html).toContain("grid gap-4 xl:grid-cols-3");
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

    expect(html).toContain("grid gap-4 xl:grid-cols-2 2xl:grid-cols-3");
    expect(html).toContain("width:192px;height:616px");
    expect(html).toContain('viewBox="0 0 192 616"');
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
});
