import { wikiDevelopmentLinks } from "../data/wikiDevelopment";
import { buildGithubIssueUrl } from "./githubIssue";
import type { ResolvedServerContext } from "../types";

export const issueQuicklinkLabel = "Report an issue";

type CurrentLocation = Partial<Pick<Location, "href" | "host" | "pathname">>;

function browserLocation(): CurrentLocation | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location;
}

export function issueRepoFromGithubUrl(repositoryUrl: string) {
  try {
    const url = new URL(repositoryUrl);
    if (url.hostname !== "github.com") return url.pathname.replace(/^\/+|\/+$/g, "");
    return url.pathname.split("/").filter(Boolean).slice(0, 2).join("/");
  } catch {
    return repositoryUrl.replace(/^https:\/\/github\.com\//, "").replace(/^\/+|\/+$/g, "");
  }
}

export function issueLocationForRoute(currentLocation: CurrentLocation | undefined, routePath: string) {
  if (!currentLocation?.href) {
    return {
      host: currentLocation?.host,
      pathname: routePath,
    };
  }

  const routeUrl = new URL(routePath, currentLocation.href);

  return {
    href: routeUrl.toString(),
    host: currentLocation.host ?? routeUrl.host,
    pathname: routeUrl.pathname,
  };
}

export function buildWikiIssueUrl(context: ResolvedServerContext | undefined, routePath: string, currentLocation = browserLocation()) {
  return buildGithubIssueUrl({
    repo: issueRepoFromGithubUrl(wikiDevelopmentLinks.githubRepository),
    context,
    location: issueLocationForRoute(currentLocation, routePath),
  });
}
