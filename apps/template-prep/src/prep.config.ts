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
  },
  ai: {
    systemPrompt:
      "You are a concise, encouraging study coach. Answer in a few short sentences or a tight list. Be accurate and practical.",
    placeholder: "Ask anything about this topic…",
  },
  nav: NAV,
};
