// v2 "Subtle HUD" primitive colors — mirrors tokens.jsx in the design bundle.
export const T = {
  paper: "#F6F4ED",
  paperDeep: "#EEEAE0",
  ink: "#111826",
  inkSoft: "#2A3440",
  inkMid: "rgba(17,24,38,0.60)",
  inkLow: "rgba(17,24,38,0.38)",
  inkHair: "rgba(17,24,38,0.12)",
  inkThread: "rgba(17,24,38,0.22)",
  red: "#D4412A",
  redSoft: "rgba(212,65,42,0.12)",
  redHair: "rgba(212,65,42,0.28)",
  amber: "#C68A1E",
  mint: "#4A7A5E",
  mintSoft: "rgba(74,122,94,0.12)",
  cyan: "#457B9D",
  cyanSoft: "rgba(69,123,157,0.16)",
  onDark: "rgba(246,244,237,0.92)",
  onDarkMid: "rgba(246,244,237,0.70)",
  onDarkLow: "rgba(246,244,237,0.50)",
  onDarkHair: "rgba(246,244,237,0.14)",
  onDarkThread: "rgba(246,244,237,0.28)",
} as const;

export type Tone = "mid" | "red" | "ink" | "onDark" | "onDarkMid";

export const toneColor: Record<Tone, string> = {
  mid: T.inkMid,
  red: T.red,
  ink: T.ink,
  onDark: T.onDarkMid,
  onDarkMid: T.onDarkLow,
};
