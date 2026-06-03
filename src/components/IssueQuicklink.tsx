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
        "wiki-action",
        className,
      )}
    >
      <Bug className="h-4 w-4" />
      {issueQuicklinkLabel}
    </a>
  );
}
