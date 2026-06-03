import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { GuidesPage } from "./GuidesPage";
import { HomePage } from "./HomePage";
import { NotFoundPage } from "./NotFoundPage";
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
  it("renders the server selector with Chronicle-style compact cards instead of oversized fantasy panels", () => {
    const html = renderRoute("/", createElement(HomePage));

    expect(html).toContain("max-w-6xl");
    expect(html).toContain("text-4xl font-bold tracking-tight text-white");
    expect(html).toContain("h-28");
    expect(html).toContain("border-border/60 bg-card");
    expect(html).not.toContain("font-serif text-5xl");
    expect(html).toContain("Legacy Vanilla");
    expect(html).toContain("Turtle WoW");
  });

  it("keeps server home and guide pages on the same Chronicle card system", () => {
    const serverHome = renderRoute("/legacy", createElement(ServerHomePage), "/:serverSlug");
    const guides = renderRoute("/legacy/guides", createElement(GuidesPage), "/:serverSlug/guides");

    expect(serverHome).toContain("wiki-card p-5 transition hover:border-primary/50");
    expect(serverHome).toContain("text-2xl font-bold text-white");
    expect(guides).toContain("wiki-card p-6");
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
