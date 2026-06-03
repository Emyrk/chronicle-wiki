import { Bug } from "lucide-react";
import { useLocation } from "react-router-dom";
import { buildWikiIssueUrl, issueQuicklinkLabel } from "@/lib/issueQuicklink";
import { cn } from "@/lib/utils";
import type { ResolvedServerContext } from "@/types";

interface IssueQuicklinkProps {
  context?: ResolvedServerContext;
  className?: string;
}

export function IssueQuicklink({ context, className }: IssueQuicklinkProps) {
  const location = useLocation();
  const issueHref = buildWikiIssueUrl(context, `${location.pathname}${location.search}${location.hash}`);

  return (
    <a
      href={issueHref}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-100 transition hover:border-amber-300/40 hover:bg-amber-300/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70",
        className,
      )}
    >
      <Bug className="h-4 w-4" />
      {issueQuicklinkLabel}
    </a>
  );
}
