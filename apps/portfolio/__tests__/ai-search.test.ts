import { buildCorpus } from "../src/ai/corpus";
import { buildLexicalIndex, lexicalSearch } from "../src/ai/lexical";

describe("portfolio search (lexical fallback)", () => {
  const corpus = buildCorpus();
  const index = buildLexicalIndex(corpus);

  it("builds a non-empty corpus from the portfolio data", () => {
    expect(corpus.length).toBeGreaterThan(3);
    expect(corpus.every((d) => d.text.length > 0)).toBe(true);
  });

  it("surfaces the real-time chat work for a 'real-time chat' query", () => {
    const hits = lexicalSearch(index, "real-time chat", 3);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].doc.text.toLowerCase()).toContain("chat");
  });

  it("finds React Native experience", () => {
    const hits = lexicalSearch(index, "React Native mobile engineer", 5);
    expect(hits.some((h) => h.doc.text.includes("React Native"))).toBe(true);
  });

  it("returns nothing for an empty query", () => {
    expect(lexicalSearch(index, "   ", 5)).toHaveLength(0);
  });
});
