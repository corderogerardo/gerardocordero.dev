// The study session: a queue of card ids plus the state the deck renders.
//
// The screen owns rendering and persistence; this module owns the transitions, so the
// rules are unit-testable without a device. No React, no storage, no navigation.
//
// "Again" recirculates a card to the back of the queue instead of finishing it, so the
// queue shrinks and grows. `done` counts distinct cards finished (hard/good/easy) and
// never counts an "again", so `queue.length + done` stays at the number of distinct
// cards the session started with — the denominator the progress bar divides by.
import { isDue, type Grade, type SrsMap } from "@gerardocordero/prep-kit/lib/srs";

export type SessionMode = "due" | "ahead";

export type Session = {
  /** Subject + category this session was built for; a change starts a new session. */
  key: string;
  /** Card ids left to study. `queue[0]` is the card on screen. */
  queue: string[];
  /** Whether the current card's answer is showing. */
  revealed: boolean;
  /** Distinct cards finished this session. */
  done: number;
  /** "due" = only cards scheduled for today, "ahead" = the whole pool. */
  mode: SessionMode;
};

/** State before the first hydrated session starts. Treated as immutable. */
export const EMPTY_SESSION: Session = {
  key: "",
  queue: [],
  revealed: false,
  done: 0,
  mode: "due",
};

/** Start a due-only session for `key`, keeping the pool's order. */
export function startDueSession(
  key: string,
  poolIds: string[],
  srs: SrsMap,
  today: number,
): Session {
  return {
    key,
    queue: poolIds.filter((id) => isDue(srs[id], today)),
    revealed: false,
    done: 0,
    mode: "due",
  };
}

/** The card being studied, or undefined once the queue is exhausted (session done). */
export function currentCardId(session: Session): string | undefined {
  return session.queue[0];
}

/** Show the answer for the current card. */
export function revealCard(session: Session): Session {
  return session.revealed ? session : { ...session, revealed: true };
}

/**
 * Grade the current card. hard/good/easy finish it and count it as done; "again"
 * sends it to the back of the queue without counting. Either way the next card starts
 * unrevealed. An empty queue is a no-op.
 */
export function applyGrade(session: Session, grade: Grade): Session {
  const id = currentCardId(session);
  if (!id) return session;

  const rest = session.queue.slice(1);
  return grade === "again"
    ? { ...session, revealed: false, queue: [...rest, id] }
    : { ...session, revealed: false, done: session.done + 1, queue: rest };
}

/** Replace the queue with the whole pool ("study ahead") and restart progress. */
export function startAheadSession(session: Session, poolIds: string[]): Session {
  return {
    ...session,
    queue: [...poolIds],
    revealed: false,
    done: 0,
    mode: "ahead",
  };
}

/** Total cards in the session (current + finished) and percent finished, 0..100. */
export function sessionProgress(session: Session): { total: number; percent: number } {
  const total = session.queue.length + session.done;
  return { total, percent: total > 0 ? (session.done / total) * 100 : 0 };
}
