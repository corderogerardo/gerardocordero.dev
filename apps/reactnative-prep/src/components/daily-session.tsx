"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ALL_FLASHCARDS, ALL_PROMPTS } from "@/data/all";
import { FlashcardDeck } from "@/components/flashcard-deck";
import { PromptDeck } from "@/components/prompt-deck";
import { useLocalStorage } from "@/lib/use-local-storage";
import { type SrsMap, isDue, todayEpochDay, dueCount } from "@/lib/srs";
import {
  type Streak,
  bumpStreak,
  currentStreak,
  doneToday,
} from "@/lib/streak";

const CARD_TARGET = 12;
const SESSION_FILTERS = [{ value: "all", label: "All" }];

export function DailySession() {
  const { value: srs } = useLocalStorage<SrsMap>("rnprep:srs", {});
  const { value: pSrs } = useLocalStorage<SrsMap>("rnprep:prompts-srs", {});
  const { value: streak, set: setStreak } = useLocalStorage<Streak | undefined>(
    "rnprep:streak",
    undefined,
  );
  const today = todayEpochDay();

  // Deterministic daily set: due/new cards capped, scheduled-due first.
  const sessionCards = useMemo(() => {
    const due = ALL_FLASHCARDS.filter((c) => isDue(srs[c.id], today));
    const scheduled = due.filter((c) => srs[c.id]);
    const fresh = due.filter((c) => !srs[c.id]);
    return [...scheduled, ...fresh].slice(0, CARD_TARGET);
  }, [srs, today]);

  const todayPrompts = useMemo(() => {
    const pick = (kind: "coding" | "design") =>
      ALL_PROMPTS.filter((p) => p.kind === kind && isDue(pSrs[p.id], today))[0];
    return [pick("coding"), pick("design")].filter(Boolean);
  }, [pSrs, today]);

  const dueTotal = dueCount(
    ALL_FLASHCARDS.map((c) => c.id),
    srs,
    today,
  );
  const done = doneToday(streak, today);
  const streakN = currentStreak(streak, today);

  return (
    <div className="space-y-8">
      <div className="card flex flex-wrap items-center gap-4 border-l-[3px] border-accent-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden>
            🔥
          </span>
          <div>
            <div className="text-2xl font-extrabold text-white">
              {streakN} day{streakN === 1 ? "" : "s"}
            </div>
            <div className="text-xs text-muted">
              current streak · best {streak?.best ?? 0}
            </div>
          </div>
        </div>
        <div className="text-sm text-muted">
          <b className="text-accent-2">{dueTotal}</b> cards due · today&apos;s set:{" "}
          <b className="text-text">{sessionCards.length}</b> cards +{" "}
          <b className="text-text">{todayPrompts.length}</b> prompts
        </div>
        <button
          onClick={() => setStreak((s) => bumpStreak(s, today))}
          disabled={done}
          className={`ml-auto rounded-xl px-4 py-2 text-sm font-bold transition-opacity ${
            done
              ? "cursor-default bg-good/15 text-good"
              : "bg-gradient-to-r from-accent to-accent-2 text-bg hover:opacity-90"
          }`}
        >
          {done ? "✓ Done today" : "Mark today complete"}
        </button>
      </div>

      {sessionCards.length === 0 ? (
        <div className="card text-center text-muted">
          🎉 No cards due right now — you&apos;re ahead. Browse the full{" "}
          <Link href="/flashcards" className="text-accent hover:underline">
            flashcard deck
          </Link>{" "}
          or do a{" "}
          <Link href="/practice" className="text-accent hover:underline">
            practice prompt
          </Link>
          .
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">
            Today&apos;s cards{" "}
            <span className="text-sm font-normal text-muted">
              — grade each by confidence
            </span>
          </h2>
          <FlashcardDeck cards={sessionCards} filters={SESSION_FILTERS} dailyCounter />
        </section>
      )}

      {todayPrompts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">
            Today&apos;s prompts{" "}
            <span className="text-sm font-normal text-muted">
              — try before you reveal
            </span>
          </h2>
          <PromptDeck prompts={todayPrompts} dailyCounter />
        </section>
      )}
    </div>
  );
}
