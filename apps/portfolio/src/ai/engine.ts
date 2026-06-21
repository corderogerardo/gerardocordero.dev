// Portfolio search engine. One API for the UI; the embedding backend is chosen
// per platform (web/native) and lazily loaded. Until (or unless) embeddings are
// ready, lexical TF-IDF search answers immediately — so results are instant and
// the feature works everywhere, with semantic ranking as a progressive upgrade.
import { buildCorpus } from "./corpus";
import { loadEmbedder } from "./embeddings";
import { buildLexicalIndex, lexicalSearch } from "./lexical";
import type { Embedder, SearchResult } from "./types";

const corpus = buildCorpus();
const lexicalIndex = buildLexicalIndex(corpus);

let embedderPromise: Promise<Embedder | null> | null = null;
let docVectors: number[][] | null = null;

/** Load the platform embedder once and pre-embed the corpus (idempotent). */
function getEmbedder(): Promise<Embedder | null> {
  embedderPromise ??= (async () => {
    const embedder = await loadEmbedder();
    if (embedder) docVectors = await embedder.embed(corpus.map((d) => d.text));
    return embedder;
  })();
  return embedderPromise;
}

/** Dot product of two L2-normalized vectors === cosine similarity. */
function dot(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export const corpusSize = corpus.length;

/** Warm up the embedder ahead of the first query (e.g. on screen mount). */
export function warmUp(): void {
  void getEmbedder();
}

export async function search(query: string, k = 5): Promise<SearchResult> {
  const q = query.trim();
  if (!q) return { hits: [], mode: "lexical" };

  const embedder = await getEmbedder();
  if (embedder && docVectors) {
    const [qv] = await embedder.embed([q]);
    const hits = corpus
      .map((doc, i) => ({ doc, score: dot(qv, docVectors![i]) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, k);
    return { hits, mode: "semantic" };
  }

  return { hits: lexicalSearch(lexicalIndex, q, k), mode: "lexical" };
}
