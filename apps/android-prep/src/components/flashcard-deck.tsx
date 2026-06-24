"use client";

import { useMemo, useState } from "react";
import type { Flashcard } from "@/data/flashcards";
import { useLocalStorage } from "@/lib/use-local-storage";
import { RichText } from "@/components/rich-text";
import { AiTutor } from "@/components/ai-tutor";
import { plainText } from "@/data/all";
import { LEVELS, LEVEL_BADGE, LEVEL_LABEL, type Level } from "@/lib/levels";
import {
  type SrsMap,
  type Grade,
  type DayLog,
  GRADES,
  isDue,
  isKnown,
  schedule,
  todayEpochDay,
  nextLabel,
  logToday,
  unlogToday,
  countToday,
} from "@/lib/srs";

type Filter = { value: string; label: string };

export function FlashcardDeck({
  cards,
  filters,
  // On /today the set refills as you grade, so the "Known X / total" meter
  // can't climb. dailyCounter switches it to "Known today: N", backed by a
  // per-day log that survives the refill.
  dailyCounter = false,
}: {
  cards: Flashcard[];
  filters: Filter[];
  dailyCounter?: boolean;
}) {
  const { value: grades, set: setGrades, reset } = useLocalStorage<
    Record<string, Grade>
  >("androidprep:qa", {});
  const { value: srs, set: setSrs, reset: resetSrs } = useLocalStorage<SrsMap>(
    "androidprep:srs",
    {},
  );
  const {
    value: knownToday,
    set: setKnownToday,
    reset: resetKnownToday,
  } = useLocalStorage<DayLog>("androidprep:cards-known-today", { day: 0, ids: [] });
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [aiOpen, setAiOpen] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState("all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [dueOnly, setDueOnly] = useState(false);
  const [order, setOrder] = useState<string[]>(() => cards.map((c) => c.id));

  const today = todayEpochDay();
  const byId = useMemo(
    () => new Map(cards.map((c) => [c.id, c])),
    [cards],
  );
  // Apply the (shuffle) order, then append any cards not yet in it. On /today
  // the set refills as items grade out of the due pool, so fresh cards arrive
  // absent from `order`; appending them here keeps the deck endless instead of
  // silently shrinking. For the stable /flashcards deck nothing is appended.
  const ordered = useMemo(() => {
    const inOrder = order
      .map((id) => byId.get(id))
      .filter((c): c is Flashcard => !!c);
    const seen = new Set(order);
    const appended = cards.filter((c) => !seen.has(c.id));
    return [...inOrder, ...appended];
  }, [order, byId, cards]);
  const visible = ordered.filter(
    (c) =>
      (filter === "all" || c.category === filter) &&
      (level === "all" || c.level === level) &&
      (!dueOnly || isDue(srs[c.id], today)),
  );
  const known = cards.filter((c) => isKnown(grades[c.id])).length;
  const due = cards.filter((c) => isDue(srs[c.id], today)).length;

  /** Grade a card by confidence: update the badge state and the spaced-repetition schedule. */
  function grade(id: string, g: Grade) {
    setGrades((prev) => ({ ...prev, [id]: g }));
    setSrs((s) => ({ ...s, [id]: schedule(s[id], g, today) }));
    // Track today's "known" tally so the /today counter climbs past the refill.
    setKnownToday((log) =>
      isKnown(g) ? logToday(log, id, today) : unlogToday(log, id, today),
    );
  }

  function shuffle() {
    setOrder((prev) =>
      [...prev]
        .map((id) => [Math.random(), id] as const)
        .sort((a, b) => a[0] - b[0])
        .map(([, id]) => id),
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <FilterChip
            key={f.value}
            active={filter === f.value}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </FilterChip>
        ))}
        <span className="ml-auto text-sm text-muted">
          {dailyCounter ? (
            <>
              Known today <b className="text-good">{countToday(knownToday, today)}</b>
            </>
          ) : (
            <>
              Known <b className="text-good">{known}</b> / {cards.length}
            </>
          )}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Level
        </span>
        <FilterChip active={level === "all"} onClick={() => setLevel("all")}>
          All
        </FilterChip>
        {LEVELS.map((l) => (
          <FilterChip
            key={l.value}
            active={level === l.value}
            onClick={() => setLevel(l.value)}
          >
            {l.label}
          </FilterChip>
        ))}
        <span className="ml-auto text-sm text-muted">
          Showing <b className="text-text">{visible.length}</b>
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setDueOnly((v) => !v)}
          aria-pressed={dueOnly}
          className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
            dueOnly
              ? "border-accent-2/50 bg-accent-2/15 text-accent-2"
              : "border-border bg-surface text-muted hover:text-text"
          }`}
        >
          ⏱ Due ({due})
        </button>
        <button
          onClick={shuffle}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-text"
        >
          🔀 Shuffle
        </button>
        <button
          onClick={() => {
            if (confirm("Reset grades and spaced-repetition schedule?")) {
              reset();
              resetSrs();
              resetKnownToday();
            }
          }}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-bad"
        >
          ↺ Reset progress
        </button>
        <span className="ml-auto text-xs text-muted">
          Grade a card → it reschedules. Drill <b className="text-accent-2">Due</b> daily.
        </span>
      </div>

      {dueOnly && visible.length === 0 && (
        <div className="card text-center text-sm text-muted">
          🎉 Nothing due in this filter. Come back tomorrow, or turn off{" "}
          <b className="text-accent-2">Due</b> to keep drilling.
        </div>
      )}

      <ul className="space-y-3">
        {visible.map((card) => {
          const isOpen = !!revealed[card.id];
          const gradeState = grades[card.id];
          return (
            <li
              key={card.id}
              className={`card overflow-hidden p-0 transition-colors ${
                isKnown(gradeState)
                  ? "border-good/40"
                  : gradeState
                    ? "border-warn/40"
                    : ""
              }`}
            >
              <button
                onClick={() =>
                  setRevealed((r) => ({ ...r, [card.id]: !r[card.id] }))
                }
                aria-expanded={isOpen}
                className="flex w-full items-start gap-3 p-5 text-left"
              >
                <span className="mt-0.5 flex shrink-0 flex-col gap-1">
                  <span className="rounded-full border border-accent/40 bg-accent/12 px-2 py-0.5 text-center text-[0.7rem] font-bold text-accent">
                    {card.categoryLabel}
                  </span>
                  {card.level && (
                    <span
                      className={`rounded-full border px-2 py-0.5 text-center text-[0.62rem] font-bold uppercase ${LEVEL_BADGE[card.level]}`}
                    >
                      {LEVEL_LABEL[card.level]}
                    </span>
                  )}
                </span>
                <span className="font-semibold text-white">
                  {card.question}
                </span>
                {gradeState && (
                  <span
                    className={`ml-auto shrink-0 text-[0.7rem] font-bold uppercase tracking-wide ${
                      isKnown(gradeState) ? "text-good" : "text-warn"
                    }`}
                  >
                    {gradeState}
                  </span>
                )}
              </button>

              {isOpen && (
                <div className="border-t border-border px-5 pb-5 pt-4">
                  <RichText html={card.answerHtml} />
                  <p className="mt-4 mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                    How well did you know it?
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {GRADES.map((g) => (
                      <button
                        key={g.value}
                        onClick={() => grade(card.id, g.value)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${g.badge}`}
                      >
                        {g.label}
                      </button>
                    ))}
                    <span className="ml-auto text-xs text-muted">
                      next review: {nextLabel(srs[card.id], today)}
                    </span>
                  </div>
                  <div className="mt-3">
                    <button
                      onClick={() =>
                        setAiOpen((o) => ({ ...o, [card.id]: !o[card.id] }))
                      }
                      className="text-xs font-semibold text-accent transition-colors hover:text-accent-2"
                    >
                      🤖 {aiOpen[card.id] ? "Hide AI tutor" : "Explain with AI"}
                    </button>
                    {aiOpen[card.id] && (
                      <div className="mt-2">
                        <AiTutor
                          context={`Q: ${card.question}\nA: ${plainText(card.answerHtml)}`}
                          placeholder="Ask about this card…"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-accent/40 bg-accent/15 text-accent"
          : "border-border bg-surface text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}
