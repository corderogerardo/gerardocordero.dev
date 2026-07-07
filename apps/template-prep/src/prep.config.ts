import type { PrepConfig } from "@gerardocordero/prep-kit";
import { NAV } from "@/lib/nav";

// ⬇️ This is the ONLY app-specific config. To spin up a new subject:
//   1. Edit these strings (storagePrefix must be unique per deployed origin).
//   2. Replace the arrays in src/data/ with your content.
//   3. Update src/lib/nav.ts. That's it — prep-kit renders everything else.
export const prepConfig: PrepConfig = {
  storagePrefix: "templateprep",
  appId: "template-prep",
  brand: {
    logoText: "T",
    title: "Prep Template",
    footerText:
      "A starter template for on-device study sites · built on @gerardocordero/prep-kit. Replace src/data and src/prep.config.ts to make it yours.",
    footerTextEs:
      "Una plantilla inicial para sitios de estudio en el dispositivo · construida sobre @gerardocordero/prep-kit. Reemplaza src/data y src/prep.config.ts para hacerla tuya.",
  },
  ai: {
    systemPrompt:
      "You are a concise, encouraging study coach. Answer in a few short sentences or a tight list. Be accurate and practical.",
    placeholder: "Ask anything about this topic…",
    placeholderEs: "Pregunta lo que sea sobre este tema…",
  },
  nav: NAV,
};
