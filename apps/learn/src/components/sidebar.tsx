"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCourse, useCourseStore } from "@/stores/course-context";
import { useI18n } from "@/lib/i18n";

export default function Sidebar() {
  const { course } = useCourse();
  const { locale } = useI18n();
  const pathname = usePathname();
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

  const isLessonActive = useCallback(
    (moduleId: string, lessonId: string) => {
      return pathname === `/${locale}/learn/${course.id}/${moduleId}/${lessonId}`;
    },
    [pathname, locale, course.id],
  );

  return (
    <nav id="module-list" aria-label="Course modules">
      {course.modules.map((m, mi) => {
        const doneCount = m.lessons.filter((l) => {
          const lid = `${m.id}/${l.id}`;
          const r = reveal[lid] ?? 1;
          return r >= l.steps.length && l.steps.every((s, i) => {
            if (s.type !== "quiz" && s.type !== "exercise" && s.type !== "xcode") return true;
            return !!done[`${lid}/${i}`];
          });
        }).length;
        const isOpen = openMods.has(m.id);
        const moduleListId = `module-${m.id}-lessons`;
        return (
          <div key={m.id} className={`mod ${isOpen ? "open" : ""}`}>
            <button
              className="mod-head"
              onClick={() => toggleMod(m.id)}
              aria-expanded={isOpen}
              aria-controls={moduleListId}
              id={`module-${m.id}-toggle`}
            >
              <span className="emoji" aria-hidden="true">{m.emoji || "📘"}</span>
              <span>{String(mi).padStart(2, "0")} · {m.title}</span>
              <span className={`count ${doneCount === m.lessons.length ? "done" : ""}`}>
                {doneCount}/{m.lessons.length}
              </span>
            </button>
            <div
              id={moduleListId}
              className="mod-lessons"
              role="list"
              aria-label={`${m.title} lessons`}
            >
              {m.lessons.map((l) => {
                const lid = `${m.id}/${l.id}`;
                const r = reveal[lid] ?? 1;
                const complete = r >= l.steps.length && l.steps.every((s, i) => {
                  if (s.type !== "quiz" && s.type !== "exercise" && s.type !== "xcode") return true;
                  return !!done[`${lid}/${i}`];
                });
                const isActive = isLessonActive(m.id, l.id);
                return (
                  <Link
                    key={l.id}
                    href={`/${locale}/learn/${course.id}/${m.id}/${l.id}`}
                    className="lesson-link"
                    aria-current={isActive ? "page" : undefined}
                    aria-label={`${l.title}${complete ? ", completed" : ""}${isActive ? ", current" : ""}`}
                  >
                    <span className="tick" aria-hidden="true">{complete ? "✓" : ""}</span>
                    <span>{l.title}</span>
                    <span className="est">~{Math.max(2, Math.round(l.steps.length * 1.5))}m</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
