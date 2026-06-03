import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { IssueQuicklink } from "@/components/IssueQuicklink";
import { SiteFooter } from "@/components/SiteFooter";
import { serverList } from "@/data/servers";

export function HomePage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 py-12">
        <section className="mb-8 max-w-3xl">
          <img src="https://chronicleclassic.com/chronicle-logo.svg" alt="Chronicle" className="mb-6 h-16" />
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Chronicle Wiki</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-white md:text-6xl">Private server knowledgebase</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">
            Server-scoped guides and tools powered by Chronicle datasets. Pick the server you play on; shared flavors inherit baseline content underneath.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <IssueQuicklink />
            <a href="https://github.com/Emyrk/chronicle-wiki" className="wiki-action">
              <Github className="h-4 w-4" /> chronicle-wiki
            </a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {serverList.map((server) => (
            <Link key={server.slug} to={`/${server.slug}`} className="wiki-card group overflow-hidden border-border/60 bg-card transition hover:border-primary/50 hover:bg-black/70">
              <div className="relative h-28">
                <img src={server.bannerUrl} alt="" className="h-full w-full object-cover opacity-65 transition group-hover:opacity-85" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                <img src={server.logoUrl} alt="" className="absolute bottom-3 left-3 h-12 w-12 rounded-lg border border-border/60 bg-black/70 object-cover" />
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
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
