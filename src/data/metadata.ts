import type { InstanceDefinition } from "./instances";

export const DEFAULT_CHRONICLE_BASE_URL = "https://chronicleclassic.com";
export const DEFAULT_CHRONICLE_FAVICON_HREF = "https://chronicleclassic.com/favicon.ico";

export type Expansion = "vanilla" | "tbc" | "wotlk";

export interface WikiFlavorMetadata {
  slug: string;
  name: string;
  expansion: Expansion;
  clientVersion: string;
  maxLevel: number;
  maxTalentPoints: number;
  faviconUrl?: string;
  fallbackFlavor?: string;
}

export interface WikiServerMetadata {
  slug: string;
  name: string;
  shortName: string;
  subtitle: string;
  description: string;
  status?: "open" | "closed" | "archived";
  tags: string[];
  chronicleBaseUrl: string;
  websiteUrl?: string;
  logoUrl: string;
  bannerUrl: string;
  faviconUrl?: string;
  flavor: string;
  iconBucket: string;
  theme: {
    primary: string;
    accent: string;
    background?: string;
    surface?: string;
    nav?: string;
    muted?: string;
    border?: string;
    heroBackgroundUrl?: string;
  };
}

export interface WikiMetadataCatalog {
  flavors: Record<string, WikiFlavorMetadata>;
  servers: Record<string, WikiServerMetadata>;
}

export interface ResolvedWikiMetadata {
  server: WikiServerMetadata;
  flavor: WikiFlavorMetadata;
  fallbackFlavor: WikiFlavorMetadata;
  guideBaseFlavorSlug: string;
  branding: {
    title: string;
    description: string;
    logoUrl: string;
    bannerUrl: string;
    faviconHref: string;
    theme: WikiServerMetadata["theme"];
  };
  chronicle: {
    baseUrl: string;
  };
  talents: {
    maxLevel: number;
    maxTalentPoints: number;
    iconBucket: string;
  };
}

export interface AgnosticWikiMetadata {
  branding: {
    title: string;
    description: string;
    faviconHref: string;
  };
  chronicle: {
    baseUrl: string;
  };
}

export interface InstanceResolvedMetadata {
  slug: string;
  title: string;
  kind: InstanceDefinition["kind"];
  status: InstanceDefinition["status"];
  backgroundImagePath?: string;
}

const requiredServerFields = [
  "slug",
  "name",
  "shortName",
  "subtitle",
  "description",
  "chronicleBaseUrl",
  "logoUrl",
  "bannerUrl",
  "flavor",
  "iconBucket",
] as const;

const requiredFlavorFields = ["slug", "name", "expansion", "clientVersion", "maxLevel", "maxTalentPoints"] as const;

export function resolveWikiMetadataFromCatalog(slug: string | undefined, catalog: WikiMetadataCatalog): ResolvedWikiMetadata | undefined {
  if (!slug) return undefined;
  const server = catalog.servers[slug.toLowerCase()];
  if (!server) return undefined;
  assertRequiredMetadata(`Server ${server.slug}`, server, requiredServerFields);

  const flavor = catalog.flavors[server.flavor];
  if (!flavor) throw new Error(`Server ${server.slug} references unknown flavor ${server.flavor}`);
  assertRequiredMetadata(`Flavor ${flavor.slug}`, flavor, requiredFlavorFields);

  const fallbackFlavorSlug = flavor.fallbackFlavor ?? flavor.slug;
  const fallbackFlavor = catalog.flavors[fallbackFlavorSlug];
  if (!fallbackFlavor) throw new Error(`Flavor ${flavor.slug} references unknown fallback flavor ${fallbackFlavorSlug}`);
  assertRequiredMetadata(`Flavor ${fallbackFlavor.slug}`, fallbackFlavor, requiredFlavorFields);

  const baseUrl = trimRequiredUrl(server.chronicleBaseUrl);
  const faviconHref = firstPresent(server.faviconUrl, flavor.faviconUrl, fallbackFlavor.faviconUrl, DEFAULT_CHRONICLE_FAVICON_HREF);

  return {
    server,
    flavor,
    fallbackFlavor,
    guideBaseFlavorSlug: fallbackFlavor.slug,
    branding: {
      title: `${server.name} - Chronicle Wiki`,
      description: `${server.name} wiki guides and tools for ${flavor.name}.`,
      logoUrl: server.logoUrl,
      bannerUrl: server.bannerUrl,
      faviconHref,
      theme: server.theme,
    },
    chronicle: { baseUrl },
    talents: {
      maxLevel: flavor.maxLevel,
      maxTalentPoints: flavor.maxTalentPoints,
      iconBucket: server.iconBucket,
    },
  };
}

export function resolveAgnosticWikiMetadata(): AgnosticWikiMetadata {
  return {
    branding: {
      title: "Chronicle Wiki",
      description: "Chronicle Wiki, server-scoped Classic WoW knowledgebase powered by Chronicle data.",
      faviconHref: DEFAULT_CHRONICLE_FAVICON_HREF,
    },
    chronicle: { baseUrl: DEFAULT_CHRONICLE_BASE_URL },
  };
}

export function resolveInstanceMetadata(instance: InstanceDefinition): InstanceResolvedMetadata {
  const backgroundImagePath = firstPresent(instance.backgroundImagePath);
  return {
    slug: instance.slug,
    title: instance.title,
    kind: instance.kind,
    status: instance.status,
    ...(backgroundImagePath ? { backgroundImagePath } : {}),
  };
}

function assertRequiredMetadata<T extends object, K extends keyof T>(label: string, value: T, requiredFields: readonly K[]) {
  const missing = requiredFields.filter((field) => !isPresent(value[field]));
  if (missing.length > 0) throw new Error(`${label} is missing required metadata: ${missing.join(", ")}`);
}

function trimRequiredUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

function firstPresent(...values: Array<string | undefined>) {
  return values.find(isPresent) ?? "";
}

function isPresent(value: unknown): value is string {
  if (typeof value === "string") return value.trim().length > 0;
  return value !== undefined && value !== null;
}
