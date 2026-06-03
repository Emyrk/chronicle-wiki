export interface BossSuccessRate {
  bossSlug: string;
  successRate: number;
  sampleSize: number;
}

// Typed stand-in for Chronicle ranking success rates until the wiki consumes the live endpoint.
// Desired API: GET /api/v1/rankings/success-rates?instance_name=Molten+Core
// Response: { instance_name: string, encounters: Array<{ encounter_name: string, boss_slug: string, success_rate: number, attempts: number, kills: number }> }
const moltenCoreSuccessRatesByServer: Record<string, BossSuccessRate[]> = {
  turtle: [
    { bossSlug: "lucifron", successRate: 0.89, sampleSize: 128 },
    { bossSlug: "magmadar", successRate: 0.87, sampleSize: 126 },
    { bossSlug: "gehennas", successRate: 0.84, sampleSize: 121 },
    { bossSlug: "garr", successRate: 0.82, sampleSize: 118 },
    { bossSlug: "shazzrah", successRate: 0.8, sampleSize: 116 },
    { bossSlug: "baron-geddon", successRate: 0.79, sampleSize: 113 },
    { bossSlug: "golemagg-the-incinerator", successRate: 0.81, sampleSize: 109 },
    { bossSlug: "sulfuron-harbinger", successRate: 0.77, sampleSize: 105 },
    { bossSlug: "majordomo-executus", successRate: 0.74, sampleSize: 96 },
    { bossSlug: "ragnaros", successRate: 0.78, sampleSize: 90 },
  ],
};

const fallbackMoltenCoreSuccessRates: BossSuccessRate[] = moltenCoreSuccessRatesByServer.turtle;

export function moltenCoreBossSuccessRates(serverSlug: string): BossSuccessRate[] {
  return [...(moltenCoreSuccessRatesByServer[serverSlug] ?? fallbackMoltenCoreSuccessRates)];
}

export function moltenCoreBossSuccessRate(serverSlug: string, bossSlug: string): BossSuccessRate | undefined {
  return moltenCoreBossSuccessRates(serverSlug).find((entry) => entry.bossSlug === bossSlug);
}

export function formatSuccessRate(rate: BossSuccessRate | undefined) {
  if (!rate) return "No clears yet";
  return `${Math.round(rate.successRate * 100)}% clears`;
}
