import { DEFAULT_CHRONICLE_BASE_URL, DEFAULT_CHRONICLE_FAVICON_HREF, resolveAgnosticWikiMetadata } from "@/data/metadata";
import { getRaidInstance } from "@/data/instances";
import { classFromSlug } from "@/data/talents";
import { resolveServerContext } from "@/data/servers";
import type { ResolvedServerContext } from "@/types";

export const WIKI_BASE_URL = "https://wiki.chronicleclassic.com";
export const CHRONICLE_DEFAULT_IMAGE_URL = `${DEFAULT_CHRONICLE_BASE_URL}/chronicle-logo.svg`;

export interface PageMetadata {
  title: string;
  description: string;
  faviconHref: string;
  canonicalUrl: string;
  imageUrl: string;
  siteName: string;
}

export interface FaviconLinkDescriptor {
  rel: "icon" | "shortcut icon" | "apple-touch-icon";
  href: string;
}

export interface CanonicalLinkDescriptor {
  rel: "canonical";
  href: string;
}

export type MetaDescriptor =
  | { name: string; content: string }
  | { property: string; content: string };

export interface HeadMetadataDescriptor {
  canonical: CanonicalLinkDescriptor;
  meta: MetaDescriptor[];
}

const agnosticMetadata = resolveAgnosticWikiMetadata();

export const defaultPageMetadata: PageMetadata = {
  title: agnosticMetadata.branding.title,
  description: agnosticMetadata.branding.description,
  faviconHref: DEFAULT_CHRONICLE_FAVICON_HREF,
  canonicalUrl: canonicalUrlForPathname("/"),
  imageUrl: CHRONICLE_DEFAULT_IMAGE_URL,
  siteName: "Chronicle Wiki",
};

export function pageMetadataForContext(context: ResolvedServerContext): PageMetadata {
  return {
    title: context.branding.title,
    description: context.branding.description,
    faviconHref: context.branding.faviconHref,
    canonicalUrl: canonicalUrlForPathname(`/${context.server.slug}`),
    imageUrl: absoluteWikiUrl(context.branding.bannerUrl),
    siteName: "Chronicle Wiki",
  };
}

export function routeMetadataForPathname(pathname: string): PageMetadata {
  const normalizedPathname = normalizePathname(pathname);
  const segments = normalizedPathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { ...defaultPageMetadata, canonicalUrl: canonicalUrlForPathname("/") };
  }

  if (segments.length === 1 && segments[0] === "wiki-development") {
    return agnosticPageMetadata({
      title: "Wiki Development - Chronicle Wiki",
      description: "Track Chronicle Wiki development priorities, issue reporting, and contribution paths.",
      pathname: normalizedPathname,
    });
  }

  const context = resolveServerContext(segments[0]);
  if (!context) return notFoundMetadata(normalizedPathname);

  const serverPath = `/${context.server.slug}`;
  if (segments.length === 1) {
    return serverPageMetadata(context, {
      title: `${context.server.name} - Chronicle Wiki`,
      description: context.server.description,
      pathname: serverPath,
    });
  }

  if (segments.length === 2 && segments[1] === "guides") {
    return serverPageMetadata(context, {
      title: `${context.server.name} Guides - Chronicle Wiki`,
      description: `Raid and dungeon guides for ${context.server.name}, organized by instance and encounter.`,
      pathname: `${serverPath}/guides`,
    });
  }

  if (segments.length >= 2 && segments[1] === "talents") {
    const selectedClass = classFromSlug(segments[2]);
    if (segments[2] && (!selectedClass || !context.talents.classIds.includes(selectedClass.id))) {
      return notFoundMetadata(normalizedPathname, context);
    }

    const classPrefix = selectedClass ? `${selectedClass.name} ` : "";
    const classDescription = selectedClass ? `${selectedClass.name} ` : "";
    const pathSuffix = selectedClass ? `/${selectedClass.slug}` : "";
    return serverPageMetadata(context, {
      title: `${classPrefix}Talent Calculator - ${context.server.name} - Chronicle Wiki`,
      description: `Plan and share ${classDescription}talent builds for ${context.server.name}.`,
      pathname: `${serverPath}/talents${pathSuffix}`,
    });
  }

  if (segments.length === 2 && segments[1] === "explorer") {
    return serverPageMetadata(context, {
      title: `Unit Explorer - ${context.server.name} - Chronicle Wiki`,
      description: `Explore ${context.server.name} creatures and spells cast for raid planning.`,
      pathname: `${serverPath}/explorer`,
    });
  }

  if (segments.length >= 3 && segments[1] === "raids") {
    const instance = getRaidInstance(segments[2]);
    if (!instance) return notFoundMetadata(normalizedPathname, context);

    if (segments.length === 3) {
      return serverPageMetadata(context, {
        title: `${instance.title} - ${context.server.name} - Chronicle Wiki`,
        description: instance.description,
        pathname: `${serverPath}/raids/${instance.slug}`,
        imageUrl: instance.backgroundImagePath ? absoluteWikiUrl(instance.backgroundImagePath) : undefined,
      });
    }

    if (segments.length === 4) {
      const encounter = instance.encounters.find((candidate) => candidate.slug === segments[3]);
      if (!encounter) return notFoundMetadata(normalizedPathname, context);

      return serverPageMetadata(context, {
        title: `${instance.title} - ${context.server.name} - Chronicle Wiki`,
        description: instance.description,
        pathname: `${serverPath}/raids/${instance.slug}`,
        imageUrl: instance.backgroundImagePath ? absoluteWikiUrl(instance.backgroundImagePath) : undefined,
      });
    }
  }

  return notFoundMetadata(normalizedPathname, context);
}

