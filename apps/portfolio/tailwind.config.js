const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // v2 "Subtle HUD" palette
        paper: "#F6F4ED",
        "paper-deep": "#EEEAE0",
        ink: "#111826",
        "ink-soft": "#2A3440",
        red: "#D4412A",
        amber: "#C68A1E",
        mint: "#4A7A5E",
        cyan: "#457B9D",

        // legacy tokens — retained for any leftover consumers
        "imperial-red": "#E63946",
        "prussian-blue": "#1D3557",
        honeydew: "#F1FAEE",
        "powder-blue": "#A8DADC",
        "celadon-blue": "#457B9D",
      },
      fontFamily: {
        // v2: DM Sans is the display + body face; JetBrains Mono for HUD labels/ticks
        sans: [
          "DMSans_400Regular",
          "DM Sans",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        medium: [
          "DMSans_500Medium",
          "DM Sans",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "DMSans_500Medium",
          "DM Sans",
          "system-ui",
          "sans-serif",
        ],
        semibold: [
          "DMSans_600SemiBold",
          "DM Sans",
          "system-ui",
          "sans-serif",
        ],
        bold: [
          "DMSans_700Bold",
          "DM Sans",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "JetBrainsMono_500Medium",
          "JetBrains Mono",
          "ui-monospace",
          "SF Mono",
          "Menlo",
          "monospace",
        ],
        "mono-reg": [
          "JetBrainsMono_400Regular",
          "JetBrains Mono",
          "ui-monospace",
          "monospace",
        ],
        // legacy — kept so the old plus-jakarta package still resolves if referenced
        ui: [
          "DMSans_500Medium",
          "PlusJakartaSans_600SemiBold",
          "system-ui",
          "sans-serif",
        ],
      },
      letterSpacing: {
        hud: "0.12em",
        tick: "0.08em",
        wide: "0.06em",
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};
