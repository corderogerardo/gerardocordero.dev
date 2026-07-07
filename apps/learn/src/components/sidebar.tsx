"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useCourse, useCourseStore } from "@/stores/course-context";
import { useI18n } from "@/lib/i18n";
import type { Module } from "@/lib/course-data";

function modProgress(m: Module, done: Record<string, true | "help" | "skip">, reveal: Record<string, number>) {
  let total = 0;
  let completed = 0;
  for (const l of m.lessons) {
    const lid = `${m.id}/${l.id}`;
    const r = reveal[lid] ?? 1;
    total += l.steps.length;
    if (r >= l.steps.length && l.steps.every((s, i) => {
      if (s.type !== "quiz" && s.type !== "exercise" && s.type !== "xcode") return true;
      return !!done[`${lid}/${i}`];
    })) completed += l.steps.length; else completed += Math.min(r, l.steps.length);
  }
  return { total, completed };
}

export default function Sidebar() {
  const { course } = useCourse();
  const { locale } = useI18n();
  const done = useCourseStore((s) => s.done);
  const reveal = useCourseStore((s) => s.reveal);
  const [openMods, setOpenMods] = useState<Set<string>>(new Set());

  const toggleMod = useCallback((id: string) => {
    setOpenMods((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  return (
    <div id="module-list">
      {course.modules.map((m, mi) => {
        const { completed, total } = modProgress(m, done, reveal);
        const doneCount = m.lessons.filter((l) => {
          const lid = `${m.id}/${l.id}`;
          const r = reveal[lid] ?? 1;
          return r >= l.steps.length && l.steps.every((s, i) => {
            if (s.type !== "quiz" && s.type !== "exercise" && s.type !== "xcode") return true;
            return !!done[`${lid}/${i}`];
          });
        }).length;
        const isOpen = openMods.has(m.id);
        return (
          <div key={m.id} className={`mod ${isOpen ? "open" : ""}`}>
            <button className="mod-head" onClick={() => toggleMod(m.id)}>
              <span className="emoji">{m.emoji || "📘"}</span>
              <span>{String(mi).padStart(2, "0")} · {m.title}</span>
              <span className={`count ${doneCount === m.lessons.length ? "done" : ""}`}>
                {doneCount}/{m.lessons.length}
              </span>
            </button>
            <div className="mod-lessons">
              {m.lessons.map((l) => {
                const lid = `${m.id}/${l.id}`;
                const r = reveal[lid] ?? 1;
                const complete = r >= l.steps.length && l.steps.every((s, i) => {
                  if (s.type !== "quiz" && s.type !== "exercise" && s.type !== "xcode") return true;
                  return !!done[`${lid}/${i}`];
                });
                return (
                  <Link
                    key={l.id}
                    href={`/${locale}/learn/${course.id}/${m.id}/${l.id}`}
                    className="lesson-link"
                  >
                    <span className="tick">{complete ? "✓" : ""}</span>
                    <span>{l.title}</span>
                    <span className="est">~{Math.max(2, Math.round(l.steps.length * 1.5))}m</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
