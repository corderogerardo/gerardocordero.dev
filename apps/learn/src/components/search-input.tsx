"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCourse } from "@/stores/course-context";
import { useI18n } from "@/lib/i18n";
import type { Lesson, Module } from "@/lib/course-data";

interface SearchEntry {
  m: Module;
  l: Lesson;
  textOriginal: string;
  textLower: string;
}

interface Hit {
  moduleId: string;
  lessonId: string;
  lessonTitle: string;
  moduleTitle: string;
  snippet: string;
}

function snippetAround(text: string, idx: number, len: number): string {
  const radius = 35;
  let start = Math.max(0, idx - radius);
  let end = Math.min(text.length, idx + len + radius);
  let snippet = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) snippet = "…" + snippet;
  if (end < text.length) snippet += "…";
  return snippet;
}

export default function SearchInput() {
  const { course } = useCourse();
  const { t, locale } = useI18n();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Hit[]>([]);
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const buildIndex = useCallback(() => {
    if (index) return;
    const entries: SearchEntry[] = [];
    for (const m of course.modules) {
      for (const l of m.lessons) {
        const parts: string[] = [l.title];
        for (const step of l.steps) {
          if (step.type === "text") parts.push(...(step.md || []));
          else if (step.type === "code") parts.push(step.title || "", step.caption || "", step.source);
          else if (step.type === "quiz") parts.push(step.q, step.explain || "");
          else if (step.type === "exercise") parts.push(step.title || "", ...(step.prompt || []));
          else if (step.type === "xcode") parts.push(step.title || "", ...(step.items || []));
        }
        const textOriginal = parts.filter(Boolean).join(" \n ");
        entries.push({ m, l, textOriginal, textLower: textOriginal.toLowerCase() });
      }
    }
    setIndex(entries);
  }, [course.modules, index]);

  const search = useCallback(
    (q: string) => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      const hits: Hit[] = [];
      for (const entry of index!) {
        const idx = entry.textLower.indexOf(q);
        if (idx === -1) continue;
        hits.push({
          moduleId: entry.m.id,
          lessonId: entry.l.id,
          lessonTitle: entry.l.title,
          moduleTitle: entry.m.title,
          snippet: snippetAround(entry.textOriginal, idx, q.length),
        });
        if (hits.length >= 15) break;
      }
      setResults(hits);
    },
    [index],
  );

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query.length >= 2 && index) search(query);
      else if (query.length < 2) setResults([]);
    }, 150);
    return () => clearTimeout(debounceRef.current);
  }, [query, index, search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuery("");
      setResults([]);
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleResultClick = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="search"
        placeholder={t("search.placeholder")}
        className="search-input"
        id="lesson-search"
        value={query}
        onChange={(e) => setQuery(e.target.value.toLowerCase())}
        onFocus={buildIndex}
        onKeyDown={handleKeyDown}
      />
      {results.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: "var(--card)", border: "1px solid var(--hairline)", borderRadius: 8 }}>
          {results.map((r) => (
            <Link
              key={`${r.moduleId}/${r.lessonId}`}
              href={`/${locale}/learn/${course.id}/${r.moduleId}/${r.lessonId}`}
              className="search-result"
              onClick={handleResultClick}
            >
              <div>{r.lessonTitle}</div>
              <div className="mono-caption">{r.moduleTitle}</div>
              <div className="search-snippet">{r.snippet}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
