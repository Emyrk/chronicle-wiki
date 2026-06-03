import { describe, expect, it } from "vitest";
import { turtleHomepageStyleSignals, resolveChronicleSiteStyle } from "./chronicleSiteLanguage";
import { servers } from "@/data/servers";

const turtleTheme = servers.turtle.theme;

describe("Chronicle shared site language", () => {
  it("codifies Turtle Chronicle's shell, typography, button, link, surface, radius, and spacing signals", () => {
    expect(turtleHomepageStyleSignals).toEqual({
      sourceUrl: "https://turtle.chronicleclassic.com/",
      betaBanner: "muted blue banner above the nav shell",
      navigation: "centered Chronicle mark with subdued text links and a square primary sign-in button",
      background: "flat charcoal page with cinematic hero imagery as content, not a blue-black app gradient",
      typography: "Inter sans, bold tight headings, regular readable body copy",
      buttons: "square-corner primary filled button plus quiet bordered secondary button",
      links: "muted text that brightens on hover, blue only for explicit inline links",
      surfaces: "low-contrast charcoal sections/cards with thin low-alpha borders",
      radius: "small 0.2rem radius, not large playful rounded cards or pills",
      spacing: "restrained full-width sections with 4rem to 6rem vertical rhythm",
      footer: "border-top muted footer with compact column lists and small version/legal rhythm",
    });
  });

  it("resolves tenant colors into centralized Chronicle shell CSS variables", () => {
    expect(resolveChronicleSiteStyle(turtleTheme)).toEqual({
      "--primary": "#5f9bb8",
      "--ring": "#c8a45c",
      "--brand-accent": "#c8a45c",
      "--brand-background": "#242424",
      "--brand-surface": "#2b2b2b",
      "--brand-nav": "#222222",
      "--brand-muted": "#c7c7c7",
      "--brand-border": "rgb(255 255 255 / 0.10)",
      "--brand-radius": "0.2rem",
      "--brand-section-y": "4rem",
      "--muted-foreground": "#c7c7c7",
      "--card": "#2b2b2b",
      "--border": "rgb(255 255 255 / 0.10)",
    });
  });
});
