"use client";

import { useState } from "react";
import type { Pitch } from "../types";
import { RichText } from "./rich-text";
import { Teleprompter } from "./teleprompter";
import { box } from "../lib/html";

export function Pitches({
  pitches,
  introHtml,
}: {
  pitches: Pitch[];
  introHtml: string;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = pitches.find((p) => p.id === activeId) ?? null;

  return (
    <div className="space-y-4">
      <RichText html={box("callout tip", introHtml)} />

      {pitches.map((pitch) => (
        <article key={pitch.id || pitch.num} className="card space-y-3">
          <div className="flex flex-wrap items-start gap-3">
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-accent">
                {pitch.num}
              </p>
              <h2 className="mt-0.5 text-lg font-bold text-white">
                {pitch.title}
              </h2>
              <RichText html={box("meta", pitch.metaHtml)} />
            </div>
            {pitch.scriptHtml && (
              <button
                onClick={() => setActiveId(pitch.id)}
                className="shrink-0 rounded-lg bg-gradient-to-r from-accent to-accent-2 px-3.5 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
              >
                ▶ Teleprompter
              </button>
            )}
          </div>

          <RichText
            html={pitch.scriptHtml}
            className="rounded-xl border border-border bg-surface-2/50 p-4"
          />

          {pitch.tipsHtml && <RichText html={box("callout tip", pitch.tipsHtml)} />}
        </article>
      ))}

      {active && (
        <Teleprompter
          title={active.title}
          scriptHtml={active.scriptHtml}
          onClose={() => setActiveId(null)}
        />
      )}
    </div>
  );
}
