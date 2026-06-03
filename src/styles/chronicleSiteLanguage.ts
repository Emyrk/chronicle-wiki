import type { CSSProperties } from "react";
import type { WikiServerMetadata } from "@/data/metadata";

export const chronicleHomeStyleSignals = {
  sourceUrl: "https://chronicleclassic.com/",
  background: "flat oklch charcoal page with only a subtle teal/green radial halo behind the centered hero",
  hero: "centered compact hero anchored by the Chronicle logo, not a left-heavy dashboard masthead",
  typography: "Inter sans, tight bold headings, muted readable body copy, modest type scale",
  serverCards: "dark restrained card, 8px radius, 1px low-alpha border, 112px banner, overlapping 40px logo, content rhythm, divider, footer actions",
  buttons: "primary filled Chronicle blue rounded-md 6px, secondary quiet bordered rounded-md 6px, no pill action buttons",
  chips: "small rounded-md low-contrast chips with thin borders",
  footer: "border-top muted footer with Chronicle and Community columns plus compact legal copy",
} as const;

export const chronicleSiteDefaults = {
  background: "oklch(28.91% 0 0)",
  foreground: "oklch(93% 0.0035 247.86)",
  card: "oklch(26.86% 0 0)",
  primary: "#5f8fa6",
  primaryForeground: "oklch(89.14% 0 0)",
  secondary: "oklch(56.92% 0.0609 82.3871)",
  muted: "oklch(26.86% 0 0)",
  mutedForeground: "oklch(75.93% 0.0073 67.7161)",
  border: "oklch(34.07% 0 0)",
  ring: "oklch(52.04% 0.0833 232.633)",
  radius: "0.5rem",
  buttonRadius: "calc(0.5rem - 2px)",
  sectionY: "3rem",
} as const;

export const rootChronicleWikiTheme: WikiServerMetadata["theme"] = {
  primary: chronicleSiteDefaults.primary,
  accent: chronicleSiteDefaults.secondary,
  background: chronicleSiteDefaults.background,
  surface: chronicleSiteDefaults.card,
  nav: chronicleSiteDefaults.card,
  muted: chronicleSiteDefaults.mutedForeground,
  border: chronicleSiteDefaults.border,
};

export function resolveChronicleSiteStyle(_theme: WikiServerMetadata["theme"]) {
  return {
    "--background": chronicleSiteDefaults.background,
    "--foreground": chronicleSiteDefaults.foreground,
    "--card": chronicleSiteDefaults.card,
    "--card-foreground": chronicleSiteDefaults.foreground,
    "--primary": chronicleSiteDefaults.primary,
    "--primary-foreground": chronicleSiteDefaults.primaryForeground,
    "--secondary": chronicleSiteDefaults.secondary,
    "--secondary-foreground": chronicleSiteDefaults.foreground,
    "--muted": chronicleSiteDefaults.muted,
    "--muted-foreground": chronicleSiteDefaults.mutedForeground,
    "--accent": chronicleSiteDefaults.secondary,
    "--accent-foreground": chronicleSiteDefaults.foreground,
    "--border": chronicleSiteDefaults.border,
    "--input": chronicleSiteDefaults.border,
    "--ring": chronicleSiteDefaults.ring,
    "--brand-background": chronicleSiteDefaults.background,
    "--brand-surface": chronicleSiteDefaults.card,
    "--brand-nav": chronicleSiteDefaults.card,
    "--brand-muted": chronicleSiteDefaults.mutedForeground,
    "--brand-border": chronicleSiteDefaults.border,
    "--brand-radius": chronicleSiteDefaults.radius,
    "--brand-button-radius": chronicleSiteDefaults.buttonRadius,
    "--brand-section-y": chronicleSiteDefaults.sectionY,
  } as CSSProperties;
}
