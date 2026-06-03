import type { CSSProperties } from "react";
import type { WikiServerMetadata } from "@/data/metadata";

export const turtleHomepageStyleSignals = {
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
} as const;

export const chronicleSiteDefaults = {
  background: "#242424",
  surface: "#2b2b2b",
  nav: "#222222",
  muted: "#c7c7c7",
  border: "rgb(255 255 255 / 0.10)",
  radius: "0.2rem",
  sectionY: "4rem",
} as const;

export const rootChronicleWikiTheme: WikiServerMetadata["theme"] = {
  primary: "#5f8fa6",
  accent: "#89744d",
  background: "#2b2b2b",
  surface: "#262626",
  nav: "#222222",
  muted: "#b4b0ac",
  border: "#383838",
};

export function resolveChronicleSiteStyle(theme: WikiServerMetadata["theme"]) {
  const muted = theme.muted ?? chronicleSiteDefaults.muted;
  const surface = theme.surface ?? chronicleSiteDefaults.surface;
  const border = theme.border ?? chronicleSiteDefaults.border;

  return {
    "--primary": theme.primary,
    "--ring": theme.accent,
    "--brand-accent": theme.accent,
    "--brand-background": theme.background ?? chronicleSiteDefaults.background,
    "--brand-surface": surface,
    "--brand-nav": theme.nav ?? chronicleSiteDefaults.nav,
    "--brand-muted": muted,
    "--brand-border": border,
    "--brand-radius": chronicleSiteDefaults.radius,
    "--brand-section-y": chronicleSiteDefaults.sectionY,
    "--muted-foreground": muted,
    "--card": surface,
    "--border": border,
  } as CSSProperties;
}
