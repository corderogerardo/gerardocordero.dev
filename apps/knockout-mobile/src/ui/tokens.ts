/**
 * Design tokens — the only file allowed to contain a raw colour, size, or font size.
 *
 * Why: a screen that hardcodes `#FF6B35` cannot be re-themed, cannot be audited,
 * and drifts from the screen next to it. Every UI primitive takes a *token name*,
 * never a literal. `PLAN.md` T1 has the check that enforces it:
 *
 *   grep -rn "#[0-9a-fA-F]\{6\}" apps/knockout-mobile/src | grep -v tokens.ts
 *
 * Palette: a dark field UI. Canvassers work outdoors, often at dusk; a low-luminance
 * surface with a high-contrast accent survives glare better than a white screen.
 */
export const colors = {
  bg: "#0B0F14",
  surface: "#131A22",
  surfaceRaised: "#1B242F",
  border: "#26313D",
  text: "#F2F6FA",
  textMuted: "#93A3B5",
  textInverse: "#0B0F14",
  brand: "#FF7A3D",
  brandPressed: "#E5662C",
  success: "#3DDC97",
  warning: "#F5C451",
  danger: "#FF5C6C",
  info: "#63B3FF",
} as const;

export const space = { 0: 0, 1: 4, 2: 8, 3: 12, 4: 16, 5: 24, 6: 32, 7: 48 } as const;

export const radius = { sm: 6, md: 10, lg: 16, pill: 999 } as const;

export const font = {
  display: 28,
  title: 22,
  body: 15,
  label: 13,
  caption: 12,
} as const;

export const weight = {
  regular: "400",
  medium: "500",
  bold: "700",
} as const;

export type ColorToken = keyof typeof colors;
export type SpaceToken = keyof typeof space;
export type RadiusToken = keyof typeof radius;
