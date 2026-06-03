import { describe, expect, it } from "vitest";
import { aiDisclosure, wikiDevelopmentLinks } from "./wikiDevelopment";

describe("wiki feedback page copy", () => {
  it("invites player corrections without implementation disclosures", () => {
    expect(aiDisclosure.title).toBe("Wiki Feedback");
    expect(aiDisclosure.summary).toContain("player reports");
    expect(aiDisclosure.summary).toContain("server-specific corrections");
    expect(aiDisclosure.summary).not.toMatch(/AI|implementation|pipeline/i);
  });

  it("directs errors to GitHub and asks for useful player evidence", () => {
    expect(aiDisclosure.sections).toEqual(expect.arrayContaining([
      expect.objectContaining({
        heading: "Report errors",
        body: expect.stringContaining("GitHub"),
      }),
      expect.objectContaining({
        heading: "What helps most",
        body: expect.stringContaining("combat logs"),
      }),
    ]));
    expect(wikiDevelopmentLinks.githubIssues).toBe("https://github.com/Emyrk/chronicle-wiki/issues");
  });
});
