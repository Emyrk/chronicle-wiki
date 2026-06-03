import { Bot, ExternalLink, Github, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { IssueQuicklink } from "@/components/IssueQuicklink";
import { SiteFooter } from "@/components/SiteFooter";
import { aiDisclosure, wikiDevelopmentLinks } from "@/data/wikiDevelopment";

export function WikiDevelopmentPage() {
  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-4 py-12">
        <Link to="/" className="text-sm text-muted-foreground hover:text-white">← Back to servers</Link>

        <section className="mt-6 wiki-card overflow-hidden">
          <div className="border-b border-white/10 bg-gradient-to-br from-primary/20 via-white/5 to-transparent p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs uppercase tracking-[0.25em] text-zinc-300">
              <Bot className="h-3.5 w-3.5" /> Disclosure
            </div>
            <h1 className="mt-5 font-serif text-4xl font-bold text-white md:text-6xl">{aiDisclosure.title}</h1>
            <p className="mt-4 max-w-3xl text-lg text-zinc-300">{aiDisclosure.summary}</p>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2">
            {aiDisclosure.sections.map((section) => (
              <article key={section.heading} className="rounded-xl border border-white/10 bg-black/25 p-5">
                <h2 className="flex items-center gap-2 font-serif text-2xl font-bold text-white">
                  <Sparkles className="h-5 w-5 text-primary" /> {section.heading}
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{section.body}</p>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-white/10 p-6">
            <IssueQuicklink />
            <a
              href={wikiDevelopmentLinks.githubIssues}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground hover:text-white"
            >
              <Github className="h-4 w-4" /> Browse GitHub issues <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <p className="basis-full max-w-3xl text-xs leading-5 text-muted-foreground">
              The quicklink opens a GitHub issue with the current URL and page context prefilled.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
