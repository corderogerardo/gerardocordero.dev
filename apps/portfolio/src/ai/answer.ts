// "Ask my portfolio" — retrieval-augmented answering. Retrieve the most relevant
// docs (engine.search), then answer from them: a generative LLM if one is loaded
// for the platform, otherwise the extractive answerer. Always grounded in the
// portfolio data, so it can't hallucinate facts that aren't there.
import { search } from "./engine";
import { extractiveAnswer } from "./extractive";
import { loadGenerator } from "./generator";
import type { Answer } from "./types";

export async function answer(query: string, k = 5): Promise<Answer> {
  const q = query.trim();
  if (!q) return { text: "", sources: [], hits: [], mode: "extractive" };

  const { hits } = await search(q, k);
  const generator = await loadGenerator();
  if (generator) {
    const text = await generator.generate(
      q,
      hits.map((h) => h.doc),
    );
    return { text, sources: hits.map((h) => h.doc), hits, mode: "generative" };
  }

  const { text, sources } = extractiveAnswer(q, hits);
  return { text, sources, hits, mode: "extractive" };
}
