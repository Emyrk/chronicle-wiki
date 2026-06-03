import { ExternalLink, Heart } from "lucide-react";
import { Link } from "react-router-dom";

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
        <section>
          <p className="text-sm text-muted-foreground">© 2026 Chronicle</p>
          <p className="mt-3 max-w-sm text-sm leading-5 text-muted-foreground">
            Open-source raid log analysis for Classic World of Warcraft. Per-server privacy and terms are on each server&apos;s Chronicle.
          </p>
        </section>

        <nav aria-label="Wiki links">
          <h2 className="text-base font-semibold text-white">Wiki</h2>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/" className="hover:text-white">Server selector</Link>
            <a href="https://chronicleclassic.com/" className="inline-flex items-center gap-1 hover:text-white">
              Chronicle <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </nav>

        <nav aria-label="Donation links">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-white">
            <Heart className="h-3.5 w-3.5 text-pink-400" /> Donate
          </h2>
          <div className="mt-3 flex flex-col gap-2">
            {donationLinks.map((link) => (
              <a key={link.href} href={link.href} className="inline-flex items-center gap-1 hover:text-white">
                {link.label} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </nav>
      </div>
    </footer>
  );
}
