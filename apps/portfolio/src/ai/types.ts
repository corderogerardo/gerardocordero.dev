// Shared types for the on-device portfolio search engine.

export type DocKind = "experience" | "project" | "education";

/** A searchable chunk built from the portfolio data (src/data/*). */
export type Doc = {
  id: string;
  kind: DocKind;
  title: string;
  meta?: string;
  /** expo-router path to the tab this doc came from. */
  route: "/experience" | "/projects" | "/education";
  /** Full text the search ranks against. */
  text: string;
};

export type SearchHit = { doc: Doc; score: number };

/** Platform-specific embedding backend (web: transformers.js, native: ExecuTorch). */
export type Embedder = {
  embed(texts: string[]): Promise<number[][]>;
};

export type SearchMode = "semantic" | "lexical";

export type SearchResult = { hits: SearchHit[]; mode: SearchMode };
