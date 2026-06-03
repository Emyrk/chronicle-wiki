import { afterEach, describe, expect, it, vi } from "vitest";
import { apiUrl, fetchSpell, fetchTalentTrees } from "./chronicle";
import { resolveServerContext } from "../data/servers";

function context(slug: string) {
  const resolved = resolveServerContext(slug);
  if (!resolved) throw new Error(`missing context for ${slug}`);
  return resolved;
}

describe("Chronicle API URLs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses the tenant default dataset by omitting dataset_id", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ classes: { "1": { tabs: [] } } }),
    } as Response);

    await fetchTalentTrees(context("turtle"));

    expect(fetchMock).toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/talent-trees");
  });

  it("normalizes remote talent classes with class metadata and order-sorted tabs", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        classes: {
          "1": {
            tabs: [
              { id: 164, name: "Fury", orderIndex: 1, talents: [] },
              { id: 161, name: "Arms", orderIndex: 0, talents: [] },
            ],
          },
        },
      }),
    } as Response);

    const result = await fetchTalentTrees(context("turtle"));

    expect(result.data.classes["1"]).toMatchObject({ id: 1, name: "Warrior" });
    expect(result.data.classes["1"]?.tabs.map((tab) => tab.name)).toEqual(["Arms", "Fury"]);
  });

  it("hydrates remote talent names and rank descriptions from spell rank details", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).endsWith("/talent-trees")) {
        return {
          ok: true,
          json: async () => ({
            classes: {
              "1": {
                tabs: [
                  {
                    id: 161,
                    name: "Arms",
                    orderIndex: 0,
                    talents: [
                      { id: 56, tierID: 0, columnIndex: 0, maxRank: 2, tabIndex: 0, spellRanks: [12282, 12663], iconTexture: "Ability_Rogue_Ambush" },
                    ],
                  },
                ],
              },
            },
          }),
        } as Response;
      }

      const urlParts = String(url).split("/");
      const id = Number(urlParts[urlParts.length - 1]);
      return {
        ok: true,
        json: async () => ({
          id,
          name: { "0": "Improved Heroic Strike" },
          description: { "0": id === 12282 ? "Reduces Heroic Strike cost by 1 rage." : "Reduces Heroic Strike cost by 2 rage." },
          school: { string: "Physical" },
        }),
      } as Response;
    });

    const result = await fetchTalentTrees(context("turtle"));
    const talent = result.data.classes["1"]?.tabs[0]?.talents[0];

    expect(fetchMock).toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/spell/12282");
    expect(fetchMock).toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/spell/12663");
    expect(talent).toMatchObject({
      name: "Improved Heroic Strike",
      description: "Reduces Heroic Strike cost by 1 rage.",
      rankDescriptions: ["Reduces Heroic Strike cost by 1 rage.", "Reduces Heroic Strike cost by 2 rage."],
    });
  });

  it("resolves DBC spell parameters while hydrating talent rank descriptions", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).endsWith("/talent-trees")) {
        return {
          ok: true,
          json: async () => ({
            classes: {
              "8": {
                tabs: [
                  {
                    id: 41,
                    name: "Fire",
                    orderIndex: 0,
                    talents: [
                      { id: 6, tierID: 0, columnIndex: 1, maxRank: 1, tabIndex: 0, spellRanks: [133], iconTexture: "Spell_Fire_FlameBolt" },
                    ],
                  },
                ],
              },
            },
          }),
        } as Response;
      }

      expect(String(url)).toBe("https://turtle.chronicleclassic.com/api/v1/wowdb/spell/133");
      return {
        ok: true,
        json: async () => ({
          id: 133,
          name: { "0": "Fireball" },
          description: { "0": "Hurls a fiery ball that causes $s1 Fire damage and an additional $o2 Fire damage over $d." },
          aura_description: { "0": "" },
          spell_level: 1,
          base_level: 1,
          max_level: 60,
          duration: { ID: 21, Duration: 8000, DurationPerLevel: 0, MaxDuration: 8000 },
          range: { ID: 1, RangeMin: 0, RangeMax: 35, Flags: 0, Name: "Long" },
          effect_base_points: [24, 2, 0],
          effect_die_sides: [7, 1, 1],
          effect_base_dice: [1, 1, 1],
          effect_dice_per_level: [0, 0, 0],
          effect_real_points_per_level: [0, 0, 0],
          effect_aura_period: [0, 2000, 0],
          effect_radius: [],
          effect_amplitude: [0, 0, 0],
          effect_chain_targets: [0, 0, 0],
          effect_points_per_combo: [0, 0, 0],
          proc_charges: 0,
          proc_chance: 0,
          cumulative_aura: 0,
          max_target_level: 0,
        }),
      } as Response;
    });

    const result = await fetchTalentTrees(context("turtle"));
    const talent = result.data.classes["8"]?.tabs[0]?.talents[0];

    expect(talent?.description).toBe("Hurls a fiery ball that causes 25 to 31 Fire damage and an additional 12 Fire damage over 8 sec.");
    expect(talent?.rankDescriptions).toEqual(["Hurls a fiery ball that causes 25 to 31 Fire damage and an additional 12 Fire damage over 8 sec."]);
    expect(talent?.description).not.toMatch(/\$s1|\$o2|\$d/);
  });

  it("falls back to Death Knight talent data for Wrath servers", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    const result = await fetchTalentTrees(context("chromie"));

    expect(result.source).toBe("fallback");
    expect(result.data.classes["6"]).toMatchObject({ id: 6, name: "Death Knight" });
    expect(result.data.classes["6"]?.tabs.map((tab) => tab.name)).toEqual(["Blood", "Frost", "Unholy"]);
  });

  it("fetches referenced spells needed by cross-spell tooltip variables", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).endsWith("/15237")) {
        return {
          ok: true,
          json: async () => ({
            id: 15237,
            name: { "0": "Holy Nova" },
            description: { "0": "Causes $23455s1 Holy damage within $23455a1 yards." },
            aura_description: { "0": "" },
            spell_level: 1,
            base_level: 1,
            max_level: 60,
            duration: { ID: 1, Duration: 0, DurationPerLevel: 0, MaxDuration: 0 },
            effect_base_points: [0, 0, 0],
            effect_die_sides: [1, 1, 1],
            effect_base_dice: [1, 1, 1],
            effect_dice_per_level: [0, 0, 0],
            effect_real_points_per_level: [0, 0, 0],
            effect_aura_period: [0, 0, 0],
          }),
        } as Response;
      }

      if (String(url).endsWith("/23455")) {
        return {
          ok: true,
          json: async () => ({
            id: 23455,
            name: { "0": "Holy Nova Trigger" },
            description: { "0": "" },
            aura_description: { "0": "" },
            spell_level: 1,
            base_level: 1,
            max_level: 60,
            duration: { ID: 1, Duration: 0, DurationPerLevel: 0, MaxDuration: 0 },
            effect_base_points: [27, 0, 0],
            effect_die_sides: [8, 1, 1],
            effect_base_dice: [1, 1, 1],
            effect_dice_per_level: [0, 0, 0],
            effect_real_points_per_level: [0, 0, 0],
            effect_aura_period: [0, 0, 0],
            effect_radius: [{ ID: 13, Radius: 10, RadiusPerLevel: 0, RadiusMin: 0, RadiusMax: 10 }],
          }),
        } as Response;
      }

      throw new Error(`unexpected URL ${String(url)}`);
    });

    const result = await fetchSpell(context("turtle"), 15237);

    expect(fetchMock).toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/spell/15237");
    expect(fetchMock).toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/spell/23455");
    expect(result?.notes).toBe("Causes 28 to 35 Holy damage within 10 yards.");
    expect(result?.notes).not.toMatch(/\$23455s1|\$23455a1/);
  });

  it("does not append dataset_id to spell lookups", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ id: 123, name: "Test Spell" }),
    } as Response);

    await fetchSpell(context("vanillaplus"), 123);

    expect(fetchMock).toHaveBeenCalledWith("https://vanillaplus.chronicleclassic.com/api/v1/wowdb/spell/123");
  });

  it("joins server API base URLs and paths", () => {
    expect(apiUrl(context("octo"), "api/v1/wowdb/talent-trees")).toBe(
      "https://octo.chronicleclassic.com/api/v1/wowdb/talent-trees",
    );
  });
});
