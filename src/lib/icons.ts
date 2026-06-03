import type { ResolvedServerContext } from "@/types";

export function iconBucketForContext(context: ResolvedServerContext) {
  return context.talents.iconBucket;
}

export function iconUrl(texture: string, context: ResolvedServerContext) {
  const bucket = iconBucketForContext(context);
  return `https://icons.chronicleclassic.com/${bucket}/${texture.toLowerCase()}.webp`;
}
