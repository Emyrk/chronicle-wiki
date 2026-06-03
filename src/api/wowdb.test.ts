import { describe, expect, it } from "vitest";
import { extractReferencedSpellIds, resolveSpellDescription, type WoWSpell } from "./wowdb";

function spell(partial: Partial<WoWSpell> & Pick<WoWSpell, "id">): WoWSpell {
  return {
    name: { "0": `Spell ${partial.id}` },
    description: { "0": "" },
    aura_description: { "0": "" },
    spell_level: 1,
    base_level: 1,
    max_level: 60,
    duration: { ID: 1, Duration: 0, DurationPerLevel: 0, MaxDuration: 0 },
    range: { ID: 1, RangeMin: 0, RangeMax: 0, Flags: 0, Name: "Self" },
    effect_base_points: [0, 0, 0],
    effect_die_sides: [1, 1, 1],
    effect_base_dice: [1, 1, 1],
    effect_dice_per_level: [0, 0, 0],
    effect_real_points_per_level: [0, 0, 0],
    effect_aura_period: [0, 0, 0],
    effect_radius: [],
    effect_amplitude: [0, 0, 0],
    effect_chain_targets: [0, 0, 0],
    effect_points_per_combo: [0, 0, 0],
    proc_charges: 0,
    proc_chance: 0,
    cumulative_aura: 0,
    max_target_level: 0,
    ...partial,
    id: partial.id,
  };
}

describe("WoW spell description resolver", () => {
  it("resolves Fireball-style direct, periodic, and duration parameters", () => {
    const fireball = spell({
      id: 133,
      description: { "0": "Hurls a fiery ball that causes $s1 Fire damage and an additional $o2 Fire damage over $d." },
      effect_base_points: [24, 2, 0],
      effect_die_sides: [7, 1, 1],
      effect_base_dice: [1, 1, 1],
      effect_aura_period: [0, 2000, 0],
      duration: { ID: 21, Duration: 8000, DurationPerLevel: 0, MaxDuration: 8000 },
    });

    expect(resolveSpellDescription(fireball, fireball.description!["0"])).toBe(
      "Hurls a fiery ball that causes 25 to 31 Fire damage and an additional 12 Fire damage over 8 sec.",
    );
  });

  it("extracts and resolves Holy Nova-style cross-spell parameters", () => {
    const holyNova = spell({
      id: 15237,
      description: { "0": "Causes an explosion of holy light around the caster, causing $23455s1 Holy damage to all enemy targets within $23455a1 yards and healing all party members within $23455a1 yards for $23455s2." },
    });
    const referenced = spell({
      id: 23455,
      effect_base_points: [27, 49, 0],
      effect_die_sides: [8, 14, 1],
      effect_base_dice: [1, 1, 1],
      effect_radius: [
        { ID: 13, Radius: 10, RadiusPerLevel: 0, RadiusMin: 0, RadiusMax: 10 },
        { ID: 13, Radius: 10, RadiusPerLevel: 0, RadiusMin: 0, RadiusMax: 10 },
      ],
    });

    expect(extractReferencedSpellIds(holyNova.description!["0"])).toEqual([23455]);
    expect(resolveSpellDescription(holyNova, holyNova.description!["0"], new Map([[23455, referenced]]))).toBe(
      "Causes an explosion of holy light around the caster, causing 28 to 35 Holy damage to all enemy targets within 10 yards and healing all party members within 10 yards for 50 to 63.",
    );
  });

  it("resolves DBC arithmetic and multiplier parameters", () => {
    const spellWithMath = spell({
      id: 999,
      description: { "0": "Increases the value by $*8;s1 and grants ${$m1*3} bonus armor." },
      effect_base_points: [4, 0, 0],
      effect_die_sides: [1, 1, 1],
      effect_base_dice: [1, 1, 1],
    });

    expect(resolveSpellDescription(spellWithMath, spellWithMath.description!["0"])).toBe(
      "Increases the value by 40 and grants 15 bonus armor.",
    );
  });

  it("resolves WoW pluralization tokens from the preceding number", () => {
    const pluralized = spell({
      id: 1000,
      description: { "0": "Gives $s1 extra $lpoint:points;. Gives $s2 extra $lpoint:points;." },
      effect_base_points: [0, 1, 0],
      effect_die_sides: [1, 1, 1],
      effect_base_dice: [1, 1, 1],
    });

    expect(resolveSpellDescription(pluralized, pluralized.description!["0"])).toBe(
      "Gives 1 extra point. Gives 2 extra points.",
    );
  });
});
