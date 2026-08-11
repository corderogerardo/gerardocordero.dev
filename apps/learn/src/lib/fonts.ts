import { Fredoka } from "next/font/google";

// Display font for the playful learning brand (Phase 0). Self-hosted + subset
// by next/font, preloaded, `display: swap` — static-export safe. The CSS
// fallback chain lives in styles.css `--display`:
//   var(--font-fredoka), "Nunito", "DM Sans", system-ui, ...
// The variable is injected on <html> by the root layout.
export const fredoka = Fredoka({
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
  variable: "--font-fredoka",
});
