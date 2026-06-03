import type { ResolvedServerContext } from "@/types";

export interface PageMetadata {
  title: string;
  description: string;
  faviconHref: string;
}

export interface FaviconLinkDescriptor {
  rel: "icon" | "shortcut icon" | "apple-touch-icon";
  href: string;
}

const chronicleFaviconHref = "https://chronicleclassic.com/favicon.ico";

export const defaultPageMetadata: PageMetadata = {
  title: "Chronicle Wiki",
  description: "Chronicle Wiki, server-scoped Classic WoW knowledgebase powered by Chronicle data.",
  faviconHref: chronicleFaviconHref,
};

export function pageMetadataForContext(context: ResolvedServerContext): PageMetadata {
  const { server, flavor } = context;
  return {
    title: `${server.name} - Chronicle Wiki`,
    description: `${server.name} wiki guides and tools for ${flavor.name}.`,
    faviconHref: resolveFaviconHref(server.faviconUrl),
  };
}

function resolveFaviconHref(faviconUrl: string | undefined): string {
  const trimmed = faviconUrl?.trim();
  return trimmed || chronicleFaviconHref;
}

export function renderFaviconLinks(metadata: PageMetadata): FaviconLinkDescriptor[] {
  return [
    { rel: "icon", href: metadata.faviconHref },
    { rel: "shortcut icon", href: metadata.faviconHref },
    { rel: "apple-touch-icon", href: metadata.faviconHref },
  ];
}

export function applyPageMetadata(doc: Document, metadata: PageMetadata) {
  doc.title = metadata.title;
  setDescription(doc, metadata.description);
  setFaviconLinks(doc, renderFaviconLinks(metadata));
}

function setDescription(doc: Document, description: string) {
  let meta = doc.head.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!meta) {
    meta = doc.createElement("meta");
    meta.name = "description";
    doc.head.append(meta);
  }
  meta.content = description;
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
