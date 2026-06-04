import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { BossGuidePage } from "./BossGuidePage";
import { GuidesPage } from "./GuidesPage";
import { HomePage } from "./HomePage";
import { RaidPage } from "./RaidPage";
import { ServerHomePage } from "./ServerHomePage";
import { WikiDevelopmentPage } from "./WikiDevelopmentPage";

const forbiddenPlayerFacingCopy = [
  /\bMVP\b/i,
  /\bstub\b/i,
  /placeholder for/i,
  /fallback/i,
  /fixture/i,
  /testable/i,
  /testability/i,
  /API slice/i,
  /route chooses/i,
  /implementation/i,
  /debug/i,
  /internal pipeline/i,
  /guide inheritance/i,
  /source:/i,
  /override/i,
  /live Chronicle API/i,
  /queries its own Chronicle API/i,
  /log-derived/i,
  /structured guide patches/i,
  /server override hooks/i,
  /guide pending/i,
  /\bplanned\b/i,
  /published yet/i,
  /first raid guide/i,
  /first Chronicle raid guide/i,
  /enough confirmed mechanics/i,
  /completed guide/i,
  /basic explorer/i,
  /\bFlavor:/i,
];

function renderRoute(path: string, routePath: string, element: React.ReactNode) {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: routePath, element })),
    ),
  );
}

function expectNoImplementationCopy(html: string) {
  for (const forbidden of forbiddenPlayerFacingCopy) {
    expect(html).not.toMatch(forbidden);
  }
}

describe("player-facing copy", () => {
  it("keeps implementation meta text out of rendered player pages", () => {
    const pages = [
      renderToStaticMarkup(createElement(MemoryRouter, null, createElement(HomePage))),
      renderRoute("/turtle", "/:serverSlug", createElement(ServerHomePage)),
      renderRoute("/turtle/guides", "/:serverSlug/guides", createElement(GuidesPage)),
      renderRoute("/turtle/raids/molten-core", "/:serverSlug/raids/:instanceSlug", createElement(RaidPage)),
      renderRoute("/turtle/raids/molten-core/garr", "/:serverSlug/raids/:instanceSlug/:bossSlug", createElement(BossGuidePage)),
      renderRoute("/vanillaplus/raids/molten-core/garr", "/:serverSlug/raids/:instanceSlug/:bossSlug", createElement(BossGuidePage)),
      renderToStaticMarkup(createElement(MemoryRouter, null, createElement(WikiDevelopmentPage))),
    ];

    for (const html of pages) {
      expectNoImplementationCopy(html);
    }
  });

  it("renders the trimmed Molten Core raid MVP with same-page boss tabs, spell tooltips, and success rates", () => {
    const html = renderRoute("/turtle/raids/molten-core", "/:serverSlug/raids/:instanceSlug", createElement(RaidPage));

    expect(html).toContain("Recent raids");
    expect(html).toContain("https://turtle.chronicleclassic.com");
    expect(html.match(/role="tab"/g)).toHaveLength(10);
    for (const boss of [
      "Lucifron",
      "Magmadar",
      "Gehennas",
      "Garr",
      "Shazzrah",
      "Baron Geddon",
      "Golemagg the Incinerator",
      "Sulfuron Harbinger",
      "Majordomo Executus",
      "Ragnaros",
    ]) {
      expect(html).toContain(boss);
    }
    expect(html).toContain("Success rate");
    expect(html).toContain("89% clears");
    expect(html).toContain("Lucifron&#x27;s Curse");
    expect(html).toContain("https://turtle.chronicleclassic.com/wowdb/spell/19702");
    expect(html).not.toContain("Open Lucifron guide");
    expect(html).not.toMatch(/loot|recommended raid comp|consumes|resistance prep|attunement|raid prep checklist/i);
  });

  it("deep-links boss tabs through the raid page instead of separate boss guide pages", () => {
    const html = renderRoute("/turtle/raids/molten-core?boss=ragnaros", "/:serverSlug/raids/:instanceSlug", createElement(RaidPage));

    expect(html).toContain("Ragnaros");
    expect(html).toContain("Lava Burst");
    expect(html).toContain("78% clears");
    expect(html).not.toContain("Lucifron&#x27;s Curse");
  });
});
