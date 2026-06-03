import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchTalentTrees } from "@/api/chronicle";
import { resolveServerContext } from "@/data/servers";
import { TalentDataState, TalentPage } from "./TalentPage";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnMount: false },
    },
  });
}

function renderTalentPage(path = "/legacy/talents/mage", queryClient = createTestQueryClient()) {
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

async function renderTalentPageAfterFetch(path = "/legacy/talents/mage", serverSlug = "legacy") {
  const queryClient = createTestQueryClient();
  const context = resolveServerContext(serverSlug);
  if (!context) throw new Error(`missing context for ${serverSlug}`);
  await queryClient.prefetchQuery({
    queryKey: ["talents", context.server.slug],
    queryFn: () => fetchTalentTrees(context),
  });

  return renderTalentPage(path, queryClient);
}

describe("TalentPage player-facing header", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it("shows a server-scoped no-build empty state when talent tree data is missing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    const html = await renderTalentPageAfterFetch("/turtle/talents/mage", "turtle");

    expect(html).toContain("Talent calculator");
    expect(html).toContain("No talent build available");
    expect(html).not.toContain("Mage talents");
    expect(html).not.toContain("Arcane");
    expect(html).not.toContain("Copy build link");
    expect(html).not.toContain("Using local fixture data");
    expect(html).not.toContain("fallback");
    expect(html).not.toContain("stub");
  });

  it("keeps non-404 talent tree failures out of the no-build empty state", () => {
    const html = renderToStaticMarkup(createElement(TalentDataState, { isLoading: false, isError: true, hasTalentData: false }, "Talent tree UI"));

    expect(html).toContain("Unable to load talent data");
    expect(html).not.toContain("No talent build available");
    expect(html).not.toContain("Talent tree UI");
  });

  it("renders normal talent tabs when tenant talent tree data loads", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        classes: {
          "8": {
            tabs: [{ id: 81, name: "Arcane", orderIndex: 0, iconTexture: "spell_holy_magicalsentry", talents: [] }],
          },
        },
      }),
    } as Response);

    const html = await renderTalentPageAfterFetch("/turtle/talents/mage", "turtle");

    expect(html).toContain("Mage talents");
    expect(html).toContain("Arcane");
    expect(html).not.toContain("No talent build available");
    expect(html).not.toContain("Unable to load talent data");
  });
});
