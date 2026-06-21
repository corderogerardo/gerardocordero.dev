// Web generation via WebLLM (@mlc-ai/web-llm), a full LLM in the browser over
// WebGPU. Not installed — the model is multi-hundred-MB, so it's an opt-in.
//
// To activate:
//   1. pnpm --filter @gerardocordero/portfolio add @mlc-ai/web-llm
//   2. const engine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f16_1-MLC")
//   3. return { generate: (q, ctx) => engine.chat.completions.create({
//        messages: [{ role: "system", content: grounding(ctx) }, { role: "user", content: q }],
//      }).then((r) => r.choices[0].message.content ?? "") }
// Until then → null → extractive answer (which already works offline).
import type { Generator } from "./types";

export function loadGenerator(): Promise<Generator | null> {
  return Promise.resolve(null);
}
