import { describe, expect, it } from "vitest";
import { chronicleHomeStyleSignals, resolveChronicleSiteStyle, rootChronicleWikiTheme } from "./chronicleSiteLanguage";
import { servers } from "@/data/servers";

const turtleTheme = servers.turtle.theme;
const vanillaplusTheme = servers.vanillaplus.theme;

describe("Chronicle shared site language", () => {
  it("codifies chronicleclassic.com as the canonical shell, card, button, and footer source", () => {
    expect(chronicleHomeStyleSignals).toEqual({
      sourceUrl: "https://chronicleclassic.com/",
      background: "flat oklch charcoal page with only a subtle teal/green radial halo behind the centered hero",
      hero: "centered compact hero anchored by the Chronicle logo, not a left-heavy dashboard masthead",
      typography: "Inter sans, tight bold headings, muted readable body copy, modest type scale",
      serverCards: "dark restrained card, 8px radius, 1px low-alpha border, 112px banner, overlapping 40px logo, content rhythm, divider, footer actions",
      buttons: "primary filled Chronicle blue rounded-md 6px, secondary quiet bordered rounded-md 6px, no pill action buttons",
      chips: "small rounded-md low-contrast chips with thin borders",
      footer: "border-top muted footer with Chronicle and Community columns plus compact legal copy",
    });
  });

  it("resolves every tenant through the same global Chronicle home token set", () => {
    expect(resolveChronicleSiteStyle(turtleTheme)).toEqual(resolveChronicleSiteStyle(vanillaplusTheme));
    expect(resolveChronicleSiteStyle(turtleTheme)).toEqual({
      "--background": "oklch(28.91% 0 0)",
      "--foreground": "oklch(93% 0.0035 247.86)",
      "--card": "oklch(26.86% 0 0)",
      "--card-foreground": "oklch(93% 0.0035 247.86)",
      "--primary": "#5f8fa6",
      "--primary-foreground": "oklch(89.14% 0 0)",
      "--secondary": "oklch(56.92% 0.0609 82.3871)",
      "--secondary-foreground": "oklch(93% 0.0035 247.86)",
      "--muted": "oklch(26.86% 0 0)",
      "--muted-foreground": "oklch(75.93% 0.0073 67.7161)",
      "--accent": "oklch(56.92% 0.0609 82.3871)",
      "--accent-foreground": "oklch(93% 0.0035 247.86)",
      "--border": "oklch(34.07% 0 0)",
      "--input": "oklch(34.07% 0 0)",
      "--ring": "oklch(52.04% 0.0833 232.633)",
      "--brand-background": "oklch(28.91% 0 0)",
      "--brand-surface": "oklch(26.86% 0 0)",
      "--brand-nav": "oklch(26.86% 0 0)",
      "--brand-muted": "oklch(75.93% 0.0073 67.7161)",
      "--brand-border": "oklch(34.07% 0 0)",
      "--brand-radius": "0.5rem",
      "--brand-button-radius": "calc(0.5rem - 2px)",
      "--brand-section-y": "3rem",
    });
  });

  it("keeps the root wiki theme identical to the Chronicle home brand rather than a Turtle tenant skin", () => {
    expect(rootChronicleWikiTheme).toMatchObject({
      primary: "#5f8fa6",
      accent: "oklch(56.92% 0.0609 82.3871)",
      background: "oklch(28.91% 0 0)",
      surface: "oklch(26.86% 0 0)",
      border: "oklch(34.07% 0 0)",
    });
  });
});
