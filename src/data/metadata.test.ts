import { describe, expect, it } from "vitest";
import { getRaidInstance } from "./instances";
import {
  DEFAULT_CHRONICLE_FAVICON_HREF,
  resolveAgnosticWikiMetadata,
  resolveInstanceMetadata,
  resolveWikiMetadataFromCatalog,
} from "./metadata";
import { flavors, resolveWikiMetadata, servers } from "./servers";

const moltenCore = getRaidInstance("molten-core");
if (!moltenCore) throw new Error("missing molten core fixture");

describe("canonical wiki metadata contract", () => {
  it("resolves server-specific metadata in one canonical context", () => {
    const turtle = resolveWikiMetadata("turtle");

    expect(turtle?.server.slug).toBe("turtle");
    expect(turtle?.flavor.slug).toBe("nightmares-of-ursol");
    expect(turtle?.chronicle.baseUrl).toBe("https://turtle.chronicleclassic.com");
    expect(turtle?.branding.logoUrl).toBe("https://chronicleclassic.com/servers/turtle/logo.png");
    expect(turtle?.branding.faviconHref).toBe("https://chronicleclassic.com/servers/turtle/logo.png");
    expect(turtle?.branding.theme).toMatchObject({
      primary: "#5f9bb8",
      accent: "#c8a45c",
      background: "#242424",
      surface: "#2b2b2b",
      nav: "#222222",
      muted: "#c7c7c7",
      heroBackgroundUrl: "https://turtle.chronicleclassic.com/c/images/herobackground.avif",
    });
    expect(turtle?.talents).toEqual({
      maxLevel: 60,
      maxTalentPoints: 51,
      iconBucket: "turtle",
      classIds: [1, 2, 3, 4, 5, 7, 8, 9, 11],
    });
  });

  it("exposes Death Knight class capability only for Wrath servers", () => {
    expect(resolveWikiMetadata("chromie")?.talents.classIds).toContain(6);
    expect(resolveWikiMetadata("nostrum")?.talents.classIds).toContain(6);
    expect(resolveWikiMetadata("warmane")?.talents.classIds).toContain(6);

    expect(resolveWikiMetadata("turtle")?.talents.classIds).not.toContain(6);
    expect(resolveWikiMetadata("vanillaplus")?.talents.classIds).not.toContain(6);
    expect(resolveWikiMetadata("faebright")?.talents.classIds).not.toContain(6);
  });

  it("provides an agnostic metadata context for site-level pages", () => {
    expect(resolveAgnosticWikiMetadata()).toEqual({
      branding: {
        title: "Chronicle Wiki",
        description: "Chronicle Wiki, server-scoped Classic WoW knowledgebase powered by Chronicle data.",
        faviconHref: DEFAULT_CHRONICLE_FAVICON_HREF,
      },
      chronicle: { baseUrl: "https://chronicleclassic.com" },
    });
  });

  it("uses flavor fallback metadata before falling back to legacy guides", () => {
    const octo = resolveWikiMetadata("octo");

    expect(octo?.flavor.slug).toBe("nightmares-of-ursol");
    expect(octo?.fallbackFlavor.slug).toBe("legacy");
    expect(octo?.guideBaseFlavorSlug).toBe("legacy");
  });

  it("centralizes instance background fallback behavior", () => {
    expect(resolveInstanceMetadata(moltenCore).backgroundImagePath).toBe("/assets/instances/molten-core/background.jpg");
    expect(resolveInstanceMetadata({ ...moltenCore, backgroundImagePath: "" }).backgroundImagePath).toBeUndefined();
  });

  it("treats blank optional favicon fields as missing", () => {
    const context = resolveWikiMetadataFromCatalog("legacy", {
      flavors: { legacy: { ...flavors.legacy, faviconUrl: "" } },
      servers: { legacy: { ...servers.legacy, faviconUrl: "" } },
    });

    expect(context?.branding.faviconHref).toBe(DEFAULT_CHRONICLE_FAVICON_HREF);
  });

  it("throws a contract error for missing required metadata fields", () => {
    expect(() =>
      resolveWikiMetadataFromCatalog("broken", {
        flavors,
        servers: {
          broken: { ...servers.legacy, slug: "broken", chronicleBaseUrl: "" },
        },
      }),
    ).toThrow("Server broken is missing required metadata: chronicleBaseUrl");

    expect(() =>
      resolveWikiMetadataFromCatalog("unknown-flavor", {
        flavors,
        servers: {
          "unknown-flavor": { ...servers.legacy, slug: "unknown-flavor", flavor: "missing" },
        },
      }),
    ).toThrow("Server unknown-flavor references unknown flavor missing");
  });
});
