import { describe, expect, it } from "vitest";
import { buildWikiIssueUrl, issueLocationForRoute, issueRepoFromGithubUrl } from "./issueQuicklink";

describe("issue quicklink helpers", () => {
  it("derives the GitHub issue repository from the configured repository URL", () => {
    expect(issueRepoFromGithubUrl("https://github.com/Emyrk/chronicle-wiki")).toBe("Emyrk/chronicle-wiki");
    expect(issueRepoFromGithubUrl("https://github.com/Emyrk/chronicle-wiki/")).toBe("Emyrk/chronicle-wiki");
  });

  it("uses the current client route when building page context after navigation", () => {
    expect(issueLocationForRoute({
      href: "https://wiki.chronicleclassic.com/turtle",
      host: "wiki.chronicleclassic.com",
      pathname: "/turtle",
    }, "/turtle/raids/molten-core/lucifron")).toEqual({
      href: "https://wiki.chronicleclassic.com/turtle/raids/molten-core/lucifron",
      host: "wiki.chronicleclassic.com",
      pathname: "/turtle/raids/molten-core/lucifron",
    });
  });

  it("builds a per-page issue URL for non-server pages", () => {
    const href = buildWikiIssueUrl(undefined, "/wiki-development", {
      href: "https://wiki.chronicleclassic.com/",
      host: "wiki.chronicleclassic.com",
      pathname: "/",
    });
    const url = new URL(href);

    expect(url.origin + url.pathname).toBe("https://github.com/Emyrk/chronicle-wiki/issues/new");
    expect(url.searchParams.get("title")).toBe("Wiki error report");
    expect(url.searchParams.get("body")).toContain("Page URL: https://wiki.chronicleclassic.com/wiki-development");
    expect(url.searchParams.get("body")).toContain("Host: wiki.chronicleclassic.com");
    expect(url.searchParams.get("body")).toContain("Path: /wiki-development");
  });
});
