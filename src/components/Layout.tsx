import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { BookOpen, ExternalLink, Home, Search, TreePine } from "lucide-react";
import { resolveServerContext } from "@/data/servers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteSearch } from "@/components/SiteSearch";
import { cn } from "@/lib/utils";

export function Layout() {
  const { serverSlug } = useParams();
  const context = resolveServerContext(serverSlug);

  if (!context) {
    return <Outlet />;
  }

  const { server, flavor } = context;
  const nav = [
    { to: `/${server.slug}`, label: "Home", icon: Home },
    { to: `/${server.slug}/guides`, label: "Guides", icon: BookOpen },
    { to: `/${server.slug}/talents`, label: "Talents", icon: TreePine },
    { to: `/${server.slug}/explorer`, label: "Units", icon: Search },
  ];

  return (
    <div
      className="min-h-screen"
      style={{
        "--primary": server.theme.primary,
        "--ring": server.theme.accent,
      } as React.CSSProperties}
    >
      <header className="border-b border-white/10 bg-black/35 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to={`/${server.slug}`} className="flex items-center gap-3">
            <img src={server.logoUrl} alt="" className="h-12 w-12 rounded-lg border border-white/10 object-cover" />
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Chronicle Wiki</div>
              <h1 className="font-serif text-2xl font-bold text-white">{server.name}</h1>
              <div className="text-sm text-muted-foreground">{flavor.name} · {flavor.clientVersion}</div>
            </div>
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <SiteSearch />
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === `/${server.slug}`}
                  className={({ isActive }) => cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                    isActive ? "border-primary bg-primary/15 text-white" : "border-white/10 bg-white/5 text-muted-foreground hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
            <a
              href={server.chronicleBaseUrl}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-muted-foreground hover:text-white"
            >
              Chronicle <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
