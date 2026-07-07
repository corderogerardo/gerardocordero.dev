"use client";

import { useRef, useState } from "react";
import { usePrepConfig } from "../config";
import { useI18n } from "../lib/i18n";

export function ProgressTools() {
  const { storagePrefix, appId } = usePrepConfig();
  const { t } = useI18n();
  const prefix = `${storagePrefix}:`;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function collect(): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          out[key] = JSON.parse(localStorage.getItem(key) as string);
        } catch {
          out[key] = localStorage.getItem(key);
        }
      }
    }
    return out;
  }

  function exportProgress() {
    const data = { app: appId, version: 1, data: collect() };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appId}-progress.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMsg(t("progress.tools.exported"));
  }

  function importProgress(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const data = parsed?.data ?? parsed;
        let n = 0;
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith(prefix)) {
            localStorage.setItem(key, JSON.stringify(value));
            n++;
          }
        }
        setMsg(t("progress.tools.imported", {n}));
        setTimeout(() => window.location.reload(), 600);
      } catch {
        setMsg(t("progress.tools.invalid"));
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="card space-y-3">
      <div>
        <h2 className="font-bold text-white">{t("progress.tools.title")}</h2>
        <p className="mt-1 text-sm text-muted">
          {t("progress.tools.body")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={exportProgress}
          className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-text transition-colors hover:border-accent/50"
        >
          {t("progress.tools.export")}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-border bg-surface px-3.5 py-2 text-sm font-semibold text-text transition-colors hover:border-accent/50"
        >
          {t("progress.tools.import")}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) importProgress(f);
            e.target.value = "";
          }}
        />
      </div>
      {msg && <p className="text-xs text-accent-2">{msg}</p>}
    </div>
  );
}
