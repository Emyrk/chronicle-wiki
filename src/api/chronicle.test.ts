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

  it("falls back to Death Knight talent data for Wrath servers", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    const result = await fetchTalentTrees(context("chromie"));

    expect(result.source).toBe("fallback");
    expect(result.data.classes["6"]).toMatchObject({ id: 6, name: "Death Knight" });
    expect(result.data.classes["6"]?.tabs.map((tab) => tab.name)).toEqual(["Blood", "Frost", "Unholy"]);
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
