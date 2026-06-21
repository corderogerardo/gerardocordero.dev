# On-device AI — portfolio search

"Ask my portfolio" search that runs **entirely on the user's device** (no API, no
keys, no cost, offline). One codebase, two AI runtimes, picked per platform.

## Architecture: one interface, platform-split backend

```
src/ai/
  types.ts            shared types (Doc, Embedder, SearchResult)
  corpus.ts           builds Doc[] from src/data/{experience,projects,education}
  lexical.ts          pure-JS TF-IDF cosine search — zero deps, runs everywhere
  embeddings.ts       base backend (Node/Jest): none → lexical
  embeddings.web.ts   web backend: transformers.js (ONNX via WASM/WebGPU)
  embeddings.native.ts native backend: react-native-executorch (stub for now)
  engine.ts           orchestrator: search(query) → semantic if ready, else lexical
```

The UI imports only `@/src/ai/engine`. Metro/Jest resolve the right `embeddings.*`
by file extension, so the screen code is identical across web and native.

## How it works

1. `corpus.ts` flattens the portfolio data into ~N short documents.
2. **Lexical search answers immediately** (TF-IDF cosine) — instant, on-device,
   works on every platform and in Expo Go / web with no download.
3. In parallel, the platform **embedder loads lazily**; once ready, queries are
   re-ranked by semantic similarity (mean-pooled, L2-normalized MiniLM vectors →
   cosine). The result carries `mode: "semantic" | "lexical"` so the UI can show
   which path answered. If embeddings fail to load, it stays lexical — never breaks.

## Backends

| Platform | Backend | Status |
|---|---|---|
| **Web** | `@huggingface/transformers` (transformers.js), model `Xenova/all-MiniLM-L6-v2` | **active** — installed; model + WASM download lazily, browser-cached |
| **Native** (iOS/Android) | `react-native-executorch` | **stub** → lexical. Wiring steps are in `embeddings.native.ts` (add the package + config plugin, rebuild the dev client, load the MiniLM model) |

Use the **same MiniLM family** on both sides so web and native share a vector space.

## Roadmap

- ✅ **Semantic search** (this) — rank portfolio docs by meaning.
- ⏭️ **RAG chat** ("Ask my portfolio") — feed the top docs to a small on-device LLM
  (executorch Llama-3.2-1B on native / WebLLM on web) for grounded answers.
- ⏭️ **Voice** — Whisper STT + TTS for spoken Q&A.

Keep models small, lazy-loaded, and cached; always keep lexical as the fallback.
