import type { ResolvedServerContext } from "@/types";

export function iconBucketForContext(context: ResolvedServerContext) {
  return context.talents.iconBucket;
}

export function iconUrl(texture: string, context: ResolvedServerContext) {
  const bucket = iconBucketForContext(context);
  return `https://icons.chronicleclassic.com/${bucket}/${texture.toLowerCase()}.webp`;
}

export function talentBackgroundUrl(backgroundFile: string | null | undefined, context: ResolvedServerContext) {
  const name = backgroundFile?.trim();
  if (!name) return null;
  const bucket = iconBucketForContext(context);
  return `https://icons.chronicleclassic.com/${bucket}/talent-backgrounds/${name.toLowerCase()}.webp`;
}
