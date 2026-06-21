// Base (Node / Jest) generation backend: none → the answerer stays extractive.
// Platform overrides: generator.web.ts (WebLLM), generator.native.ts (ExecuTorch
// LLM). Both are stubs today; see those files to activate a real on-device LLM.
import type { Generator } from "./types";

export function loadGenerator(): Promise<Generator | null> {
  return Promise.resolve(null);
}
