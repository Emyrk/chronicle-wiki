import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Search } from "lucide-react";
import { globalSearchResults } from "@/data/search";

export function SiteSearch() {
  const { serverSlug } = useParams();
  const [query, setQuery] = useState("");
  const results = useMemo(() => globalSearchResults(serverSlug ?? "legacy", query).slice(0, 6), [serverSlug, query]);
  const showResults = query.trim().length > 0;

  return (
    <div className="relative w-full lg:w-72">
      <label className="flex items-center gap-2 rounded-lg border border-border/60 bg-black/50 px-3 py-2 text-sm text-muted-foreground focus-within:border-primary/70 focus-within:text-white">
        <Search className="h-4 w-4" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search wiki..."
          className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-muted-foreground"
        />
      </label>
      {showResults && (
        <div className="absolute right-0 z-20 mt-2 w-full overflow-hidden rounded-lg border border-border/60 bg-zinc-950 shadow-2xl shadow-black/40 lg:w-96">
          {results.length > 0 ? (
            results.map((result) => (
              <Link
                key={`${result.category}/${result.href}`}
                to={result.href}
                onClick={() => setQuery("")}
                className="block border-b border-border/60 px-4 py-3 last:border-b-0 hover:bg-black/50"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-white">{result.title}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{result.category}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{result.description}</p>
              </Link>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-muted-foreground">No results yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
