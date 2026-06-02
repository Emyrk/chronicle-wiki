import { ExternalLink, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { serverList } from "@/data/servers";

const donationLinks = serverList.filter((server) => server.donationUrl);

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/25">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 text-sm text-muted-foreground md:grid-cols-[1.2fr_1fr_1fr]">
        <section>
          <p className="font-serif text-lg font-bold text-white">© 2026 Chronicle</p>
          <p className="mt-3 max-w-xl text-zinc-300">
            Open-source raid log analysis for Classic World of Warcraft. Per-server privacy and terms are on each server&apos;s Chronicle.
          </p>
        </section>

        <nav aria-label="Wiki links">
          <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">Wiki</h2>
          <div className="mt-3 flex flex-col gap-2">
            <Link to="/" className="hover:text-white">Server selector</Link>
            <a href="https://chronicleclassic.com/" className="inline-flex items-center gap-1 hover:text-white">
              Chronicle <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </nav>

        <nav aria-label="Donation links">
          <h2 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
            <Heart className="h-3.5 w-3.5" /> Donate
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
            {donationLinks.map((server) => (
              <a key={server.slug} href={server.donationUrl} className="hover:text-white">
                {server.shortName}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </footer>
  );
}
