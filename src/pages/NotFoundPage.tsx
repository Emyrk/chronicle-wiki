import { Link } from "react-router-dom";
import { IssueQuicklink } from "@/components/IssueQuicklink";

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <div className="wiki-card p-8">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">404</p>
        <h1 className="mt-2 font-serif text-4xl font-bold text-white">Page not found</h1>
        <p className="mt-3 text-zinc-300">This wiki route does not exist yet.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <IssueQuicklink />
          <Link to="/" className="inline-block rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground hover:text-white">Back to servers</Link>
        </div>
      </div>
    </main>
  );
}
