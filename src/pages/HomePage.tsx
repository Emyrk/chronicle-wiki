import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { IssueQuicklink } from "@/components/IssueQuicklink";
import { SiteFooter } from "@/components/SiteFooter";
import { resolveWikiMetadata, serverList } from "@/data/servers";
import { resolveChronicleSiteStyle, rootChronicleWikiTheme } from "@/styles/chronicleSiteLanguage";

const chronicleLogoUrl = "https://chronicleclassic.com/chronicle-logo.svg";

export function HomePage() {
  return (
    <div className="chronicle-site-shell wiki-tenant-shell min-h-screen" style={resolveChronicleSiteStyle(rootChronicleWikiTheme)}>
      <main className="mx-auto max-w-6xl px-4 pt-8 pb-12 sm:px-6 sm:pt-12 lg:px-8">
        <section className="mx-auto flex max-w-3xl flex-col items-center py-8 text-center sm:py-12">
          <img src={chronicleLogoUrl} alt="Chronicle" className="h-28 w-auto opacity-95" />
          <h1 className="mt-8 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Private server knowledgebase
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Server-scoped guides and tools powered by Chronicle data. Pick the server you play on; related realms share a common starting point.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm">
            <IssueQuicklink />
            <span className="text-border">·</span>
            <a href="https://github.com/Emyrk/chronicle-wiki" className="wiki-action wiki-secondary-button">
              <Github className="h-4 w-4" /> chronicle-wiki
            </a>
          </div>
        </section>

        <section className="relative grid auto-rows-[1fr] gap-6 md:grid-cols-2 xl:grid-cols-3">
          {serverList.map((server) => {
            const metadata = resolveWikiMetadata(server.slug);
            if (!metadata) return null;

            return (
              <Link key={server.slug} to={`/${server.slug}`} className="wiki-server-card wiki-card group border-border/60 bg-card saturate-[0.65] hover:saturate-100">
                <div className="relative h-28 overflow-hidden border-b border-border/60">
                  <img src={metadata.branding.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40 transition-opacity group-hover:opacity-55" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/35 to-card" />
                  {server.status && <span className="absolute right-3 top-3 rounded-sm border border-red-500/40 bg-red-900/80 px-2 py-1 text-xs font-bold uppercase tracking-widest text-red-200">{server.status}</span>}
                </div>
                <div className="wiki-server-card-body">
                  <div className="flex items-center gap-3">
                    <img src={metadata.branding.logoUrl} alt={`${server.name} logo`} className="h-10 w-10 object-cover" style={{ borderRadius: "var(--brand-button-radius)" }} />
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-white">{server.name}</h2>
                      <p className="truncate text-sm text-muted-foreground">{server.subtitle}</p>
                    </div>
                  </div>
                  <p className="line-clamp-3 text-sm leading-6 text-zinc-300">{server.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {server.tags.slice(0, 4).map((tag) => <span key={tag} className="wiki-pill">{tag}</span>)}
                  </div>
                  <div className="wiki-server-card-footer">
                    <span className="wiki-action wiki-server-card-primary-action">Open wiki</span>
                    {server.websiteUrl && <span className="wiki-action wiki-server-card-secondary-action">Website</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
