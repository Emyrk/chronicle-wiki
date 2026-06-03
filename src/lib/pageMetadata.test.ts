import { describe, expect, it } from "vitest";
import { flavors, resolveServerContext, servers } from "../data/servers";
import { resolveWikiMetadataFromCatalog } from "../data/metadata";
import { defaultPageMetadata, pageMetadataForContext, renderFaviconLinks, renderHeadMetadata, routeMetadataForPathname } from "./pageMetadata";

function context(slug: string) {
  const resolved = resolveServerContext(slug);
  if (!resolved) throw new Error(`missing context for ${slug}`);
  return resolved;
}

describe("server page metadata", () => {
  it("resolves a server-specific favicon from server metadata", () => {
    expect(pageMetadataForContext(context("turtle")).faviconHref).toBe("https://chronicleclassic.com/servers/turtle/logo.png");
    expect(pageMetadataForContext(context("octo")).faviconHref).toBe("https://chronicleclassic.com/servers/octowow/logo.webp");
  });

  it("falls back to the Chronicle favicon when a server has no favicon override", () => {
    expect(pageMetadataForContext(context("legacy")).faviconHref).toBe(defaultPageMetadata.faviconHref);
    expect(pageMetadataForContext(context("kronos")).faviconHref).toBe(defaultPageMetadata.faviconHref);
    expect(pageMetadataForContext(context("chromie")).faviconHref).toBe(defaultPageMetadata.faviconHref);
  });

  it("treats empty server and flavor favicon metadata as missing", () => {
    const emptyFaviconContext = resolveWikiMetadataFromCatalog("legacy", {
      flavors: { legacy: { ...flavors.legacy, faviconUrl: "" } },
      servers: { legacy: { ...servers.legacy, faviconUrl: "" } },
    });
    if (!emptyFaviconContext) throw new Error("missing legacy context");

    expect(pageMetadataForContext(emptyFaviconContext).faviconHref).toBe(defaultPageMetadata.faviconHref);
    expect(renderFaviconLinks(pageMetadataForContext(emptyFaviconContext)).every((link) => link.href.length > 0)).toBe(true);
  });

  it("renders stable favicon tags whose href changes across server contexts", () => {
    expect(renderFaviconLinks(pageMetadataForContext(context("turtle")))).toEqual([
      { rel: "icon", href: "https://chronicleclassic.com/servers/turtle/logo.png" },
      { rel: "shortcut icon", href: "https://chronicleclassic.com/servers/turtle/logo.png" },
      { rel: "apple-touch-icon", href: "https://chronicleclassic.com/servers/turtle/logo.png" },
    ]);

    expect(renderFaviconLinks(pageMetadataForContext(context("octo"))).map((link) => link.href)).toEqual([
      "https://chronicleclassic.com/servers/octowow/logo.webp",
      "https://chronicleclassic.com/servers/octowow/logo.webp",
      "https://chronicleclassic.com/servers/octowow/logo.webp",
    ]);
  });
});

describe("route page metadata", () => {
  it("uses Chronicle defaults for server-agnostic routes", () => {
    expect(routeMetadataForPathname("/")).toMatchObject({
      title: "Chronicle Wiki",
      canonicalUrl: "https://wiki.chronicleclassic.com/",
      imageUrl: "https://chronicleclassic.com/chronicle-logo.svg",
    });
    expect(routeMetadataForPathname("/wiki-development")).toMatchObject({
      title: "Wiki Development - Chronicle Wiki",
      canonicalUrl: "https://wiki.chronicleclassic.com/wiki-development",
      imageUrl: "https://chronicleclassic.com/chronicle-logo.svg",
    });
  });

  it("builds server-branded metadata for server home and guides", () => {
    expect(routeMetadataForPathname("/turtle")).toMatchObject({
      title: "Turtle WoW - Chronicle Wiki",
      description: "Vanilla 1.12-based server with extensive custom quests, zones, dungeons, raids, races, and class changes.",
      canonicalUrl: "https://wiki.chronicleclassic.com/turtle",
      imageUrl: "https://chronicleclassic.com/servers/turtle/banner.webp",
    });
    expect(routeMetadataForPathname("/turtle/guides")).toMatchObject({
      title: "Turtle WoW Guides - Chronicle Wiki",
      description: "Raid and dungeon guides for Turtle WoW, organized by instance and encounter.",
      canonicalUrl: "https://wiki.chronicleclassic.com/turtle/guides",
      imageUrl: "https://chronicleclassic.com/servers/turtle/banner.webp",
    });
  });

  it("builds route-specific instance, boss, talents, and explorer metadata", () => {
    expect(routeMetadataForPathname("/turtle/raids/molten-core")).toMatchObject({
      title: "Molten Core - Turtle WoW - Chronicle Wiki",
      description: "A ten-boss level 60 raid below Blackrock Mountain, built for quick boss lookup and server-scoped Chronicle context.",
      canonicalUrl: "https://wiki.chronicleclassic.com/turtle/raids/molten-core",
      imageUrl: "https://wiki.chronicleclassic.com/assets/instances/molten-core/background.jpg",
    });
    expect(routeMetadataForPathname("/turtle/raids/molten-core/garr")).toMatchObject({
      title: "Garr Guide - Turtle WoW - Chronicle Wiki",
      description: "Turtle-style servers start from the Legacy Garr plan, then add Nightmares of Ursol differences where the fight diverges.",
      canonicalUrl: "https://wiki.chronicleclassic.com/turtle/raids/molten-core/garr",
    });
    expect(routeMetadataForPathname("/turtle/talents/mage")).toMatchObject({
      title: "Mage Talent Calculator - Turtle WoW - Chronicle Wiki",
      description: "Plan and share Mage talent builds for Turtle WoW.",
    });
    expect(routeMetadataForPathname("/turtle/explorer")).toMatchObject({
      title: "Unit Explorer - Turtle WoW - Chronicle Wiki",
      description: "Explore Turtle WoW creatures and spells cast for raid planning.",
    });
  });

  it("returns a sensible 404 metadata object for unknown routes", () => {
    expect(routeMetadataForPathname("/missing-route")).toMatchObject({
      title: "Page not found - Chronicle Wiki",
      description: "This Chronicle Wiki route does not exist yet.",
      canonicalUrl: "https://wiki.chronicleclassic.com/missing-route",
    });
    expect(routeMetadataForPathname("/turtle/talents/death-knight")).toMatchObject({
      title: "Page not found - Chronicle Wiki",
      description: "This Chronicle Wiki route does not exist yet.",
      canonicalUrl: "https://wiki.chronicleclassic.com/turtle/talents/death-knight",
    });
  });

  it("describes canonical, OpenGraph, and Twitter head tags", () => {
    const head = renderHeadMetadata(routeMetadataForPathname("/turtle/raids/molten-core"));

    expect(head.canonical).toEqual({ rel: "canonical", href: "https://wiki.chronicleclassic.com/turtle/raids/molten-core" });
    expect(head.meta).toContainEqual({ property: "og:title", content: "Molten Core - Turtle WoW - Chronicle Wiki" });
    expect(head.meta).toContainEqual({ property: "og:image", content: "https://wiki.chronicleclassic.com/assets/instances/molten-core/background.jpg" });
    expect(head.meta).toContainEqual({ name: "twitter:card", content: "summary_large_image" });
  });
});
