import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { BookOpen, ExternalLink, Home, Search, TreePine } from "lucide-react";
import { resolveServerContext } from "@/data/servers";
import { IssueQuicklink } from "@/components/IssueQuicklink";
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
  const theme = context.branding.theme;
  const nav = [
    { to: `/${server.slug}`, label: "Home", icon: Home },
    { to: `/${server.slug}/guides`, label: "Guides", icon: BookOpen },
    { to: `/${server.slug}/talents`, label: "Talents", icon: TreePine },
    { to: `/${server.slug}/explorer`, label: "Units", icon: Search },
  ];

  return (
    <div
      className="wiki-tenant-shell min-h-screen overflow-x-hidden"
      style={{
        "--primary": theme.primary,
        "--ring": theme.accent,
        "--brand-accent": theme.accent,
        "--brand-background": theme.background ?? "#020617",
        "--brand-surface": theme.surface ?? "rgb(0 0 0 / 0.62)",
        "--brand-nav": theme.nav ?? "rgb(0 0 0 / 0.70)",
        "--brand-muted": theme.muted ?? "#93a4b8",
        "--brand-border": theme.border ?? "rgb(148 163 184 / 0.24)",
        "--muted-foreground": theme.muted ?? "#93a4b8",
        "--card": theme.surface ?? "rgb(0 0 0 / 0.62)",
        "--border": theme.border ?? "rgb(148 163 184 / 0.24)",
      } as React.CSSProperties}
    >
      <header className="wiki-tenant-nav border-b border-border/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-3 py-4 sm:px-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to={`/${server.slug}`} className="flex min-w-0 items-center gap-3">
            <img src={context.branding.logoUrl} alt="" className="h-11 w-11 rounded-lg border border-border/60 bg-black/70 object-cover" />
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Chronicle Wiki</div>
              <h1 className="truncate text-2xl font-bold tracking-tight text-white">{server.name}</h1>
              <div className="text-sm text-muted-foreground">{flavor.name} · {flavor.clientVersion}</div>
            </div>
          </Link>
          <div className="-mx-3 flex gap-2 overflow-x-auto overscroll-x-contain px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            <SiteSearch />
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === `/${server.slug}`}
                  className={({ isActive }) => cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition",
                    isActive ? "border-primary/70 bg-primary/15 text-white" : "border-border/60 bg-black/40 text-muted-foreground hover:border-primary/50 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
            <IssueQuicklink context={context} />
            <a
              href={context.chronicle.baseUrl}
              className="wiki-action wiki-primary-button"
            >
              Chronicle <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-4 sm:py-8">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
