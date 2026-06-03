import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { IssueQuicklink } from "@/components/IssueQuicklink";
import { SiteFooter } from "@/components/SiteFooter";
import { serverList } from "@/data/servers";

export function HomePage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-10">
        <section className="mb-8 text-center">
          <img src="https://chronicleclassic.com/chronicle-logo.svg" alt="Chronicle" className="mx-auto mb-6 h-20" />
          <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Chronicle Wiki</p>
          <h1 className="mt-3 font-serif text-5xl font-bold text-white md:text-7xl">Private server knowledgebase</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-zinc-300">
            Server-scoped guides and tools powered by Chronicle datasets. Pick the server you play on; shared flavors inherit baseline content underneath.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <IssueQuicklink />
            <a href="https://github.com/Emyrk/chronicle-wiki" className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground hover:text-white">
              <Github className="h-4 w-4" /> chronicle-wiki
            </a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {serverList.map((server) => (
            <Link key={server.slug} to={`/${server.slug}`} className="wiki-card group overflow-hidden transition hover:-translate-y-1 hover:border-primary/60">
              <div className="relative h-36">
                <img src={server.bannerUrl} alt="" className="h-full w-full object-cover opacity-70 transition group-hover:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                <img src={server.logoUrl} alt="" className="absolute bottom-3 left-3 h-16 w-16 rounded-xl border border-white/15 object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-white">{server.name}</h2>
                    <p className="text-sm text-muted-foreground">{server.subtitle}</p>
                  </div>
                  {server.status && <span className="wiki-pill capitalize">{server.status}</span>}
                </div>
                <p className="mt-3 line-clamp-3 text-sm text-zinc-300">{server.description}</p>
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
