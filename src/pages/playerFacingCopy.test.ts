import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { BossGuidePage } from "./BossGuidePage";
import { GuidesPage } from "./GuidesPage";
import { HomePage } from "./HomePage";
import { RaidPage } from "./RaidPage";
import { ServerHomePage } from "./ServerHomePage";
import { UnitExplorerPage } from "./UnitExplorerPage";
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
      renderRoute("/turtle/explorer", "/:serverSlug/explorer", createElement(UnitExplorerPage)),
      renderToStaticMarkup(createElement(MemoryRouter, null, createElement(WikiDevelopmentPage))),
    ];

    for (const html of pages) {
      expectNoImplementationCopy(html);
    }
  });
});
