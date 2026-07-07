"use client";

import { useMemo } from "react";
import { usePersisted } from "../config";
import { useI18n } from "../lib/i18n";
import type { Flashcard, Prompt } from "../types";
import { FlashcardDeck } from "./flashcard-deck";
import { PromptDeck } from "./prompt-deck";
import { type SrsMap, isDue, todayEpochDay, dueCount } from "../lib/srs";
import {
  type Streak,
  bumpStreak,
  currentStreak,
  doneToday,
} from "../lib/streak";

const CARD_TARGET = 12;
const SESSION_FILTERS = [{ value: "all", label: "All" }];

export function DailySession({
  flashcards,
  prompts,
}: {
  flashcards: Flashcard[];
  prompts: Prompt[];
}) {
  const { value: srs } = usePersisted<SrsMap>("srs", {});
  const { value: pSrs } = usePersisted<SrsMap>("prompts-srs", {});
  const { value: streak, set: setStreak } = usePersisted<Streak | undefined>(
    "streak",
    undefined,
  );
  const { t } = useI18n();
  const today = todayEpochDay();

  // Deterministic daily set: due/new cards capped, scheduled-due first.
  const sessionCards = useMemo(() => {
    const due = flashcards.filter((c) => isDue(srs[c.id], today));
    const scheduled = due.filter((c) => srs[c.id]);
    const fresh = due.filter((c) => !srs[c.id]);
    return [...scheduled, ...fresh].slice(0, CARD_TARGET);
  }, [flashcards, srs, today]);

  const todayPrompts = useMemo(() => {
    const pick = (kind: "coding" | "design") =>
      prompts.filter((p) => p.kind === kind && isDue(pSrs[p.id], today))[0];
    return [pick("coding"), pick("design")].filter(Boolean);
  }, [prompts, pSrs, today]);

  const dueTotal = dueCount(
    flashcards.map((c) => c.id),
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
              <span dangerouslySetInnerHTML={{__html: t("daily.streak", {n: streakN, s: streakN === 1 ? "" : "s"})}} />
            </div>
            <div className="text-xs text-muted">
              <span dangerouslySetInnerHTML={{__html: t("daily.streakCurrent", {best: streak?.best ?? 0})}} />
            </div>
          </div>
        </div>
        <div className="text-sm text-muted">
          <span dangerouslySetInnerHTML={{__html: t("daily.cardsDue", {n: dueTotal, cards: sessionCards.length, prompts: todayPrompts.length})}} />
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
          {done ? t("daily.done") : t("daily.markDone")}
        </button>
      </div>

      {sessionCards.length === 0 ? (
        <div className="card text-center text-muted">
          <span dangerouslySetInnerHTML={{__html: t("daily.noCards")}} />
        </div>
      ) : (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">
            {t("daily.cardsTitle")}{" "}
            <span className="text-sm font-normal text-muted">
              {t("daily.cardsSub")}
            </span>
          </h2>
          <FlashcardDeck cards={sessionCards} filters={SESSION_FILTERS} dailyCounter />
        </section>
      )}

      {todayPrompts.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white">
            {t("daily.promptsTitle")}{" "}
            <span className="text-sm font-normal text-muted">
              {t("daily.promptsSub")}
            </span>
          </h2>
          <PromptDeck prompts={todayPrompts} dailyCounter />
        </section>
      )}
    </div>
  );
}
