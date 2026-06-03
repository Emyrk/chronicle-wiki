import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TalentPage } from "./TalentPage";

function renderTalentPage(path = "/legacy/talents/mage") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: "/:serverSlug/talents/:classSlug", element: createElement(TalentPage) }),
        ),
      ),
    ),
  );
}

describe("TalentPage player-facing header", () => {
  it("does not render admin data controls above the calculator", () => {
    const html = renderTalentPage();

    expect(html).toContain("Talent calculator");
    expect(html).toContain("Mage");
    expect(html).not.toContain("Builder data controls");
    expect(html).not.toContain("Chronicle API JSON");
    expect(html).not.toContain("Server / flavor");
    expect(html).not.toContain("Reparse current source");
    expect(html).not.toContain("Loads talent trees from");
    expect(html).not.toContain("API is unavailable");
    expect(html).not.toContain("falls back");
    expect(html).not.toContain("fixtures");
    expect(html).not.toContain("testable");
    expect(html).not.toContain("Using local fixture data");
  });

  it("renders class icons through the selected server icon bucket while keeping labels visible", () => {
    const html = renderTalentPage("/turtle/talents/mage");

    expect(html).toContain('src="https://icons.chronicleclassic.com/turtle/inv_staff_13.webp"');
    expect(html).toContain('src="https://icons.chronicleclassic.com/turtle/inv_sword_27.webp"');
    expect(html).toContain(">Mage</span>");
    expect(html).toContain(">Warrior</span>");
  });

  it("does not show Death Knight as a class option for Vanilla servers", () => {
    const html = renderTalentPage("/turtle/talents/mage");

    expect(html).not.toContain(">Death Knight</span>");
    expect(html).not.toContain("/turtle/talents/death-knight");
  });

  it("shows Death Knight as a class option for Wrath servers", () => {
    const html = renderTalentPage("/chromie/talents/death-knight");

    expect(html).toContain(">Death Knight</span>");
    expect(html).toContain("/chromie/talents/death-knight");
    expect(html).toContain('src="https://icons.chronicleclassic.com/azerothcore/spell_deathknight_classicon.webp"');
  });

  it("renders unsupported direct Death Knight routes as missing pages", () => {
    const html = renderTalentPage("/turtle/talents/death-knight");

    expect(html).toContain("Page not found");
    expect(html).not.toContain("Talent calculator");
  });
});
