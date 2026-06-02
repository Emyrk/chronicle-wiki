import { describe, expect, it } from "vitest";
import { aiDisclosure, wikiDevelopmentLinks } from "./wikiDevelopment";

describe("wiki development disclosure", () => {
  it("explains that the wiki is AI-maintained because of maintenance scale", () => {
    expect(aiDisclosure.title).toBe("Wiki Development");
    expect(aiDisclosure.summary).toContain("entirely maintained by AI");
    expect(aiDisclosure.summary).toContain("sheer amount of work involved in maintaining a wiki");
  });

  it("directs errors to GitHub and explains the Chronicle development tradeoff", () => {
    expect(aiDisclosure.sections).toEqual(expect.arrayContaining([
      expect.objectContaining({
        heading: "Report errors on GitHub",
        body: expect.stringContaining("GitHub"),
      }),
      expect.objectContaining({
        heading: "Why AI maintenance",
        body: expect.stringContaining("focus development on Chronicle itself"),
      }),
    ]));
    expect(wikiDevelopmentLinks.githubIssues).toBe("https://github.com/Emyrk/chronicle-wiki/issues");
  });
});
