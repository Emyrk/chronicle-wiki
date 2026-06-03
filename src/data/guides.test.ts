import { describe, expect, it } from "vitest";
import { resolveGuide } from "./guides";
import { getRaidInstance } from "./instances";
import { resolveServerContext } from "./servers";

describe("server and guide resolution", () => {
  it("maps turtle and octo routes to the shared Nightmares of Ursol flavor", () => {
    expect(resolveServerContext("turtle")?.flavor.slug).toBe("nightmares-of-ursol");
    expect(resolveServerContext("octo")?.flavor.slug).toBe("nightmares-of-ursol");
  });

  it("falls back to the legacy Garr guide when no server-specific page exists", () => {
    const guide = resolveGuide("kronos", "raids/molten-core/garr");
    expect(guide?.sourceLabel).toBe("Legacy Vanilla");
    expect(guide?.title).toBe("Garr");
  });

  it("applies flavor patches before server patches", () => {
    const guide = resolveGuide("turtle", "raids/molten-core/garr");
    expect(guide?.summary).toContain("Turtle-style servers");
    expect(guide?.callouts?.map((c) => c.title)).toContain("Check your realm");
    expect(guide?.callouts?.map((c) => c.title)).toContain("Turtle WoW notes");
  });

  it("provides concise player-ready guides for every Molten Core boss without removed MVP sections", () => {
    const bosses = getRaidInstance("molten-core")?.encounters ?? [];
    expect(bosses).toHaveLength(10);

    for (const boss of bosses) {
      const guide = resolveGuide("legacy", `raids/molten-core/${boss.slug}`);
      expect(guide?.title).toBe(boss.name);
      expect(guide?.sections.map((section) => section.title)).toEqual([
        "Quick plan",
        "Important abilities",
        "Role notes",
        "Common wipe risks",
      ]);
      expect(guide?.summary).not.toMatch(/loot|attunement|composition|consume|resistance|map|positioning/i);
    }
  });
});
