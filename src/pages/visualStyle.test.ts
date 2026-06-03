import { createElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { describe, expect, it } from "vitest";
import { BossGuidePage } from "./BossGuidePage";
import { GuidesPage } from "./GuidesPage";
import { HomePage } from "./HomePage";
import { NotFoundPage } from "./NotFoundPage";
import { RaidPage } from "./RaidPage";
import { ServerHomePage } from "./ServerHomePage";
import { WikiDevelopmentPage } from "./WikiDevelopmentPage";

function renderRoute(path: string, element: React.ReactNode, routePath = path) {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: routePath, element })),
    ),
  );
}

describe("ChronicleClassic visual language", () => {
  it("anchors global CSS to the tenant Chronicle token family instead of the playful blue-black dashboard theme", () => {
    const css = readFileSync("src/index.css", "utf8");

    expect(css).toContain("Libre+Baskerville");
    expect(css).toContain("font-family: Friz Quadrata");
    expect(css).toContain("--background: #2b2b2b");
    expect(css).toContain("--primary: #5f8fa6");
    expect(css).toContain("--secondary: #89744d");
    expect(css).toContain("--link: #26a9f1");
    expect(css).toContain("--radius: 0.2rem");
    expect(css).not.toContain("radial-gradient(circle at 15% 0%");
  });

  it("uses the shared Chronicle shell on the server selector instead of a standalone wiki dashboard", () => {
    const html = renderRoute("/", createElement(HomePage));

    expect(html).toContain("chronicle-site-shell");
    expect(html).toContain("chronicle-beta-banner");
    expect(html).toContain("chronicle-site-nav");
    expect(html).toContain("Chronicle is currently in beta");
    expect(html).toContain("chronicle-logo.svg");
    expect(html).toContain("wiki-section");
    expect(html).toContain("wiki-server-card");
  });

  it("applies tenant brand tokens and main-site chrome to Turtle wiki routes", () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ["/turtle"] },
        createElement(
          Routes,
          null,
          createElement(
            Route,
            { path: "/:serverSlug", element: createElement(Layout) },
            createElement(Route, { index: true, element: createElement(ServerHomePage) }),
          ),
        ),
      ),
    );

    expect(html).toContain("--primary:#5f9bb8");
    expect(html).toContain("--brand-accent:#c8a45c");
    expect(html).toContain("--brand-background:#242424");
    expect(html).toContain("herobackground.avif");
    expect(html).toContain("wiki-tenant-shell");
    expect(html).toContain("wiki-tenant-nav");
    expect(html).toContain("wiki-main-site-hero");
    expect(html).toContain("wiki-primary-button");
    expect(html).not.toContain("debug");
  });

  it("renders the server selector with Chronicle-style compact cards instead of oversized fantasy panels", () => {
    const html = renderRoute("/", createElement(HomePage));

    expect(html).toContain("max-w-6xl");
    expect(html).toContain("text-4xl font-bold tracking-tight text-white");
    expect(html).toContain("h-20");
    expect(html).toContain("wiki-server-card");
    expect(html).toContain("border-border/60 bg-card");
    expect(html).not.toContain("font-serif text-5xl");
    expect(html).toContain("Legacy Vanilla");
    expect(html).toContain("Turtle WoW");
  });

  it("keeps server home and guide pages on the same Chronicle card system", () => {
    const serverHome = renderRoute("/legacy", createElement(ServerHomePage), "/:serverSlug");
    const guides = renderRoute("/legacy/guides", createElement(GuidesPage), "/:serverSlug/guides");

    expect(serverHome).toContain("wiki-card p-4 transition hover:border-primary/50");
    expect(serverHome).toContain("text-2xl font-bold text-white");
    expect(guides).toContain("wiki-card p-4 sm:p-6");
    expect(guides).toContain("rounded-lg border border-border/60 bg-black/50");
    expect(guides).not.toContain("font-serif text-5xl");
    expect(guides).toContain("Guides");
    expect(guides).toContain("Search guides");
  });

  it("applies the Chronicle shell to wiki-development and 404 pages without losing actions", () => {
    const development = renderRoute("/wiki-development", createElement(WikiDevelopmentPage));
    const notFound = renderRoute("/nope", createElement(NotFoundPage));

    expect(development).toContain("max-w-5xl px-4 py-12");
    expect(development).toContain("border-border/60 bg-card");
    expect(development).toContain("text-4xl font-bold tracking-tight text-white");
    expect(development).toContain("Browse GitHub issues");
    expect(notFound).toContain("wiki-card p-8");
    expect(notFound).toContain("text-4xl font-bold tracking-tight text-white");
    expect(notFound).toContain("Back to servers");
  });
});

describe("mobile layout contracts", () => {
  it("keeps page gutters, cards, and guide grids inside narrow viewports", () => {
    const serverHome = renderRoute("/legacy", createElement(ServerHomePage), "/:serverSlug");
    const guides = renderRoute("/legacy/guides", createElement(GuidesPage), "/:serverSlug/guides");

    expect(serverHome).toContain("space-y-6 sm:space-y-8");
    expect(serverHome).toContain("grid gap-4 sm:grid-cols-2 lg:grid-cols-3");
    expect(serverHome).toContain("p-4 transition hover:border-primary/50 hover:bg-black/70 sm:p-5");
    expect(guides).toContain("p-4 sm:p-6");
    expect(guides).toContain("text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl");
    expect(guides).toContain("grid gap-4 sm:grid-cols-2 xl:grid-cols-3");
  });

  it("turns raid contents into isolated horizontal in-page navigation on mobile", () => {
    const html = renderRoute("/legacy/raids/molten-core", createElement(RaidPage), "/:serverSlug/raids/:instanceSlug");

    expect(html).toContain("max-w-full overflow-hidden");
    expect(html).toContain("snap-x gap-2 overflow-x-auto overscroll-x-contain");
    expect(html).toContain("shrink-0 snap-start");
    expect(html).toContain("lg:sticky lg:top-24");
  });

  it("stacks boss guide sidebars and wraps dense unit metadata before desktop widths", () => {
    const html = renderRoute("/legacy/raids/molten-core/garr", createElement(BossGuidePage), "/:serverSlug/raids/:instanceSlug/:bossSlug");

    expect(html).toContain("grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]");
    expect(html).toContain("aside class=\"space-y-4 lg:sticky lg:top-24\"");
    expect(html).toContain("min-w-0 flex-1");
    expect(html).toContain("flex flex-wrap items-center justify-between gap-3");
  });
});
