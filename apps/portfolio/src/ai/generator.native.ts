// Native generation via react-native-executorch (useLLM → Llama-3.2-1B on
// device). Needs the package + config plugin + dev-client rebuild + a model
// download, so it's stubbed like embeddings.native.ts.
//
// To activate: add react-native-executorch, load LLAMA3_2_1B (or a quantized
// build), and return { generate: (q, ctx) => llm.generate(prompt(q, ctx)) }.
// Until then → null → extractive answer.
import type { Generator } from "./types";

export function loadGenerator(): Promise<Generator | null> {
  return Promise.resolve(null);
}
