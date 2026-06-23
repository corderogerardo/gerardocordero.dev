"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function fmt(total: number) {
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = (total % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function Teleprompter({
  title,
  scriptHtml,
  onClose,
}: {
  title: string;
  scriptHtml: string;
  onClose: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1.1);
  const [font, setFont] = useState(2.2);
  const [seconds, setSeconds] = useState(0);

  const reset = useCallback(() => {
    setRunning(false);
    setSeconds(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  // auto-scroll loop (UI-thread rAF), pauses at the end
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let acc = 0;
    const step = () => {
      const el = scrollRef.current;
      if (!el) return;
      acc += speed;
      if (acc >= 1) {
        el.scrollTop += Math.floor(acc);
        acc -= Math.floor(acc);
      }
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
        setRunning(false);
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [running, speed]);

  // timer
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // keyboard + scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setRunning((r) => !r);
      } else if (e.code === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg/95 backdrop-blur">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <h2 className="truncate font-bold text-white">{title}</h2>
        <span className="font-mono text-sm text-accent">{fmt(seconds)}</span>
        <button
          onClick={onClose}
          className="ml-auto rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:text-text"
        >
          ✕ Close
        </button>
      </div>

      <div
        ref={scrollRef}
        className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-6 py-[40vh] text-center [&_p]:mb-6"
        style={{ fontSize: `${font}rem`, lineHeight: 1.5 }}
        dangerouslySetInnerHTML={{ __html: scriptHtml }}
      />

      <div className="flex flex-wrap items-center justify-center gap-2 border-t border-border px-4 py-3">
        <Ctrl onClick={() => setRunning((r) => !r)} primary>
          {running ? "⏸ Pause" : "▶ Play"}
        </Ctrl>
        <Ctrl onClick={reset}>↺ Reset</Ctrl>
        <Ctrl onClick={() => setSpeed((s) => Math.max(0.3, +(s - 0.3).toFixed(2)))}>
          – Slower
        </Ctrl>
        <Ctrl onClick={() => setSpeed((s) => +(s + 0.3).toFixed(2))}>
          + Faster
        </Ctrl>
        <Ctrl onClick={() => setFont((f) => Math.max(1.2, +(f - 0.3).toFixed(2)))}>
          A−
        </Ctrl>
        <Ctrl onClick={() => setFont((f) => Math.min(4, +(f + 0.3).toFixed(2)))}>
          A+
        </Ctrl>
        <span className="ml-1 hidden text-xs text-muted sm:inline">
          Space = play/pause · Esc = close
        </span>
      </div>
    </div>
  );
}

function Ctrl({
  onClick,
  children,
  primary,
}: {
  onClick: () => void;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
        primary
          ? "bg-gradient-to-r from-accent to-accent-2 text-bg"
          : "border border-border bg-surface text-text hover:border-accent/50"
      }`}
    >
      {children}
    </button>
  );
}
