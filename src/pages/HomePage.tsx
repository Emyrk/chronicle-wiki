import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { IssueQuicklink } from "@/components/IssueQuicklink";
import { SiteFooter } from "@/components/SiteFooter";
import { resolveWikiMetadata, serverList } from "@/data/servers";
import { resolveChronicleSiteStyle, rootChronicleWikiTheme } from "@/styles/chronicleSiteLanguage";

const chronicleLogoUrl = "https://turtle.chronicleclassic.com/c/chronicle/ChronicleLogoCenter.svg";

export function HomePage() {
  return (
    <div className="chronicle-site-shell wiki-tenant-shell min-h-screen" style={resolveChronicleSiteStyle(rootChronicleWikiTheme)}>
      <div className="chronicle-beta-banner wiki-site-beta px-4 py-2 text-center text-sm text-muted-foreground">
        🧪 <span className="font-medium text-primary">Beta</span> Chronicle is currently in beta. Bugs and feedback can be reported from the wiki.
      </div>
      <header className="chronicle-site-nav wiki-tenant-nav border-b border-border/60">
        <nav className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-4" aria-label="Chronicle Wiki">
          <Link to="/" className="wiki-nav-link font-medium text-white">Server selector</Link>
          <Link to="/" className="absolute left-1/2 -translate-x-1/2" aria-label="Chronicle Wiki home">
            <img src={chronicleLogoUrl} alt="Chronicle" className="h-11 w-auto opacity-90" />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/wiki-development" className="wiki-nav-link">Feedback</Link>
            <a href="https://chronicleclassic.com/" className="wiki-action wiki-primary-button">Chronicle</a>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-12">
        <section className="wiki-section max-w-3xl py-16">
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Chronicle Wiki</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-6xl">Private server knowledgebase</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">
            Server-scoped guides and tools powered by Chronicle data. Pick the server you play on; related realms share a common starting point.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <IssueQuicklink />
            <a href="https://github.com/Emyrk/chronicle-wiki" className="wiki-action wiki-secondary-button">
              <Github className="h-4 w-4" /> chronicle-wiki
            </a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {serverList.map((server) => {
            const metadata = resolveWikiMetadata(server.slug);
            if (!metadata) return null;

            return (
              <Link key={server.slug} to={`/${server.slug}`} className="wiki-server-card wiki-card group overflow-hidden border-border/60 bg-card transition hover:border-primary/50 hover:bg-black/50">
                <div className="relative h-20 border-b border-border/60">
                  <img src={metadata.branding.bannerUrl} alt="" className="h-full w-full object-cover opacity-45 transition group-hover:opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/55" />
                  <img src={metadata.branding.logoUrl} alt="" className="absolute bottom-3 left-3 h-11 w-11 border border-border/60 bg-black/70 object-cover" style={{ borderRadius: "var(--brand-radius)" }} />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-bold text-white">{server.name}</h2>
                      <p className="text-sm text-muted-foreground">{server.subtitle}</p>
                    </div>
                    {server.status && <span className="wiki-pill capitalize">{server.status}</span>}
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-zinc-300">{server.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {server.tags.slice(0, 4).map((tag) => <span key={tag} className="wiki-pill">{tag}</span>)}
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
