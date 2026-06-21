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

## Answering (RAG)

`answer.ts` retrieves the top docs (via `engine.search`) and replies from them:

- **`extractive.ts`** — the zero-LLM, always-available answerer: picks the
  best-matching sentences from the retrieved docs and stitches a short grounded
  reply. Can't hallucinate facts that aren't in the data. This is the default.
- **`generator.web.ts`** → WebLLM (`@mlc-ai/web-llm`, WebGPU) — stub.
- **`generator.native.ts`** → ExecuTorch LLM (Llama-3.2-1B) — stub.

When a generator is wired, `answer()` uses it and reports `mode: "generative"`;
otherwise `mode: "extractive"`.

## Roadmap

- ✅ **Semantic search** — rank portfolio docs by meaning (lexical default + transformers.js on web).
- ✅ **RAG answering** ("Ask my portfolio") — retrieve + extractive answer, LLM-ready.
- ⏭️ **Generative LLM** — wire WebLLM (web) / ExecuTorch (native) into `generator.*`.
- ⏭️ **Voice** — Whisper STT + TTS for spoken Q&A.

Keep models small, lazy-loaded, and cached; always keep the extractive/lexical path as the fallback.
