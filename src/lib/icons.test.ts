import { describe, expect, it } from "vitest";
import { iconBucketForContext, iconUrl, talentBackgroundUrl } from "./icons";
import { resolveServerContext, serverList } from "../data/servers";

function context(slug: string) {
  const resolved = resolveServerContext(slug);
  if (!resolved) throw new Error(`missing context for ${slug}`);
  return resolved;
}

describe("icon buckets", () => {
  it("uses hardcoded server-specific buckets", () => {
    expect(iconBucketForContext(context("legacy"))).toBe("azerothcore");
    expect(iconBucketForContext(context("turtle"))).toBe("turtle");
    expect(iconBucketForContext(context("octo"))).toBe("octowow");
    expect(iconBucketForContext(context("kronos"))).toBe("kronos");
    expect(iconBucketForContext(context("vanillaplus"))).toBe("vanillaplus");
    expect(iconBucketForContext(context("chromie"))).toBe("azerothcore");
    expect(iconBucketForContext(context("oldmanwarcraft"))).toBe("azerothcore");
    expect(iconBucketForContext(context("faebright"))).toBe("azerothcore");
    expect(iconBucketForContext(context("nostrum"))).toBe("azerothcore");
    expect(iconBucketForContext(context("warmane"))).toBe("warmane");
  });

  it("has an icon bucket on every server", () => {
    expect(serverList.every((server) => server.iconBucket.length > 0)).toBe(true);
  });

  it("builds Chronicle icon URLs without the removed /icons bucket", () => {
    expect(iconUrl("Spell_Holy_DispelMagic", context("turtle"))).toBe(
      "https://icons.chronicleclassic.com/turtle/spell_holy_dispelmagic.webp",
    );
    expect(iconUrl("Ability_MeleeDamage", context("turtle"))).toBe(
      "https://icons.chronicleclassic.com/turtle/ability_meleedamage.webp",
    );
  });

  it("builds talent background URLs from TalentTab backgroundFile values in the contextual bucket", () => {
    expect(talentBackgroundUrl("MageFire", context("turtle"))).toBe(
      "https://icons.chronicleclassic.com/turtle/magefire.webp",
    );
    expect(talentBackgroundUrl("WarriorArms", context("vanillaplus"))).toBe(
      "https://icons.chronicleclassic.com/vanillaplus/warriorarms.webp",
    );
    expect(talentBackgroundUrl("", context("turtle"))).toBeNull();
  });

  it("keeps talent background URLs out of the removed flat /icons path", () => {
    expect(talentBackgroundUrl("MageFire", context("turtle"))).not.toContain("/icons/");
  });
});
