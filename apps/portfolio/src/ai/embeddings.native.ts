// Native embedding backend — on-device inference via react-native-executorch.
//
// Not wired yet (it's a native module that needs a config plugin + dev-client
// rebuild + a model download), so we return null and the engine falls back to
// lexical search, which already runs fully on-device with zero download.
//
// To activate real on-device embeddings:
//   1. pnpm --filter @gerardocordero/portfolio add react-native-executorch
//   2. add the config plugin to app.json, then `npx expo run:ios` (rebuild)
//   3. replace the body below with, roughly:
//        import { TextEmbeddingsModule, ALL_MINILM_L6_V2 } from "react-native-executorch";
//        const model = await TextEmbeddingsModule.load(ALL_MINILM_L6_V2);
//        return { embed: (texts) => Promise.all(texts.map((t) => model.forward(t))) };
//      (use the same MiniLM family as the web path for a shared vector space).
import type { Embedder } from "./types";

export function loadEmbedder(): Promise<Embedder | null> {
  return Promise.resolve(null);
}
