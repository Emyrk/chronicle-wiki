import type { ResolvedServerContext } from "@/types";

export function ServerHero({ context, eyebrow }: { context: ResolvedServerContext; eyebrow?: string }) {
  const { server, flavor } = context;
  const heroBackgroundUrl = context.branding.bannerUrl;
  return (
    <section className="wiki-card wiki-main-site-hero overflow-hidden">
      <div className="relative min-h-[22rem]">
        <img src={heroBackgroundUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-38" />
        <div className="absolute inset-0 bg-background/80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/35" />
        <div className="relative flex min-h-[22rem] flex-col items-center justify-center px-6 py-16 text-center md:px-8 md:py-24">
          <div className="mb-5 flex flex-wrap justify-center gap-2">
            {(eyebrow ? [eyebrow, ...server.tags] : server.tags).map((tag) => <span key={tag} className="wiki-pill">{tag}</span>)}
          </div>
          <div className="mx-auto max-w-4xl">
            <img src={context.branding.logoUrl} alt={`${server.name} logo`} className="mx-auto mb-5 h-16 w-16 border border-white/15 object-cover shadow-lg" style={{ borderRadius: "var(--brand-radius)" }} />
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">{server.name}</h1>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-zinc-200 md:text-xl">{server.description}</p>
            <p className="mt-4 text-sm text-muted-foreground">{flavor.name} · Level cap {context.talents.maxLevel} · {context.talents.maxTalentPoints} talent points</p>
          </div>
        </div>
      </div>
    </section>
  );
}
