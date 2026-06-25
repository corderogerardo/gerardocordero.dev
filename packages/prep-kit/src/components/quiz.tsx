"use client";

import { useState } from "react";
import type { QuizQuestion } from "../types";
import { usePersisted } from "../config";
import { RichText } from "./rich-text";

type Filter = { value: string; label: string };
const LETTERS = ["A", "B", "C", "D", "E"];

export function Quiz({
  questions,
  filters,
}: {
  questions: QuizQuestion[];
  filters: Filter[];
}) {
  const { value: answers, set: setAnswers, reset } = usePersisted<
    Record<string, number>
  >("quiz", {});
  const [filter, setFilter] = useState("all");
  const [unansweredOnly, setUnansweredOnly] = useState(false);

  const visible = questions.filter(
    (q) =>
      (filter === "all" || q.category === filter) &&
      (!unansweredOnly || answers[q.id] == null),
  );
  const answeredIds = questions.filter((q) => answers[q.id] != null);
  const remaining = questions.length - answeredIds.length;
  const correct = answeredIds.filter(
    (q) => answers[q.id] === q.answer,
  ).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            aria-pressed={filter === f.value}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value
                ? "border-accent/40 bg-accent/15 text-accent"
                : "border-border bg-surface text-muted hover:text-text"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-muted">
          Score <b className="text-good">{correct}</b> / {answeredIds.length}{" "}
          answered · {questions.length} total
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setUnansweredOnly((v) => !v)}
          aria-pressed={unansweredOnly}
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
            unansweredOnly
              ? "border-accent-2/50 bg-accent-2/15 text-accent-2"
              : "border-border bg-surface text-muted hover:text-text"
          }`}
        >
          ◯ Unanswered ({remaining})
        </button>
        <button
          onClick={() => {
            if (confirm("Reset all quiz answers?")) reset();
          }}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-bad"
        >
          ↺ Reset my answers
        </button>
      </div>

      <ol className="space-y-4">
        {visible.map((q, i) => {
          const picked = answers[q.id];
          const answered = picked != null;
          const isCorrect = picked === q.answer;
          return (
            <li key={q.id} className="card">
              <div className="mb-3 flex flex-wrap items-baseline gap-2">
                <span className="font-mono font-bold text-accent">
                  Q{i + 1}
                </span>
                <span className="font-semibold text-white">{q.question}</span>
                <span className="ml-auto rounded-full border border-border bg-surface px-2 py-0.5 text-[0.7rem] font-medium text-muted">
                  {q.categoryLabel}
                </span>
              </div>

              <div className="grid gap-2">
                {q.options.map((opt, idx) => {
                  const state = !answered
                    ? "idle"
                    : idx === q.answer
                      ? "correct"
                      : idx === picked
                        ? "wrong"
                        : "muted";
                  return (
                    <button
                      key={idx}
                      disabled={answered}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, [q.id]: idx }))
                      }
                      className={[
                        "flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors",
                        state === "idle" &&
                          "border-border bg-surface-2 hover:border-accent/50",
                        state === "correct" &&
                          "border-good/60 bg-good/15 text-good",
                        state === "wrong" && "border-bad/60 bg-bad/15 text-bad",
                        state === "muted" &&
                          "border-border bg-surface-2 opacity-60",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <span className="font-bold">{LETTERS[idx]}</span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div
                  className={`mt-3 rounded-xl border-l-[3px] bg-surface-2 px-3.5 py-2.5 text-sm ${
                    isCorrect ? "border-good" : "border-warn"
                  }`}
                >
                  <p
                    className={`mb-1 font-bold ${
                      isCorrect ? "text-good" : "text-warn"
                    }`}
                  >
                    {isCorrect ? "✓ Correct" : "✗ Not quite — see why:"}
                  </p>
                  <RichText html={q.explanationHtml} />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
