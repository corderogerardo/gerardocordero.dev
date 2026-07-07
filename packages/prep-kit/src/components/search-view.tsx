"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Flashcard, Prompt, QuizQuestion, StudySection } from "../types";
import { plainText } from "../lib/plain-text";
import { useI18n } from "../lib/i18n";

export type SearchContent = {
  flashcards: Flashcard[];
  prompts: Prompt[];
  quiz: QuizQuestion[];
  study: StudySection[];
};

type Item = {
  id: string;
  kind: string;
  title: string;
  text: string;
  href: string;
  badge: string;
};

function buildIndex(content: SearchContent): Item[] {
  return [
    ...content.flashcards.map((c) => ({
      id: c.id,
      kind: "Flashcard",
      title: c.question,
      text: `${c.question} ${plainText(c.answerHtml)}`,
      href: "/flashcards",
      badge: c.categoryLabel,
    })),
    ...content.prompts.map((p) => ({
      id: p.id,
      kind: p.kind === "coding" ? "Coding" : "Design",
      title: p.title,
      text: `${p.title} ${p.tags.join(" ")} ${plainText(p.promptHtml)}`,
      href: "/practice",
      badge: p.kind === "coding" ? "CODE" : "DESIGN",
    })),
    ...content.quiz.map((q) => ({
      id: q.id,
      kind: "Quiz",
      title: q.question,
      text: `${q.question} ${q.options.join(" ")}`,
      href: "/quiz",
      badge: q.categoryLabel,
    })),
    ...content.study.map((s) => ({
      id: s.id,
      kind: "Study",
      title: s.title,
      text: `${s.title} ${plainText(s.html)}`,
      href: `/study#${s.id}`,
      badge: "STUDY",
    })),
  ];
}

/** Keyword score per item index (title hits weighted higher). */
function scoreKeyword(index: Item[], query: string): { i: number; score: number }[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  const out: { i: number; score: number }[] = [];
  index.forEach((it, i) => {
    const title = it.title.toLowerCase();
    const text = it.text.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (title.includes(t)) score += 3;
      if (text.includes(t)) score += 1;
    }
    if (score > 0) out.push({ i, score });
  });
  return out.sort((a, b) => b.score - a.score);
}

function fnv(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

type AiState = "off" | "loading" | "ready" | "error";
type Ranked = { i: number; score: number }[];

export function SearchView({ flashcards, prompts, quiz, study }: SearchContent) {
  const { t } = useI18n();
  const index = useMemo(
    () => buildIndex({ flashcards, prompts, quiz, study }),
    [flashcards, prompts, quiz, study],
  );
  const embedTexts = useMemo(
    () => index.map((i) => i.text.slice(0, 400)),
    [index],
  );
  const signature = useMemo(
    () => `bge:${embedTexts.length}:${fnv(embedTexts.join("|"))}`,
    [embedTexts],
  );

  const [query, setQuery] = useState("");
  const [ai, setAi] = useState<AiState>("off");
  const [device, setDevice] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [indexMsg, setIndexMsg] = useState("");
  const [semantic, setSemantic] = useState<Ranked | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const queryIdRef = useRef(0);

  const keywordScored = useMemo(() => scoreKeyword(index, query), [index, query]);

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
          w.postMessage({ type: "index", texts: embedTexts, signature });
        } else if (m.type === "indexProgress") {
          setIndexMsg(`indexing ${m.done}/${m.total}`);
        } else if (m.type === "indexed") {
          setIndexMsg("");
          setAi("ready");
        } else if (m.type === "progress") {
          setProgress(m.value);
        } else if (m.type === "results") {
          if (m.id === queryIdRef.current) setSemantic(m.ranked as Ranked);
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
      if (q) workerRef.current?.postMessage({ type: "query", q, id });
    }, 220);
    return () => clearTimeout(t);
  }, [query, ai]);

  // Hybrid ranking: blend normalized keyword + semantic scores (keyword keeps
  // precision, semantic adds recall). Falls back to keyword-only when AI is off.
  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    if (ai !== "ready" || !semantic) {
      return keywordScored.slice(0, 30).map((x) => index[x.i]);
    }
    const kwMax = keywordScored[0]?.score || 1;
    const kw = new Map(keywordScored.map((x) => [x.i, x.score / kwMax]));
    const semMax = Math.max(...semantic.map((r) => r.score), 1e-6);
    const sem = new Map(semantic.map((r) => [r.i, r.score / semMax]));
    const union = new Set<number>([...kw.keys(), ...sem.keys()]);
    return [...union]
      .map((i) => ({ i, score: 0.6 * (kw.get(i) ?? 0) + 0.4 * (sem.get(i) ?? 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 30)
      .map((x) => index[x.i]);
  }, [ai, semantic, keywordScored, index, query]);

  return (
    <div className="space-y-5">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("search.placeholder")}
        className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-text outline-none placeholder:text-muted focus:border-accent/60"
      />

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {ai === "off" && (
          <button
            onClick={enableAi}
            className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-3.5 py-1.5 font-semibold text-bg transition-opacity hover:opacity-90"
          >
            {t("search.enableAi")}
          </button>
        )}
        {ai === "loading" && (
          <span className="text-muted">
            {indexMsg
              ? t("search.embedding", {msg: indexMsg})
              : t("search.loading", {progress: progress ? t("search.loading.pct", {pct: progress}) : t("search.loading.first")})}
          </span>
        )}
        {ai === "ready" && (
          <span className="rounded-full border border-good/40 bg-good/12 px-3 py-1 font-medium text-good">
            <span dangerouslySetInnerHTML={{__html: t("search.hybrid", {device: device === "webgpu" ? "WebGPU" : "WASM"})}} />
          </span>
        )}
        {ai === "error" && (
          <span className="rounded-full border border-warn/40 bg-warn/12 px-3 py-1 font-medium text-warn">
            {t("search.error")}
          </span>
        )}
        <span className="ml-auto text-muted">{t("search.results", {n: results.length})}</span>
      </div>

      {query && results.length === 0 && (
        <p className="text-sm text-muted">{t("search.noMatches")}</p>
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
