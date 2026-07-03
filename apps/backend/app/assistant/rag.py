"""RAG retriever — the module-30 playground pipeline, productionized per
module 31: chunk this repo's docs/*.md, bag-of-words embed, cosine-rank,
retrieve top-k, and build a grounded prompt. Stdlib only, zero API key
required — the same functions the course has the learner write by hand.
"""
from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from math import sqrt
from pathlib import Path

DOCS_DIR = Path(__file__).resolve().parent.parent.parent / "docs"

CHUNK_SIZE = 300
CHUNK_OVERLAP = 50


@dataclass
class Chunk:
    source: str
    text: str


def chunk(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    chunks = []
    i = 0
    while i < len(text):
        chunks.append(text[i : i + size])
        i += size - overlap
    return chunks


_STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "by", "do", "for", "how",
    "i", "in", "is", "it", "of", "on", "or", "that", "the", "this", "to",
    "what", "when", "where", "which", "who", "with", "your", "you",
}


def embed(text: str) -> Counter:
    # ponytail: stdlib stopword strip, not a smarter embedding — module 30
    # names bag-of-words' real fix as "real embedding models" (next
    # lesson's stretch), this just keeps short function words from
    # drowning out the content words in these short docs.
    words = [w for w in text.lower().split() if w not in _STOPWORDS]
    return Counter(words)


def cosine(a: Counter, b: Counter) -> float:
    shared = set(a) & set(b)
    na = sum(v * v for v in a.values())
    nb = sum(v * v for v in b.values())
    if na == 0 or nb == 0:
        return 0.0
    dot = sum(a[k] * b[k] for k in shared)
    return dot / (na**0.5 * nb**0.5)


def _load_corpus() -> list[Chunk]:
    corpus: list[Chunk] = []
    if not DOCS_DIR.exists():
        return corpus
    for path in sorted(DOCS_DIR.glob("*.md")):
        text = path.read_text()
        for piece in chunk(text):
            corpus.append(Chunk(source=f"docs/{path.name}", text=piece))
    return corpus


def retrieve(question: str, top_k: int = 3) -> list[Chunk]:
    corpus = _load_corpus()
    if not corpus:
        return []
    q = embed(question)
    scored = [(cosine(q, embed(c.text)), c) for c in corpus]
    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [c for score, c in scored[:top_k] if score > 0]


def answer_from_context(question: str, context: str) -> str:
    """Generate step: reuse module 28's fallback pattern. No LLM key means a
    plain extractive answer — the sentence in the retrieved context with the
    highest word overlap with the question, not just "line 1 of chunk 1".
    With a key configured this would hand the augmented prompt to the same
    agent used for intent parsing. Kept dependency-free so RAG never
    requires a provider key."""
    if not context.strip():
        return "I don't know — I couldn't find anything about that in the docs."
    q = embed(question)
    sentences = [s.strip() for s in context.replace("\n", " ").split(". ") if s.strip()]
    if not sentences:
        return "I don't know — I couldn't find anything about that in the docs."
    best = max(sentences, key=lambda s: cosine(q, embed(s)))
    return best if best.endswith(".") else best + "."
