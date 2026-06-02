import { Link, useParams } from "react-router-dom";
import { resolveServerContext } from "@/data/servers";
import { moltenCoreBosses, resolveGuide } from "@/data/guides";
import { NotFoundPage } from "./NotFoundPage";

export function RaidPage() {
  const { serverSlug } = useParams();
  const context = resolveServerContext(serverSlug);
  if (!context) return <NotFoundPage />;

  return (
    <div className="space-y-6">
      <div className="wiki-card p-6">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">{context.server.name}</p>
        <h1 className="mt-2 font-serif text-5xl font-bold text-white">Molten Core</h1>
        <p className="mt-3 max-w-3xl text-zinc-300">
          MVP raid hub. Garr is wired as the first real boss guide; the rest are placeholders for the same inheritance and override model.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {moltenCoreBosses.map((boss) => {
          const guide = resolveGuide(context.server.slug, `raids/molten-core/${boss.slug}`);
          return (
            <Link key={boss.slug} to={`/${context.server.slug}/raids/molten-core/${boss.slug}`} className="wiki-card p-5 transition hover:-translate-y-1 hover:border-primary/60">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-serif text-2xl font-bold text-white">{boss.name}</h2>
                <span className="wiki-pill">{boss.status}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{guide?.summary ?? "Guide stub. Add content once spell and unit data are available."}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
