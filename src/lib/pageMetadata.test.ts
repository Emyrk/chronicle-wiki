import { describe, expect, it } from "vitest";
import { resolveServerContext } from "../data/servers";
import type { ResolvedServerContext } from "@/types";
import { defaultPageMetadata, pageMetadataForContext, renderFaviconLinks } from "./pageMetadata";

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
    const legacy = context("legacy");
    const emptyFaviconContext: ResolvedServerContext = {
      server: { ...legacy.server, faviconUrl: "" },
      flavor: { ...legacy.flavor, faviconUrl: "" },
    };

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
