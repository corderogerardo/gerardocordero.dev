import type { Level } from "@/lib/levels";

export type PromptKind = "coding" | "design";

export type Prompt = {
  id: string;
  kind: PromptKind;
  title: string;
  level: Level;
  tags: string[];
  promptHtml: string;
  reveal: { label: string; html: string }[];
};

export const PROMPTS: Prompt[] = [
  {
    id: "tpl-code-1",
    kind: "coding",
    title: "Sample coding prompt",
    level: "mid",
    tags: ["template", "example"],
    promptHtml:
      "<p>This is where a coding prompt goes. Pose a problem here; the learner tries it before revealing the staged answer below.</p>",
    reveal: [
      { label: "Approach", html: "<p>Sketch the approach here.</p>" },
      { label: "Solution", html: "<div class=\"code\">// your worked solution\n</div>" },
    ],
  },
  {
    id: "tpl-design-1",
    kind: "design",
    title: "Sample system-design prompt",
    level: "senior",
    tags: ["template", "architecture"],
    promptHtml:
      "<p>This is where a system-design prompt goes — e.g. \"design an offline-first sync layer.\" Reveal requirements, then a design.</p>",
    reveal: [
      { label: "Requirements", html: "<ul><li>Clarify scope, constraints, scale.</li></ul>" },
      { label: "Design", html: "<p>Walk the components, data flow, and trade-offs.</p>" },
    ],
  },
];
