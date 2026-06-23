"use client";

import { useState } from "react";
import type { Prompt, PromptKind } from "@/data/prompts";
import { useLocalStorage } from "@/lib/use-local-storage";
import { RichText } from "@/components/rich-text";
import { LEVELS, LEVEL_BADGE, LEVEL_LABEL, type Level } from "@/lib/levels";
import {
  type SrsMap,
  type DayLog,
  isDue,
  schedule,
  todayEpochDay,
  nextLabel,
  logToday,
  unlogToday,
  countToday,
} from "@/lib/srs";

type Status = "solved" | "revisit";

const KINDS: { value: PromptKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "coding", label: "Coding" },
  { value: "design", label: "System design" },
];

export function PromptDeck({
  prompts,
  // On /today the prompt set refills as you solve, so "Solved X / total"
  // can't climb. dailyCounter switches it to "Solved today: N".
  dailyCounter = false,
}: {
  prompts: Prompt[];
  dailyCounter?: boolean;
}) {
  const { value: status, set: setStatus, reset } = useLocalStorage<
    Record<string, Status>
  >("rnprep:prompts", {});
  const { value: srs, set: setSrs, reset: resetSrs } = useLocalStorage<SrsMap>(
    "rnprep:prompts-srs",
    {},
  );
  const {
    value: solvedToday,
    set: setSolvedToday,
    reset: resetSolvedToday,
  } = useLocalStorage<DayLog>("rnprep:prompts-solved-today", { day: 0, ids: [] });
  const [kind, setKind] = useState<PromptKind | "all">("all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [dueOnly, setDueOnly] = useState(false);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const today = todayEpochDay();
  const visible = prompts.filter(
    (p) =>
      (kind === "all" || p.kind === kind) &&
      (level === "all" || p.level === level) &&
      (!dueOnly || isDue(srs[p.id], today)),
  );
  const solved = prompts.filter((p) => status[p.id] === "solved").length;
  const due = prompts.filter((p) => isDue(srs[p.id], today)).length;

  /** A "Solved" repeats it later (good); "Revisit" brings it back today (again). */
  function gradePrompt(id: string, s: Status) {
    setStatus((prev) => ({ ...prev, [id]: s }));
    setSrs((m) => ({
      ...m,
      [id]: schedule(m[id], s === "solved" ? "good" : "again", today),
    }));
    // Track today's solved tally so the /today counter climbs past the refill.
    setSolvedToday((log) =>
      s === "solved" ? logToday(log, id, today) : unlogToday(log, id, today),
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {KINDS.map((k) => (
          <Chip key={k.value} active={kind === k.value} onClick={() => setKind(k.value)}>
            {k.label}
          </Chip>
        ))}
        <span className="ml-auto text-sm text-muted">
          {dailyCounter ? (
            <>
              Solved today <b className="text-good">{countToday(solvedToday, today)}</b>
            </>
          ) : (
            <>
              Solved <b className="text-good">{solved}</b> / {prompts.length}
            </>
          )}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          Level
        </span>
        <Chip active={level === "all"} onClick={() => setLevel("all")}>
          All
        </Chip>
        {LEVELS.map((l) => (
          <Chip key={l.value} active={level === l.value} onClick={() => setLevel(l.value)}>
            {l.label}
          </Chip>
        ))}
        <button
          onClick={() => setDueOnly((v) => !v)}
          aria-pressed={dueOnly}
          className={`ml-auto rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
            dueOnly
              ? "border-accent-2/50 bg-accent-2/15 text-accent-2"
              : "border-border bg-surface text-muted hover:text-text"
          }`}
        >
          ⏱ Due ({due})
        </button>
        <button
          onClick={() => {
            if (confirm("Reset your practice progress?")) {
              reset();
              resetSrs();
              resetSolvedToday();
            }
          }}
          className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:text-bad"
        >
          ↺ Reset
        </button>
      </div>

      <ol className="space-y-4">
        {visible.map((p) => {
          const st = status[p.id];
          return (
            <li key={p.id} className="card space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[0.7rem] font-bold uppercase ${
                    p.kind === "coding"
                      ? "border-accent/40 bg-accent/12 text-accent"
                      : "border-accent-2/40 bg-accent-2/12 text-accent-2"
                  }`}
                >
                  {p.kind === "coding" ? "Code" : "Design"}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[0.62rem] font-bold uppercase ${LEVEL_BADGE[p.level]}`}
                >
                  {LEVEL_LABEL[p.level]}
                </span>
                <h2 className="text-base font-bold text-white">{p.title}</h2>
                {st && (
                  <span
                    className={`ml-auto text-[0.7rem] font-bold uppercase ${
                      st === "solved" ? "text-good" : "text-warn"
                    }`}
                  >
                    {st === "solved" ? "✓ Solved" : "↻ Revisit"}
                  </span>
                )}
              </div>

              {p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[0.68rem] text-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              <RichText html={p.promptHtml} />

              <div className="space-y-2">
                {p.reveal.map((section, i) => {
                  const key = `${p.id}:${i}`;
                  const shown = open[key];
                  return (
                    <div key={key}>
                      <button
                        onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}
                        aria-expanded={!!shown}
                        className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface-2/60 px-3 py-2 text-left text-sm font-semibold text-text transition-colors hover:border-accent/40"
                      >
                        <span className="text-accent">{shown ? "▾" : "▸"}</span>
                        {section.label}
                      </button>
                      {shown && (
                        <RichText
                          html={section.html}
                          className="rounded-b-lg border border-t-0 border-border px-3.5 py-3"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => gradePrompt(p.id, "solved")}
                  className="rounded-lg bg-good/15 px-3 py-1.5 text-sm font-bold text-good transition-colors hover:bg-good/25"
                >
                  ✓ Solved it
                </button>
                <button
                  onClick={() => gradePrompt(p.id, "revisit")}
                  className="rounded-lg bg-warn/15 px-3 py-1.5 text-sm font-bold text-warn transition-colors hover:bg-warn/25"
                >
                  ↻ Revisit
                </button>
                <span className="ml-auto text-xs text-muted">
                  next: {nextLabel(srs[p.id], today)}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Chip({
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