export function renderFaviconLinks(metadata: PageMetadata): FaviconLinkDescriptor[] {
  return [
    { rel: "icon", href: metadata.faviconHref },
    { rel: "shortcut icon", href: metadata.faviconHref },
    { rel: "apple-touch-icon", href: metadata.faviconHref },
  ];
}

export function renderHeadMetadata(metadata: PageMetadata): HeadMetadataDescriptor {
  return {
    canonical: { rel: "canonical", href: metadata.canonicalUrl },
    meta: [
      { name: "description", content: metadata.description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: metadata.siteName },
      { property: "og:title", content: metadata.title },
      { property: "og:description", content: metadata.description },
      { property: "og:url", content: metadata.canonicalUrl },
      { property: "og:image", content: metadata.imageUrl },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: metadata.title },
      { name: "twitter:description", content: metadata.description },
      { name: "twitter:image", content: metadata.imageUrl },
    ],
  };
}

export function applyPageMetadata(doc: Document, metadata: PageMetadata) {
  doc.title = metadata.title;
  setFaviconLinks(doc, renderFaviconLinks(metadata));
  setCanonicalLink(doc, renderHeadMetadata(metadata).canonical);
  setMetaDescriptors(doc, renderHeadMetadata(metadata).meta);
}

function agnosticPageMetadata(input: { title: string; description: string; pathname: string }): PageMetadata {
  return {
    title: input.title,
    description: input.description,
    faviconHref: DEFAULT_CHRONICLE_FAVICON_HREF,
    canonicalUrl: canonicalUrlForPathname(input.pathname),
    imageUrl: CHRONICLE_DEFAULT_IMAGE_URL,
    siteName: "Chronicle Wiki",
  };
}

function serverPageMetadata(
  context: ResolvedServerContext,
  input: { title: string; description: string; pathname: string; imageUrl?: string },
): PageMetadata {
  return {
    title: input.title,
    description: input.description,
    faviconHref: context.branding.faviconHref,
    canonicalUrl: canonicalUrlForPathname(input.pathname),
    imageUrl: input.imageUrl ?? absoluteWikiUrl(context.branding.bannerUrl),
    siteName: "Chronicle Wiki",
  };
}

function notFoundMetadata(pathname: string, context?: ResolvedServerContext): PageMetadata {
  return {
    title: "Page not found - Chronicle Wiki",
    description: "This Chronicle Wiki route does not exist yet.",
    faviconHref: context?.branding.faviconHref ?? DEFAULT_CHRONICLE_FAVICON_HREF,
    canonicalUrl: canonicalUrlForPathname(pathname),
    imageUrl: context ? absoluteWikiUrl(context.branding.bannerUrl) : CHRONICLE_DEFAULT_IMAGE_URL,
    siteName: "Chronicle Wiki",
  };
}

function canonicalUrlForPathname(pathname: string) {
  return `${WIKI_BASE_URL}${normalizePathname(pathname)}`;
}

function normalizePathname(pathname: string) {
  const pathOnly = pathname.split(/[?#]/)[0] ?? "/";
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  const withoutTrailingSlash = withLeadingSlash.length > 1 ? withLeadingSlash.replace(/\/+$/, "") : withLeadingSlash;
  return withoutTrailingSlash || "/";
}

function absoluteWikiUrl(url: string) {
  if (/^https?:\/\//.test(url)) return url;
  const normalizedPath = url.startsWith("/") ? url : `/${url}`;
  return `${WIKI_BASE_URL}${normalizedPath}`;
}

function setCanonicalLink(doc: Document, descriptor: CanonicalLinkDescriptor) {
  let link = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = doc.createElement("link");
    link.rel = descriptor.rel;
    doc.head.append(link);
  }
  link.href = descriptor.href;
}

function setMetaDescriptors(doc: Document, descriptors: MetaDescriptor[]) {
  descriptors.forEach((descriptor) => {
    const selector = "name" in descriptor ? `meta[name="${descriptor.name}"]` : `meta[property="${descriptor.property}"]`;
    let meta = doc.head.querySelector<HTMLMetaElement>(selector);
    if (!meta) {
      meta = doc.createElement("meta");
      if ("name" in descriptor) meta.name = descriptor.name;
      else meta.setAttribute("property", descriptor.property);
      doc.head.append(meta);
    }
    meta.content = descriptor.content;
  });
}

function setFaviconLinks(doc: Document, links: FaviconLinkDescriptor[]) {
  const managedLinks = Array.from(doc.head.querySelectorAll<HTMLLinkElement>('link[data-chronicle-managed="favicon"]'));

  links.forEach((descriptor, index) => {
    const link = managedLinks[index] ?? doc.createElement("link");
    link.rel = descriptor.rel;
    link.href = descriptor.href;
    link.dataset.chronicleManaged = "favicon";
    if (!link.parentElement) doc.head.append(link);
  });

  managedLinks.slice(links.length).forEach((link) => link.remove());
}
