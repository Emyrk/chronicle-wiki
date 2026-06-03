import { describe, expect, it } from "vitest";
import { buildGithubIssueUrl } from "./githubIssue";
import { resolveServerContext } from "../data/servers";

const turtleContext = resolveServerContext("turtle");
if (!turtleContext) throw new Error("expected turtle context");

describe("buildGithubIssueUrl", () => {
  it("builds an encoded GitHub new-issue URL with page, server, flavor, and environment context", () => {
    const href = buildGithubIssueUrl({
      repo: "Emyrk/chronicle-wiki",
      context: turtleContext,
      location: {
        href: "https://wiki.example.test/turtle/talents?class=Warrior Fury",
        host: "wiki.example.test",
        pathname: "/turtle/talents",
      },
      env: {
        MODE: "production",
        BASE_URL: "/chronicle-wiki/",
        VITE_APP_FLAVOR: "github-pages",
      },
    });

    const url = new URL(href);
    expect(url.origin + url.pathname).toBe("https://github.com/Emyrk/chronicle-wiki/issues/new");
    expect(url.searchParams.get("title")).toBe("Wiki error report: Turtle WoW");

    const body = url.searchParams.get("body");
    expect(body).toContain("Please describe the error:");
    expect(body).toContain("Page URL: https://wiki.example.test/turtle/talents?class=Warrior Fury");
    expect(body).toContain("Host: wiki.example.test");
    expect(body).toContain("Path: /turtle/talents");
    expect(body).toContain("Server: Turtle WoW (turtle)");
    expect(body).toContain("Flavor: Nightmares of Ursol (nightmares-of-ursol)");
    expect(body).toContain("Mode: production");
    expect(body).toContain("Base URL: /chronicle-wiki/");
    expect(body).toContain("App flavor: github-pages");
    expect(href).toContain("Warrior+Fury");
  });

  it("omits unavailable browser and app context without throwing", () => {
    const href = buildGithubIssueUrl({ repo: "Emyrk/chronicle-wiki", env: {} });
    const url = new URL(href);

    expect(url.origin + url.pathname).toBe("https://github.com/Emyrk/chronicle-wiki/issues/new");
    expect(url.searchParams.get("title")).toBe("Wiki error report");
    expect(url.searchParams.get("body")).toBe("Please describe the error:\n\n\nContext:\n- Repository: Emyrk/chronicle-wiki");
  });
});
