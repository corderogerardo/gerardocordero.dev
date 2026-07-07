"use client";

import { useEffect, useRef, useState } from "react";
import { usePrepConfig } from "../config";
import { useI18n } from "../lib/i18n";
import { Input } from "./ui/input";
import {
  type AiAvailability,
  promptAvailability,
  createSession,
  streamPrompt,
} from "../lib/chrome-ai";

const PRESETS = [
  { localeKey: "ai.preset.explain", q: "Explain this like I'm a junior engineer, in 3 sentences." },
  { localeKey: "ai.preset.followup", q: "Ask me one tough follow-up interview question about this, then wait." },
  { localeKey: "ai.preset.why", q: "Why does this matter in a senior interview? One short paragraph." },
];

export function AiTutor({
  context,
  placeholder,
}: {
  context?: string;
  placeholder?: string;
}) {
  const { ai } = usePrepConfig();
  const { t, locale } = useI18n();
  const [status, setStatus] = useState<AiAvailability | "checking">("checking");
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [progress, setProgress] = useState(0);
  const sessionRef = useRef<unknown>(null);
  const ph =
    placeholder ?? (locale === "es" ? ai.placeholderEs ?? ai.placeholder : ai.placeholder);

  useEffect(() => {
    let live = true;
    promptAvailability().then((a) => live && setStatus(a));
    return () => {
      live = false;
    };
  }, []);

  async function ask(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setAnswer("");
    try {
      if (!sessionRef.current) {
        sessionRef.current = await createSession(
          { initialPrompts: [{ role: "system", content: ai.systemPrompt }] },
          (loaded) => setProgress(Math.round(loaded * 100)),
        );
        setStatus("available");
      }
      const full = context ? `Context:\n${context}\n\nTask: ${text}` : text;
      await streamPrompt(sessionRef.current, full, setAnswer);
    } catch (e) {
      console.error(e);
      setAnswer(t("ai.error"));
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking") {
    return <div className="card text-sm text-muted">{t("ai.checking")}</div>;
  }

  if (status === "unsupported" || status === "unavailable") {
    return (
      <div className="card space-y-2 text-sm">
        <p className="font-semibold text-white">{t("ai.unavailable.title")}</p>
        <p className="text-muted">
          <span dangerouslySetInnerHTML={{__html: t("ai.unavailable.body")}} />
        </p>
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-good/40 bg-good/12 px-2.5 py-0.5 text-[0.7rem] font-bold text-good">
          {t("ai.gemini")}
        </span>
        {status === "downloadable" && (
          <span className="text-xs text-muted">
            {t("ai.downloading", {pct: progress ? ` · ${progress}%` : ""})}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.localeKey}
            disabled={busy}
            onClick={() => ask(p.q)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/50 disabled:opacity-50"
          >
            {t(p.localeKey)}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              ask(input);
              setInput("");
            }
          }}
          placeholder={ph}
          disabled={busy}
          className="flex-1"
        />
        <button
          disabled={busy}
          onClick={() => {
            ask(input);
            setInput("");
          }}
          className="rounded-lg bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? t("ai.busy") : t("ai.ask")}
        </button>
      </div>

      {answer && (
        <div className="prose-body whitespace-pre-wrap rounded-lg border border-border bg-surface-2/50 px-3.5 py-3 text-sm">
          {answer}
        </div>
      )}
    </div>
  );
}
