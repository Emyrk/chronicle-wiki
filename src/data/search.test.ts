import { describe, expect, it } from "vitest";
import { globalSearchResults } from "./search";

describe("global search tool descriptions", () => {
  it("keeps talent calculator result copy player-facing", () => {
    const result = globalSearchResults("turtle", "talent").find((entry) => entry.title === "Talent calculator");

    expect(result?.description).toBe("Plan and share class builds for the selected server.");
  });

  it("finds server-scoped raid and boss pages from common aliases", () => {
    expect(globalSearchResults("turtle", "rag")[0]).toMatchObject({
      title: "Ragnaros",
      href: "/turtle/raids/molten-core?boss=ragnaros",
      category: "Bosses",
    });
    expect(globalSearchResults("turtle", "geddon")[0]).toMatchObject({
      title: "Baron Geddon",
      href: "/turtle/raids/molten-core?boss=baron-geddon",
      category: "Bosses",
    });
    expect(globalSearchResults("turtle", "mc")[0]).toMatchObject({
      title: "Molten Core",
      href: "/turtle/raids/molten-core",
      category: "Raids",
    });
  });

  it("finds unit, spell, guide, server, class, and talent spec keywords", () => {
    expect(globalSearchResults("turtle", "flamewaker")[0]).toMatchObject({ href: "/turtle/explorer", category: "Units" });
    expect(globalSearchResults("turtle", "living bomb")[0]).toMatchObject({ href: "/turtle/explorer", category: "Spells" });
    expect(globalSearchResults("turtle", "dispels")[0]).toMatchObject({ href: "/turtle/guides" });
    expect(globalSearchResults("turtle", "octo")[0]).toMatchObject({ title: "Octo WoW", href: "/octo" });
    expect(globalSearchResults("turtle", "mage")[0]).toMatchObject({ title: "Mage talents", href: "/turtle/talents/mage" });
    expect(globalSearchResults("turtle", "frost spec")[0]).toMatchObject({ title: "Mage Frost talents", href: "/turtle/talents/mage" });
  });

  it("ranks current-server results before global server navigation when both match", () => {
    expect(globalSearchResults("turtle", "turtle").map((entry) => entry.href).slice(0, 2)).toEqual(["/turtle", "/turtle/talents"]);
  });

  it("only exposes Death Knight talent search results for Death Knight capable servers", () => {
    expect(globalSearchResults("turtle", "death knight talents")).toEqual([]);
    expect(globalSearchResults("chromie", "death knight talents")[0]).toMatchObject({
      title: "Death Knight talents",
      href: "/chromie/talents/death-knight",
    });
  });
});
