import { describe, expect, it } from "vitest";
import { guideSections, searchGuideEntries } from "./guideIndex";
import { globalSearchResults } from "./search";

describe("guide index", () => {
  it("groups guide content under raids and dungeons", () => {
    expect(guideSections.map((section) => section.title)).toEqual(["Raids", "Dungeons"]);
    expect(guideSections.find((section) => section.slug === "raids")?.entries.map((entry) => entry.title)).toEqual(["Molten Core"]);
    expect(guideSections.find((section) => section.slug === "dungeons")?.entries).toEqual([]);
  });

  it("carries Chronicle instance background images into raid guide cards", () => {
    const moltenCore = guideSections.find((section) => section.slug === "raids")?.entries[0];

    expect(moltenCore?.backgroundImageUrl).toBe("/assets/instances/molten-core/background.jpg");
  });

  it("finds Molten Core from raid and boss search terms", () => {
    expect(searchGuideEntries("molten").map((entry) => entry.title)).toEqual(["Molten Core"]);
    expect(searchGuideEntries("ragnaros").map((entry) => entry.title)).toEqual(["Molten Core"]);
    expect(searchGuideEntries("dungeon")).toEqual([]);
  });

  it("returns server-scoped global search results", () => {
    expect(globalSearchResults("turtle", "molten core")[0]).toMatchObject({
      title: "Molten Core",
      href: "/turtle/raids/molten-core",
      category: "Raids",
    });
    expect(globalSearchResults("turtle", "talent")[0]).toMatchObject({
      title: "Talent calculator",
      href: "/turtle/talents",
    });
  });
});
