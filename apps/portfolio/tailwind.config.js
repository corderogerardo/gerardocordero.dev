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
        "imperial-red": "#E63946",
        "prussian-blue": "#1D3557",
        honeydew: "#F1FAEE",
        "powder-blue": "#A8DADC",
        "celadon-blue": "#457B9D",
      },
      fontFamily: {
        sans: [
          "PlusJakartaSans_400Regular",
          "Plus Jakarta Sans",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        ui: [
          "PlusJakartaSans_600SemiBold",
          "Plus Jakarta Sans",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "PlusJakartaSans_800ExtraBold",
          "Plus Jakarta Sans",
          "system-ui",
          "sans-serif",
        ],
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },
  plugins: [],
};
