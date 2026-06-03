import { Link, useParams } from "react-router-dom";
import { BookOpen, Search, TreePine } from "lucide-react";
import { resolveServerContext } from "@/data/servers";
import { ServerHero } from "@/components/ServerHero";
import { NotFoundPage } from "./NotFoundPage";

export function ServerHomePage() {
  const { serverSlug } = useParams();
  const context = resolveServerContext(serverSlug);
  if (!context) return <NotFoundPage />;
  const { server } = context;

  const cards = [
    { to: `/${server.slug}/guides`, title: "Guides", body: "Raid and dungeon guide sections, starting with Molten Core as the first raid guide.", icon: BookOpen },
    { to: `/${server.slug}/talents`, title: "Talent calculator", body: "Dataset-aware talent trees for the selected server.", icon: TreePine },
    { to: `/${server.slug}/explorer`, title: "Unit explorer", body: "Creatures and spells cast, ready for log-derived data.", icon: Search },
  ];

  return (
    <div className="space-y-8">
      <ServerHero context={context} />
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.to} to={card.to} className="wiki-card p-5 transition hover:-translate-y-1 hover:border-primary/60">
              <Icon className="mb-4 h-8 w-8 text-primary" />
              <h2 className="font-serif text-2xl font-bold text-white">{card.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
