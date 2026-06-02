import { describe, expect, it } from "vitest";
import { iconBucketForContext, iconUrl } from "./icons";
import { resolveServerContext } from "../data/servers";

function context(slug: string) {
  const resolved = resolveServerContext(slug);
  if (!resolved) throw new Error(`missing context for ${slug}`);
  return resolved;
}

describe("icon buckets", () => {
  it("uses server-specific buckets when available", () => {
    expect(iconBucketForContext(context("turtle"))).toBe("turtle");
    expect(iconBucketForContext(context("octo"))).toBe("octowow");
    expect(iconBucketForContext(context("vanillaplus"))).toBe("vanillaplus");
    expect(iconBucketForContext(context("warmane"))).toBe("warmane");
  });

  it("falls back to the flavor bucket", () => {
    expect(iconBucketForContext(context("legacy"))).toBe("azerothcore");
    expect(iconBucketForContext(context("chromie"))).toBe("azerothcore");
  });

  it("builds Chronicle icon URLs without the removed /icons bucket", () => {
    expect(iconUrl("Spell_Holy_DispelMagic", context("turtle"))).toBe(
      "https://icons.chronicleclassic.com/turtle/spell_holy_dispelmagic.webp",
    );
  });
});
