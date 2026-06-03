import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiUrl, bossSuccessRatesUrl, fetchSpell, fetchTalentTrees, fetchTalentTooltipSpell, prefetchTalentTooltipSpell, spellRecordQueryKey } from "./chronicle";
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

  it("builds tenant-scoped boss success-rate URLs from the rankings API without dataset_id", () => {
    expect(bossSuccessRatesUrl(context("turtle"), "Molten Core")).toBe(
      "https://turtle.chronicleclassic.com/api/v1/rankings/success-rates?instance_name=Molten+Core",
    );
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

    expect(result.data?.classes["1"]).toMatchObject({ id: 1, name: "Warrior" });
    expect(result.data?.classes["1"]?.tabs.map((tab) => tab.name)).toEqual(["Arms", "Fury"]);
  });

  it("leaves spell rank hydration to async tooltip queries instead of fetching every spell with talent trees", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        classes: {
          "1": {
            tabs: [
              {
                id: 161,
                name: "Arms",
                orderIndex: 0,
                talents: [{ id: 56, name: "Improved Heroic Strike", tierID: 0, columnIndex: 0, maxRank: 2, tabIndex: 0, spellRanks: [12282, 12663], iconTexture: "Ability_Rogue_Ambush" }],
              },
            ],
          },
        },
      }),
    } as Response);

    const result = await fetchTalentTrees(context("turtle"));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/talent-trees");
    expect(result.data?.classes["1"]?.tabs[0]?.talents[0]).toMatchObject({
      name: "Improved Heroic Strike",
      spellRanks: [12282, 12663],
    });
  });

  it("keys cached spell records by server API context and spell ID", () => {
    expect(spellRecordQueryKey(context("turtle"), 133)).toEqual(["chronicle", "https://turtle.chronicleclassic.com", "wowdb", "spell", 133]);
    expect(spellRecordQueryKey(context("vanillaplus"), 133)).toEqual(["chronicle", "https://vanillaplus.chronicleclassic.com", "wowdb", "spell", 133]);
  });

  it("preserves talent metadata that arrives with talent trees without eager spell hydration", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
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
                  {
                    id: 56,
                    name: "Improved Heroic Strike",
                    description: "Reduces Heroic Strike cost.",
                    rankDescriptions: ["Reduces Heroic Strike cost by 1 rage.", "Reduces Heroic Strike cost by 2 rage."],
                    tierID: 0,
                    columnIndex: 0,
                    maxRank: 2,
                    tabIndex: 0,
                    spellRanks: [12282, 12663],
                    iconTexture: "Ability_Rogue_Ambush",
                  },
                ],
              },
            ],
          },
        },
      }),
    } as Response);

    const result = await fetchTalentTrees(context("turtle"));
    const talent = result.data?.classes["1"]?.tabs[0]?.talents[0];

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(talent).toMatchObject({
      name: "Improved Heroic Strike",
      description: "Reduces Heroic Strike cost.",
      rankDescriptions: ["Reduces Heroic Strike cost by 1 rage.", "Reduces Heroic Strike cost by 2 rage."],
      spellRanks: [12282, 12663],
    });
  });

  it("resolves DBC spell parameters for tooltip spell records", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
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

    const spell = await fetchSpell(context("turtle"), 133);

    expect(spell?.notes).toBe("Hurls a fiery ball that causes 25 to 31 Fire damage and an additional 12 Fire damage over 8 sec.");
    expect(spell?.notes).not.toMatch(/\$s1|\$o2|\$d/);
  });

  it("returns no talent data instead of fallback trees when the tenant endpoint is missing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const result = await fetchTalentTrees(context("chromie"));

    expect(result).toEqual({ data: null, source: "missing" });
  });

  it("preserves non-404 talent tree failures as errors", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    await expect(fetchTalentTrees(context("chromie"))).rejects.toThrow("HTTP 500");
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

  it("reuses cached direct and referenced spell records for repeated tooltip lookups", async () => {
    const queryClient = new QueryClient();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).endsWith("/15237")) {
        return {
          ok: true,
          json: async () => ({
            id: 15237,
            name: { "0": "Holy Nova" },
            description: { "0": "Causes $23455s1 Holy damage within $23455a1 yards." },
            spell_level: 1,
            effect_base_points: [0, 0, 0],
            effect_die_sides: [1, 1, 1],
            effect_base_dice: [1, 1, 1],
          }),
        } as Response;
      }

      if (String(url).endsWith("/23455")) {
        return {
          ok: true,
          json: async () => ({
            id: 23455,
            name: { "0": "Holy Nova Trigger" },
            spell_level: 1,
            effect_base_points: [27, 0, 0],
            effect_die_sides: [8, 1, 1],
            effect_base_dice: [1, 1, 1],
            effect_radius: [{ ID: 13, Radius: 10, RadiusPerLevel: 0, RadiusMin: 0, RadiusMax: 10 }],
          }),
        } as Response;
      }

      throw new Error(`unexpected URL ${String(url)}`);
    });

    await expect(fetchTalentTooltipSpell(queryClient, context("turtle"), 15237)).resolves.toMatchObject({
      id: 15237,
      notes: "Causes 28 to 35 Holy damage within 10 yards.",
    });
    await expect(fetchTalentTooltipSpell(queryClient, context("turtle"), 15237)).resolves.toMatchObject({
      id: 15237,
      notes: "Causes 28 to 35 Holy damage within 10 yards.",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/spell/15237");
    expect(fetchMock).toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/spell/23455");
  });

  it("prefetches only the direct tooltip spell and leaves referenced spells until tooltip resolution", async () => {
    const queryClient = new QueryClient();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      if (String(url).endsWith("/15237")) {
        return {
          ok: true,
          json: async () => ({
            id: 15237,
            name: { "0": "Holy Nova" },
            description: { "0": "Causes $23455s1 Holy damage within $23455a1 yards." },
            spell_level: 1,
            effect_base_points: [0, 0, 0],
            effect_die_sides: [1, 1, 1],
            effect_base_dice: [1, 1, 1],
          }),
        } as Response;
      }

      if (String(url).endsWith("/23455")) {
        return {
          ok: true,
          json: async () => ({
            id: 23455,
            name: { "0": "Holy Nova Trigger" },
            spell_level: 1,
            effect_base_points: [27, 0, 0],
            effect_die_sides: [8, 1, 1],
            effect_base_dice: [1, 1, 1],
            effect_radius: [{ ID: 13, Radius: 10, RadiusPerLevel: 0, RadiusMin: 0, RadiusMax: 10 }],
          }),
        } as Response;
      }

      throw new Error(`unexpected URL ${String(url)}`);
    });

    await prefetchTalentTooltipSpell(queryClient, context("turtle"), 15237);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/spell/15237");
    expect(fetchMock).not.toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/spell/23455");

    await expect(fetchTalentTooltipSpell(queryClient, context("turtle"), 15237)).resolves.toMatchObject({
      notes: "Causes 28 to 35 Holy damage within 10 yards.",
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/spell/23455");
  });

  it("bounds concurrent referenced spell requests when resolving one tooltip", async () => {
    const queryClient = new QueryClient();
    let activeReferencedRequests = 0;
    let maxActiveReferencedRequests = 0;
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const urlText = String(url);
      if (urlText.endsWith("/5000")) {
        return {
          ok: true,
          json: async () => ({
            id: 5000,
            name: { "0": "Reference Swarm" },
            description: { "0": "$5001s1 $5002s1 $5003s1 $5004s1 $5005s1 $5006s1" },
            spell_level: 1,
            effect_base_points: [0, 0, 0],
            effect_die_sides: [1, 1, 1],
            effect_base_dice: [1, 1, 1],
          }),
        } as Response;
      }

      const match = urlText.match(/\/(500[1-6])$/);
      if (!match) throw new Error(`unexpected URL ${urlText}`);
      activeReferencedRequests += 1;
      maxActiveReferencedRequests = Math.max(maxActiveReferencedRequests, activeReferencedRequests);
      await new Promise((resolve) => setTimeout(resolve, 1));
      activeReferencedRequests -= 1;
      return {
        ok: true,
        json: async () => ({
          id: Number(match[1]),
          name: { "0": `Referenced ${match[1]}` },
          description: { "0": "" },
          spell_level: 1,
          effect_base_points: [10, 0, 0],
          effect_die_sides: [1, 1, 1],
          effect_base_dice: [1, 1, 1],
        }),
      } as Response;
    });

    await fetchTalentTooltipSpell(queryClient, context("turtle"), 5000);

    expect(fetchMock).toHaveBeenCalledTimes(7);
    expect(maxActiveReferencedRequests).toBeLessThanOrEqual(4);
  });

  it("does not reuse same spell ID cache entries across servers", async () => {
    const queryClient = new QueryClient();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => ({
      ok: true,
      json: async () => ({
        id: 133,
        name: { "0": String(url).includes("vanillaplus") ? "VanillaPlus Fireball" : "Turtle Fireball" },
        description: { "0": "Hurls fire." },
      }),
    } as Response));

    await expect(fetchTalentTooltipSpell(queryClient, context("turtle"), 133)).resolves.toMatchObject({ name: "Turtle Fireball" });
    await expect(fetchTalentTooltipSpell(queryClient, context("vanillaplus"), 133)).resolves.toMatchObject({ name: "VanillaPlus Fireball" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith("https://turtle.chronicleclassic.com/api/v1/wowdb/spell/133");
    expect(fetchMock).toHaveBeenCalledWith("https://vanillaplus.chronicleclassic.com/api/v1/wowdb/spell/133");
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
