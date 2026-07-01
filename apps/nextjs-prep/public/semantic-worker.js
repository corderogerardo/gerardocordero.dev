// Module Web Worker for on-device semantic search. Served as a static asset
// (not bundled), so Transformers.js + onnxruntime-web run in a clean context
// off the UI thread. Loads the library + model from a CDN at runtime, caches
// the corpus embeddings in IndexedDB, and ranks by cosine similarity.

const CDN = "https://esm.sh/@huggingface/transformers@3";
// BGE-small is a strong retrieval model; queries get an instruction prefix,
// documents are embedded as-is (asymmetric retrieval).
const MODEL = "Xenova/bge-small-en-v1.5";
const QUERY_PREFIX = "Represent this sentence for searching relevant passages: ";

let extractor = null;
let device = "wasm";
let contentVecs = null;

/* ---------------- model ---------------- */
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

async function embedBatched(texts, onProgress) {
  const BATCH = 24;
  const vecs = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const out = await extractor(texts.slice(i, i + BATCH), {
      pooling: "mean",
      normalize: true,
    });
    for (const v of out.tolist()) vecs.push(v);
    onProgress(Math.min(i + BATCH, texts.length), texts.length);
  }
  return vecs;
}

function cosine(a, b) {
  let s = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

/* ---------------- IndexedDB cache ---------------- */
function openDb() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("iosprep-ai", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("emb");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function idbGet(key) {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const req = db.transaction("emb").objectStore("emb").get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
async function idbSet(key, val) {
  try {
    const db = await openDb();
    await new Promise((resolve) => {
      const req = db
        .transaction("emb", "readwrite")
        .objectStore("emb")
        .put(val, key);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {
    /* ignore */
  }
}

function pack(vecs) {
  const dim = vecs[0].length;
  const flat = new Float32Array(vecs.length * dim);
  vecs.forEach((v, i) => flat.set(v, i * dim));
  return { dim, flat, model: MODEL };
}
function unpack(c) {
  const out = [];
  for (let i = 0; i < c.flat.length; i += c.dim) {
    out.push(Array.from(c.flat.subarray(i, i + c.dim)));
  }
  return out;
}

/* ---------------- messages ---------------- */
self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === "init") {
      await ensure();
      self.postMessage({ type: "ready", device });
    } else if (m.type === "index") {
      await ensure();
      if (m.signature) {
        const cached = await idbGet(m.signature);
        if (cached && cached.dim && cached.model === MODEL) {
          contentVecs = unpack(cached);
          self.postMessage({ type: "indexed", cached: true });
          return;
        }
      }
      contentVecs = await embedBatched(m.texts, (done, total) =>
        self.postMessage({ type: "indexProgress", done, total }),
      );
      if (m.signature) await idbSet(m.signature, pack(contentVecs));
      self.postMessage({ type: "indexed", cached: false });
    } else if (m.type === "query") {
      if (!contentVecs) {
        self.postMessage({ type: "results", id: m.id, ranked: [] });
        return;
      }
      const out = await extractor([QUERY_PREFIX + m.q], {
        pooling: "mean",
        normalize: true,
      });
      const qv = out.tolist()[0];
      const ranked = contentVecs
        .map((v, i) => ({ i, score: cosine(qv, v) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 60);
      self.postMessage({ type: "results", id: m.id, ranked });
    }
  } catch (err) {
    self.postMessage({ type: "error", error: String((err && err.message) || err) });
  }
};
