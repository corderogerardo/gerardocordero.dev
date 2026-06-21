// Base (Node / Jest) embedding backend: none → the engine uses lexical search.
// Platform overrides: embeddings.web.ts (transformers.js), embeddings.native.ts
// (ExecuTorch). Metro/Jest pick the right one by extension.
import type { Embedder } from "./types";

export function loadEmbedder(): Promise<Embedder | null> {
  return Promise.resolve(null);
}
