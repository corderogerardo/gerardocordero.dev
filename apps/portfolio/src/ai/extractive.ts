// Extractive answerer — the zero-LLM, always-available "answer" for the RAG
// layer. Given a question and the retrieved docs, it picks the best-matching
// sentences and stitches them into a short, grounded reply. Generative LLMs
// (generator.*.ts) upgrade this when available; this never fails or hallucinates.
import { tokenize } from "./lexical";
import type { Doc, SearchHit } from "./types";

const SENTENCE = /(?<=[.!?])\s+|\s*[·\n]+\s*/;

export function extractiveAnswer(
  query: string,
  hits: SearchHit[],
): { text: string; sources: Doc[] } {
  if (!hits.length) return { text: "", sources: [] };
  const qTerms = new Set(tokenize(query));

  const scored: { sentence: string; score: number; doc: Doc }[] = [];
  hits.slice(0, 4).forEach((h) => {
    h.doc.text.split(SENTENCE).forEach((raw) => {
      const sentence = raw.trim();
      if (sentence.length < 12) return;
      const terms = tokenize(sentence);
      if (!terms.length) return;
      const overlap = terms.filter((t) => qTerms.has(t)).length;
      if (!overlap) return;
      scored.push({
        sentence,
        score: overlap + overlap / Math.sqrt(terms.length),
        doc: h.doc,
      });
    });
  });
  scored.sort((a, b) => b.score - a.score);

  const picked: typeof scored = [];
  for (const s of scored) {
    if (picked.some((p) => p.sentence === s.sentence)) continue;
    picked.push(s);
    if (picked.length === 2) break;
  }

  if (!picked.length) {
    // Nothing overlapped a sentence — fall back to the top hit's headline.
    const top = hits[0].doc;
    return { text: `${top.title}.`, sources: [top] };
  }

  const sources = picked.map((p) => p.doc).filter((d, i, a) => a.indexOf(d) === i);
  const text = picked
    .map((p) => p.sentence.replace(/[.;]+$/, "") + ".")
    .join(" ");
  return { text, sources };
}
