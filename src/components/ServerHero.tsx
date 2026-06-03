import type { ResolvedServerContext } from "@/types";

export function ServerHero({ context, eyebrow }: { context: ResolvedServerContext; eyebrow?: string }) {
  const { server, flavor } = context;
  return (
    <section className="wiki-card overflow-hidden">
      <div className="relative min-h-64">
        <img src={context.branding.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
        <div className="relative flex min-h-64 flex-col justify-end p-6 md:p-8">
          <div className="mb-4 flex flex-wrap gap-2">
            {(eyebrow ? [eyebrow, ...server.tags] : server.tags).map((tag) => <span key={tag} className="wiki-pill">{tag}</span>)}
          </div>
          <div className="flex flex-col gap-5 md:flex-row md:items-end">
            <img src={context.branding.logoUrl} alt={`${server.name} logo`} className="h-24 w-24 rounded-2xl border border-white/15 object-cover shadow-2xl" />
            <div>
              <h1 className="text-4xl font-bold text-white md:text-6xl">{server.name}</h1>
              <p className="mt-2 max-w-3xl text-lg text-zinc-200">{server.description}</p>
              <p className="mt-3 text-sm text-muted-foreground">Flavor: {flavor.name} · Max level {context.talents.maxLevel} · {context.talents.maxTalentPoints} talent points</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
