import { createElement } from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { SiteFooter } from "@/components/SiteFooter";
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
  it("anchors global CSS to chronicleclassic.com tokens instead of a Turtle tenant or blue-black dashboard theme", () => {
    const css = readFileSync("src/index.css", "utf8");

    expect(css).toContain("--background: oklch(28.91% 0 0)");
    expect(css).toContain("--card: oklch(26.86% 0 0)");
    expect(css).toContain("--primary: #5f8fa6");
    expect(css).toContain("--muted-foreground: oklch(75.93% 0.0073 67.7161)");
    expect(css).toContain("--border: oklch(34.07% 0 0)");
    expect(css).toContain("--radius: 0.5rem");
    expect(css).toContain("radial-gradient(circle at 50% 0%");
    expect(css).not.toContain("turtle.chronicleclassic.com/c/fonts");
    expect(css).not.toContain("#020617");
  });

  it("uses the shared Chronicle shell on the server selector instead of a standalone wiki dashboard", () => {
    const html = renderRoute("/", createElement(HomePage));

    expect(html).toContain("chronicle-site-shell");
    expect(html).toContain("chronicle-logo.svg");
    expect(html).toContain("wiki-server-card");
    expect(html).not.toContain("Chronicle is currently in beta");
  });

  it("applies global Chronicle home tokens to Turtle and non-Turtle routes", () => {
    const renderServerHome = (path: string) => renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
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

    const turtle = renderServerHome("/turtle");
    const vanillaplus = renderServerHome("/vanillaplus");

    expect(turtle).toContain("--primary:#5f8fa6");
    expect(turtle).toContain("--brand-background:oklch(28.91% 0 0)");
    expect(turtle).toContain("--brand-surface:oklch(26.86% 0 0)");
    expect(turtle).not.toContain("--primary:#5f9bb8");
    expect(turtle).not.toContain("herobackground.avif");
    expect(vanillaplus).toContain("--primary:#5f8fa6");
    expect(vanillaplus).not.toContain("--primary:#7c3aed");
    expect(turtle).toContain("wiki-tenant-shell");
    expect(turtle).toContain("wiki-tenant-nav");
    expect(turtle).toContain("wiki-main-site-hero");
    expect(turtle).toContain("wiki-primary-button");
    expect(turtle).not.toContain("debug");
  });

  it("uses the square Chronicle C logo on the Legacy Vanilla server card while preserving the home wordmark", () => {
    const html = renderRoute("/", createElement(HomePage));

    expect(html).toContain('src="https://chronicleclassic.com/chronicle-logo.svg" alt="Chronicle"');
    expect(html).toContain('src="https://chronicleclassic.com/chronicle-logo.png" alt="Legacy Vanilla logo"');
    expect(html).not.toContain('src="https://chronicleclassic.com/chronicle-logo.svg" alt="Legacy Vanilla logo"');
    expect(html.match(/src="https:\/\/chronicleclassic\.com\/chronicle-logo\.svg"/g)).toHaveLength(1);
  });

  it("renders the server selector with Chronicle home server-card structure and footer actions", () => {
    const html = renderRoute("/", createElement(HomePage));

    expect(html).toContain("mx-auto max-w-6xl px-4 pt-8 pb-12");
    expect(html).toContain("text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl");
    expect(html).toContain("h-28");
    expect(html).toContain("wiki-server-card");
    expect(html).toContain("wiki-server-card-body");
    expect(html).toContain("wiki-server-card-footer");
    expect(html).toContain("Open wiki");
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

  it("keeps the wiki footer on Steven's Chronicle support links", () => {
    const footerSource = readFileSync("src/components/SiteFooter.tsx", "utf8");
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(SiteFooter)));

    expect(footerSource).not.toContain("serverList.filter((server) => server.donationUrl)");
    expect(html).toContain("Server selector");
    expect(html).toContain("https://chronicleclassic.com/");
    expect(html).toContain("https://github.com/sponsors/Emyrk");
    expect(html).toContain("https://www.patreon.com/cw/ChronicleClassic");
    expect(html).toContain("https://buymeacoffee.com/chronicleclassic");
    expect(html).toContain("GitHub Sponsors");
    expect(html).toContain("Patreon");
    expect(html).toContain("Buy Me a Coffee");
    expect(html).not.toContain("https://turtlecraft.gg/#/donate");
    expect(footerSource).not.toContain("import { Github");
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
