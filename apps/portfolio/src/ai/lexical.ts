// Pure-JS TF-IDF cosine search. Zero dependencies, runs identically on web,
// native, and in tests — the always-available fallback when on-device
// embeddings aren't loaded (or while they're still downloading).
import type { Doc, SearchHit } from "./types";

const STOP = new Set([
  "the", "a", "an", "and", "or", "of", "to", "in", "on", "for", "with", "is",
  "are", "was", "were", "at", "by", "as", "it", "that", "this", "from", "via",
  "across", "what", "does", "do", "his", "he",
]);

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9.+#]+/g) ?? []).filter(
    (t) => t.length > 1 && !STOP.has(t),
  );
}

export type LexicalIndex = {
  docs: Doc[];
  vectors: Map<string, number>[];
  idf: Map<string, number>;
};

export function buildLexicalIndex(docs: Doc[]): LexicalIndex {
  const tokenized = docs.map((d) => tokenize(d.text));

  const df = new Map<string, number>();
  tokenized.forEach((toks) => {
    new Set(toks).forEach((t) => df.set(t, (df.get(t) ?? 0) + 1));
  });

  const n = docs.length;
  const idf = new Map<string, number>();
  df.forEach((d, t) => idf.set(t, Math.log(1 + n / d)));

  const vectors = tokenized.map((toks) => {
    const tf = new Map<string, number>();
    toks.forEach((t) => tf.set(t, (tf.get(t) ?? 0) + 1));
    const vec = new Map<string, number>();
    tf.forEach((f, t) => vec.set(t, f * (idf.get(t) ?? 0)));
    return vec;
  });

  return { docs, vectors, idf };
}

function norm(v: Map<string, number>): number {
  let s = 0;
  v.forEach((w) => (s += w * w));
  return Math.sqrt(s) || 1;
}

export function lexicalSearch(
  index: LexicalIndex,
  query: string,
  k = 5,
): SearchHit[] {
  const fallbackIdf = Math.log(1 + index.docs.length);
  const qVec = new Map<string, number>();
  tokenize(query).forEach((t) =>
    qVec.set(t, (qVec.get(t) ?? 0) + (index.idf.get(t) ?? fallbackIdf)),
  );
  const qNorm = norm(qVec);

  return index.vectors
    .map((vec, i) => {
      let d = 0;
      qVec.forEach((qw, t) => {
        const dw = vec.get(t);
        if (dw) d += qw * dw;
      });
      return { doc: index.docs[i], score: d / (qNorm * norm(vec)) };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
