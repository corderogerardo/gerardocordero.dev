// Web embedding backend — Hugging Face transformers.js running ONNX in the
// browser (WASM, with WebGPU when available). Model + runtime download lazily on
// first use and are cached by the browser; if anything fails we return null and
// the engine falls back to lexical search, so the app never breaks.
//
// transformers.js is loaded from a CDN at runtime instead of being bundled.
// Metro can't statically parse onnxruntime-web's WebGPU build — an unanalyzable
// dynamic import inside ort.webgpu.bundle.min.mjs makes `expo export --platform
// web` fail. Keeping the specifier in a variable means Metro never follows the
// import (so onnxruntime-web stays out of the bundle), and the browser fetches
// the ESM build directly. Pinned to the version in package.json.
import type { Embedder } from "./types";

const TRANSFORMERS_CDN =
  "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0/+esm";

let cached: Promise<Embedder | null> | null = null;

export function loadEmbedder(): Promise<Embedder | null> {
  cached ??= (async () => {
    try {
      // Variable specifier (not a string literal) → Metro leaves this as a real
      // runtime import resolved by the browser, rather than bundling it.
      const { pipeline } = await import(
        /* webpackIgnore: true */ /* @vite-ignore */ TRANSFORMERS_CDN
      );
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
