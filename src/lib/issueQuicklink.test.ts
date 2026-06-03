import { describe, expect, it } from "vitest";
import { issueLocationForRoute, issueRepoFromGithubUrl } from "./issueQuicklink";

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
});
