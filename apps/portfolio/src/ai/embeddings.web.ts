// Web embedding backend — Hugging Face transformers.js running ONNX in the
// browser (WASM, with WebGPU when available). Model + WASM download lazily on
// first use and are cached by the browser; if anything fails we return null and
// the engine falls back to lexical search, so the app never breaks.
import type { Embedder } from "./types";

let cached: Promise<Embedder | null> | null = null;

export function loadEmbedder(): Promise<Embedder | null> {
  cached ??= (async () => {
    try {
      const { pipeline } = await import("@huggingface/transformers");
      // Cast away the library's tensor types — we only need mean-pooled,
      // L2-normalized vectors, which keeps this resilient to API drift.
      const extractor = (await pipeline(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2",
      )) as unknown as (
        texts: string[],
        opts: { pooling: "mean"; normalize: boolean },
      ) => Promise<{ tolist(): number[][] }>;

      return {
        async embed(texts: string[]): Promise<number[][]> {
          const out = await extractor(texts, { pooling: "mean", normalize: true });
          return out.tolist();
        },
      };
    } catch (err) {
      console.warn("[ai] web embeddings unavailable; using lexical search", err);
      return null;
    }
  })();
  return cached;
}
