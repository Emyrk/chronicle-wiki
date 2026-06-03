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
