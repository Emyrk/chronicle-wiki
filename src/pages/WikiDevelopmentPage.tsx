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

        <section className="mt-6 wiki-card overflow-hidden border-border/60 bg-card">
          <div className="border-b border-border/60 bg-gradient-to-br from-primary/15 via-black/50 to-transparent p-8">
            <div className="inline-flex items-center gap-2 rounded border border-border/60 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.25em] text-zinc-300">
              <Bot className="h-3.5 w-3.5" /> Disclosure
            </div>
            <h1 className="mt-5 text-4xl font-bold tracking-tight text-white md:text-6xl">{aiDisclosure.title}</h1>
            <p className="mt-4 max-w-3xl text-lg text-zinc-300">{aiDisclosure.summary}</p>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2">
            {aiDisclosure.sections.map((section) => (
              <article key={section.heading} className="rounded-lg border border-border/60 bg-black/40 p-5">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                  <Sparkles className="h-5 w-5 text-primary" /> {section.heading}
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-300">{section.body}</p>
              </article>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-border/60 p-6">
            <IssueQuicklink />
            <a
              href={wikiDevelopmentLinks.githubIssues}
              className="wiki-action"
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
