"use client";

import { useEffect, useRef, useState } from "react";
import {
  type AiAvailability,
  promptAvailability,
  createSession,
  streamPrompt,
} from "@/lib/chrome-ai";

const SYSTEM =
  "You are a concise, encouraging senior React Native interview coach. Answer in a few short sentences or a tight list. Be accurate and practical.";

const PRESETS = [
  { label: "Explain simply", q: "Explain this like I'm a junior engineer, in 3 sentences." },
  { label: "Follow-up Q", q: "Ask me one tough follow-up interview question about this, then wait." },
  { label: "Why it matters", q: "Why does this matter in a senior interview? One short paragraph." },
];

export function AiTutor({
  context,
  placeholder = "Ask anything about React Native interviews…",
}: {
  context?: string;
  placeholder?: string;
}) {
  const [status, setStatus] = useState<AiAvailability | "checking">("checking");
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const sessionRef = useRef<unknown>(null);

  useEffect(() => {
    let live = true;
    promptAvailability().then((a) => {
      if (!live) return;
      setStatus(a);
      // Gemini Nano may already be mid-download when the page loads.
      if (a === "downloading") setDownloading(true);
    });
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
        // The first create() may download a multi-hundred-MB model. create()
        // blocks until that finishes, so flag it and surface progress instead
        // of leaving the user on a silent spinner.
        if (status === "downloadable" || status === "downloading") {
          setDownloading(true);
        }
        sessionRef.current = await createSession(
          { initialPrompts: [{ role: "system", content: SYSTEM }] },
          (loaded) => setProgress(Math.round(loaded * 100)),
        );
        setDownloading(false);
        setStatus("available");
      }
      const full = context ? `Context:\n${context}\n\nTask: ${text}` : text;
      await streamPrompt(sessionRef.current, full, setAnswer);
    } catch (e) {
      console.error(e);
      setDownloading(false);
      setAnswer(
        "Sorry — the on-device model couldn't respond. It may still be downloading, or this device isn't supported.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (status === "checking") {
    return <div className="card text-sm text-muted">Checking for on-device AI…</div>;
  }

  if (status === "unsupported" || status === "unavailable") {
    return (
      <div className="card space-y-2 text-sm">
        <p className="font-semibold text-white">
          On-device AI tutor isn&apos;t available in this browser.
        </p>
        <p className="text-muted">
          It uses Chrome&apos;s built-in <b>Prompt API</b> (Gemini Nano), which
          runs the model fully on your device — no key, no cloud. It needs a
          recent <b>desktop Chrome</b> with supported hardware. The{" "}
          <b className="text-accent">AI semantic search</b> above works in any
          modern browser.
        </p>
      </div>
    );
  }

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-good/40 bg-good/12 px-2.5 py-0.5 text-[0.7rem] font-bold text-good">
          ● On-device · Gemini Nano
        </span>
        {downloading || status === "downloading" ? (
          <span className="text-xs text-muted">
            ⬇ Downloading Gemini Nano (one-time){progress ? ` · ${progress}%` : "…"}
          </span>
        ) : (
          status === "downloadable" && (
            <span className="text-xs text-muted">
              first question downloads the model
            </span>
          )
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            disabled={busy}
            onClick={() => ask(p.q)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm font-medium text-text transition-colors hover:border-accent/50 disabled:opacity-50"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              ask(input);
              setInput("");
            }
          }}
          placeholder={placeholder}
          disabled={busy}
          className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text outline-none placeholder:text-muted focus:border-accent/60"
        />
        <button
          disabled={busy}
          onClick={() => {
            ask(input);
            setInput("");
          }}
          className="rounded-lg bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "…" : "Ask"}
        </button>
      </div>

      {busy && !answer && (
        <div className="prose-body rounded-lg border border-border bg-surface-2/50 px-3.5 py-3 text-sm text-muted">
          {downloading
            ? `Downloading Gemini Nano to your device — a one-time setup that can take a few minutes${progress ? ` · ${progress}%` : ""}. Your answer streams in as soon as the model is ready.`
            : "Thinking…"}
        </div>
      )}

      {answer && (
        <div className="prose-body whitespace-pre-wrap rounded-lg border border-border bg-surface-2/50 px-3.5 py-3 text-sm">
          {answer}
        </div>
      )}
    </div>
  );
}
