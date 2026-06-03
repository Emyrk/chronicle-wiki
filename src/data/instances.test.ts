import { describe, expect, it } from "vitest";
import { allRaidInstances, buildInstanceOverview, getRaidInstance, instanceAnchorId } from "./instances";

describe("instance overview data", () => {
  it("exposes raid instances with encounter order from the shared instance data", () => {
    const moltenCore = getRaidInstance("molten-core");

    expect(moltenCore?.title).toBe("Molten Core");
    expect(moltenCore?.encounters.map((encounter) => encounter.name)).toEqual([
      "Lucifron",
      "Magmadar",
      "Gehennas",
      "Garr",
      "Ragnaros",
    ]);
  });

  it("builds left table-of-contents anchors for overview sections and each encounter", () => {
    const moltenCore = getRaidInstance("molten-core");
    expect(moltenCore).toBeDefined();

    const overview = buildInstanceOverview(moltenCore!);

    expect(overview.tableOfContents.map((entry) => [entry.label, entry.href])).toEqual([
      ["Overview", "#overview"],
      ["Encounters", "#encounters"],
      ["Lucifron", "#encounter-lucifron"],
      ["Magmadar", "#encounter-magmadar"],
      ["Gehennas", "#encounter-gehennas"],
      ["Garr", "#encounter-garr"],
      ["Ragnaros", "#encounter-ragnaros"],
    ]);
    expect(instanceAnchorId("Garr")).toBe("encounter-garr");
  });

  it("keeps every raid instance reachable from the data-driven instance registry", () => {
    expect(allRaidInstances().map((instance) => instance.slug)).toEqual(["molten-core"]);
  });
});
