"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ALL_FLASHCARDS, ALL_PROMPTS, ALL_QUIZ, ALL_STUDY, plainText } from "@/data/all";

type Item = {
  id: string;
  kind: string;
  title: string;
  text: string;
  href: string;
  badge: string;
};

function buildIndex(): Item[] {
  return [
    ...ALL_FLASHCARDS.map((c) => ({
      id: c.id,
      kind: "Flashcard",
      title: c.question,
      text: `${c.question} ${plainText(c.answerHtml)}`,
      href: "/flashcards",
      badge: c.categoryLabel,
    })),
    ...ALL_PROMPTS.map((p) => ({
      id: p.id,
      kind: p.kind === "coding" ? "Coding" : "Design",
      title: p.title,
      text: `${p.title} ${p.tags.join(" ")} ${plainText(p.promptHtml)}`,
      href: "/practice",
      badge: p.kind === "coding" ? "CODE" : "DESIGN",
    })),
    ...ALL_QUIZ.map((q) => ({
      id: q.id,
      kind: "Quiz",
      title: q.question,
      text: `${q.question} ${q.options.join(" ")}`,
      href: "/quiz",
      badge: q.categoryLabel,
    })),
    ...ALL_STUDY.map((s) => ({
      id: s.id,
      kind: "Study",
      title: s.title,
      text: `${s.title} ${plainText(s.html)}`,
      href: `/study#${s.id}`,
      badge: "STUDY",
    })),
  ];
}

function keywordRank(index: Item[], query: string): Item[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return index
    .map((it) => {
      const title = it.title.toLowerCase();
      const text = it.text.toLowerCase();
      let score = 0;
      for (const t of tokens) {
        if (title.includes(t)) score += 3;
        if (text.includes(t)) score += 1;
      }
      return { it, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map((x) => x.it);
}

type AiState = "off" | "loading" | "ready" | "error";

export function SearchView() {
  const index = useMemo(() => buildIndex(), []);
  const [query, setQuery] = useState("");
  const [ai, setAi] = useState<AiState>("off");
  const [device, setDevice] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [semanticResults, setSemanticResults] = useState<Item[]>([]);
  const workerRef = useRef<Worker | null>(null);
  const queryIdRef = useRef(0);

  // Keyword results are derived during render — instant, always available.
  const keywordResults = useMemo(() => keywordRank(index, query), [index, query]);

  // Terminate the worker on unmount.
  useEffect(
    () => () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    },
    [],
  );

  function enableAi() {
    setAi("loading");
    try {
      const w = new Worker("/semantic-worker.js", { type: "module" });
      workerRef.current = w;
      w.onmessage = (e: MessageEvent) => {
        const m = e.data;
        if (m.type === "ready") {
          setDevice(m.device);
          w.postMessage({ type: "index", texts: index.map((i) => i.text) });
        } else if (m.type === "indexed") {
          setAi("ready");
        } else if (m.type === "progress") {
          setProgress(m.value);
        } else if (m.type === "results") {
          if (m.id === queryIdRef.current) {
            setSemanticResults(
              (m.ranked as { i: number }[])
                .map((r) => index[r.i])
                .filter(Boolean),
            );
          }
        } else if (m.type === "error") {
          console.error("semantic worker:", m.error);
          setAi("error");
          w.terminate();
          workerRef.current = null;
        }
      };
      w.onerror = (err) => {
        console.error("semantic worker failed:", err.message);
        setAi("error");
      };
      w.postMessage({ type: "init" });
    } catch (e) {
      console.error("worker unavailable:", e);
      setAi("error");
    }
  }

  // Debounced semantic queries once the worker is ready.
  useEffect(() => {
    if (ai !== "ready" || !workerRef.current) return;
    const id = ++queryIdRef.current;
    const t = setTimeout(() => {
      const q = query.trim();
      if (!q) {
        setSemanticResults([]);
        return;
      }
      workerRef.current?.postMessage({ type: "query", q, id });
    }, 250);
    return () => clearTimeout(t);
  }, [query, ai]);

  const results = ai === "ready" ? semanticResults : keywordResults;

  return (
    <div className="space-y-5">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by keyword — or enable AI to search by meaning…"
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none placeholder:text-muted focus:border-accent/60"
      />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {ai === "off" && (
          <button
            onClick={enableAi}
            className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-3.5 py-1.5 font-semibold text-bg transition-opacity hover:opacity-90"
          >
            🧠 Try AI semantic search (on-device)
          </button>
        )}
        {ai === "loading" && (
          <span className="text-muted">
            Loading on-device model in a worker
            {progress ? ` · ${progress}%` : " (first time downloads ~25 MB)"}…
          </span>
        )}
        {ai === "ready" && (
          <span className="rounded-full border border-good/40 bg-good/12 px-3 py-1 font-medium text-good">
            🧠 AI search on · {device === "webgpu" ? "WebGPU" : "WASM"} · in a
            worker, fully on your device
          </span>
        )}
        {ai === "error" && (
          <span className="rounded-full border border-warn/40 bg-warn/12 px-3 py-1 font-medium text-warn">
            On-device AI isn&apos;t supported here — keyword search active
          </span>
        )}
        <span className="ml-auto text-muted">{results.length} results</span>
      </div>

      {query && results.length === 0 && (
        <p className="text-sm text-muted">No matches. Try fewer or broader words.</p>
      )}

      <ul className="space-y-2">
        {results.map((r) => (
          <li key={`${r.kind}-${r.id}`}>
            <Link
              href={r.href}
              className="card group flex items-start gap-3 py-3 transition-colors hover:border-accent/50"
            >
              <span className="mt-0.5 shrink-0 rounded-full border border-border bg-surface-2 px-2 py-0.5 text-[0.62rem] font-bold uppercase text-muted">
                {r.kind}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-white">{r.title}</span>
                <span className="mt-0.5 line-clamp-2 block text-sm text-muted">
                  {r.text.slice(r.title.length, r.title.length + 160)}
                </span>
              </span>
              <span className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
