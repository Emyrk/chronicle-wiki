import { Heart } from "lucide-react";

const donationLinks = [
  {
    label: "GitHub Sponsors",
    href: "https://github.com/sponsors/Emyrk",
  },
  {
    label: "Patreon",
    href: "https://www.patreon.com/cw/ChronicleClassic",
  },
  {
    label: "Buy Me a Coffee",
    href: "https://buymeacoffee.com/chronicleclassic",
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm text-muted-foreground sm:px-6 md:grid-cols-3 lg:px-8">
        <nav aria-label="Chronicle links">
          <h2 className="text-base font-semibold text-white">Chronicle</h2>
          <div className="mt-3 flex flex-col gap-2">
            <a href="https://github.com/Emyrk/chronicle" className="hover:text-white">GitHub</a>
          </div>
        </nav>

        <nav aria-label="Community links">
          <h2 className="text-base font-semibold text-white">Community</h2>
          <div className="mt-3 flex flex-col gap-2">
            <a href="https://discord.gg/chronicleclassic" className="hover:text-white">
              Discord
            </a>
            <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contribute support</p>
            {donationLinks.map((link, index) => (
              <a key={link.href} href={link.href} className="inline-flex items-center gap-1 hover:text-white">
                {index === 0 && <Heart className="h-3.5 w-3.5 text-pink-400" />}
                {link.label}
              </a>
            ))}
          </div>
        </nav>

        <section>
          <p className="text-sm text-muted-foreground">© 2026 Chronicle</p>
          <p className="mt-3 max-w-sm text-sm leading-5 text-muted-foreground">
            Open-source raid log analysis for Classic World of Warcraft. Per-server privacy and terms are on each server&apos;s Chronicle.
          </p>
        </section>
      </div>
    </footer>
  );
}
