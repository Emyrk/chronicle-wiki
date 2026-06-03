import { describe, expect, it } from "vitest";
import { resolveServerContext } from "../data/servers";
import { pageMetadataForContext, renderFaviconLinks } from "./pageMetadata";

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

  it("falls back to flavor favicon metadata when a server has no override", () => {
    expect(pageMetadataForContext(context("legacy")).faviconHref).toBe("https://chronicleclassic.com/favicon.ico");
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
