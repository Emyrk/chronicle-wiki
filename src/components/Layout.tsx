import { Link, NavLink, Outlet, useParams } from "react-router-dom";
import { BookOpen, ExternalLink, Home, TreePine } from "lucide-react";
import { resolveServerContext } from "@/data/servers";
import { IssueQuicklink } from "@/components/IssueQuicklink";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteSearch } from "@/components/SiteSearch";
import { cn } from "@/lib/utils";
import { resolveChronicleSiteStyle } from "@/styles/chronicleSiteLanguage";

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
  ];

  return (
    <div
      className="chronicle-site-shell wiki-tenant-shell min-h-screen overflow-x-hidden"
      style={resolveChronicleSiteStyle(theme)}
    >
      <header className="chronicle-site-nav wiki-tenant-nav border-b border-border/60">
        <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:min-h-16 lg:flex-row lg:items-center lg:justify-between">
          <Link to={`/${server.slug}`} className="flex min-w-0 items-center gap-3 lg:w-64">
            <img src={context.branding.logoUrl} alt="" className="h-10 w-10 border border-border/60 bg-black/70 object-cover" style={{ borderRadius: "var(--brand-radius)" }} />
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Chronicle Wiki</div>
              <h1 className="truncate text-xl font-bold tracking-tight text-white">{server.name}</h1>
              <div className="text-sm text-muted-foreground">{flavor.name} · {flavor.clientVersion}</div>
            </div>
          </Link>
          <Link to={`/${server.slug}`} className="hidden items-center justify-center 2xl:absolute 2xl:left-1/2 2xl:flex 2xl:-translate-x-1/2" aria-label="Chronicle Wiki home">
            <img src="https://chronicleclassic.com/chronicle-logo.svg" alt="Chronicle" className="h-11 w-auto opacity-90" />
          </Link>
          <div className="-mx-3 flex gap-3 overflow-x-auto overscroll-x-contain px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 lg:flex-nowrap lg:justify-end">
            <SiteSearch />
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === `/${server.slug}`}
                  className={({ isActive }) => cn(
                    "wiki-nav-link",
                    isActive ? "text-white" : "",
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
