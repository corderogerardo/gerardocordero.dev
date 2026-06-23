// Module Web Worker for on-device semantic search. Served as a static asset
// (not bundled), so Transformers.js + onnxruntime-web run in a clean context
// off the UI thread. Loads the library from a CDN at runtime.

const CDN = "https://esm.sh/@huggingface/transformers@3";
const MODEL = "Xenova/all-MiniLM-L6-v2";

let extractor = null;
let device = "wasm";
let contentVecs = null;

async function loadLib() {
  const lib = await import(CDN);
  try {
    lib.env.allowLocalModels = false;
    const wasm = lib.env?.backends?.onnx?.wasm;
    if (wasm) {
      wasm.numThreads = 1; // no cross-origin isolation on a static host
      wasm.proxy = false;
    }
  } catch {
    /* ignore */
  }
  return lib;
}

async function pickDevice() {
  try {
    if (self.navigator?.gpu?.requestAdapter) {
      const adapter = await self.navigator.gpu.requestAdapter();
      if (adapter) return "webgpu";
    }
  } catch {
    /* ignore */
  }
  return "wasm";
}

async function ensure() {
  if (extractor) return;
  const { pipeline } = await loadLib();
  const make = async (dev) => {
    const ex = await pipeline("feature-extraction", MODEL, {
      device: dev,
      dtype: "q8",
      progress_callback: (p) => {
        if (p?.status === "progress" && typeof p.progress === "number") {
          self.postMessage({ type: "progress", value: Math.round(p.progress) });
        }
      },
    });
    await ex(["warmup"], { pooling: "mean", normalize: true });
    return { ex, dev };
  };
  const preferred = await pickDevice();
  try {
    const r = await make(preferred);
    extractor = r.ex;
    device = r.dev;
  } catch (e) {
    if (preferred !== "wasm") {
      const r = await make("wasm");
      extractor = r.ex;
      device = r.dev;
    } else {
      throw e;
    }
  }
}

function cosine(a, b) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === "init") {
      await ensure();
      self.postMessage({ type: "ready", device });
    } else if (m.type === "index") {
      await ensure();
      const out = await extractor(m.texts, { pooling: "mean", normalize: true });
      contentVecs = out.tolist();
      self.postMessage({ type: "indexed" });
    } else if (m.type === "query") {
      if (!contentVecs) {
        self.postMessage({ type: "results", id: m.id, ranked: [] });
        return;
      }
      const out = await extractor([m.q], { pooling: "mean", normalize: true });
      const qv = out.tolist()[0];
      const ranked = contentVecs
        .map((v, i) => ({ i, score: cosine(qv, v) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 30);
      self.postMessage({ type: "results", id: m.id, ranked });
    }
  } catch (err) {
    self.postMessage({ type: "error", error: String((err && err.message) || err) });
  }
};
