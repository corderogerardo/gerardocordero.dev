"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { CourseProvider } from "@/stores/course-context";
import Sidebar from "@/components/sidebar";
import SearchInput from "@/components/search-input";
import OverallProgress from "@/components/overall-progress";
import LanguageSwitcher from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";
import type { Course } from "@/lib/course-data";

function LearnShellContent({ course, children }: { course: Course; children: ReactNode }) {
  const { t, locale: currentLocale } = useI18n();
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggle = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    if (confirm(t("sidebar.reset.confirm"))) {
      localStorage.setItem(course.storeKey, "{}");
      location.reload();
    }
  }, [course.storeKey, t]);

  const handleExport = useCallback(() => {
    const raw = localStorage.getItem(course.storeKey) || "{}";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
    a.download = `${course.id}-progress.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [course.storeKey, course.id]);

  const handleImport = useCallback(() => {
    const input = document.getElementById("import-input") as HTMLInputElement;
    if (input) {
      input.value = "";
      input.click();
    }
  }, []);

  useEffect(() => {
    const input = document.getElementById("import-input") as HTMLInputElement;
    if (!input) return;

    const handleChange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const parsed = JSON.parse(await file.text());
        if (typeof parsed !== "object" || !parsed) throw new Error("not an object");
        if (confirm("Replace current progress with the imported file?")) {
          localStorage.setItem(course.storeKey, JSON.stringify(parsed));
          location.reload();
        }
      } catch {
        alert("Not a valid progress file.");
      }
    };

    input.addEventListener("change", handleChange);
    return () => input.removeEventListener("change", handleChange);
  }, [course.storeKey]);

  return (
    <>
      <button
        id="menu-toggle"
        ref={menuToggleRef}
        className="menu-toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        aria-controls="sidebar"
        onClick={handleToggle}
      >
        <span aria-hidden="true">☰</span>
      </button>
      <div className="layout">
        <nav id="sidebar" aria-label="Course navigation">
          <header>
            <a href={`/${currentLocale}/learn/${course.id}`}>
              <span className="brand-emoji" aria-hidden="true">{course.emoji}</span>
              <span className="brand-title">{t("sidebar.brand")}</span>
              <span className="brand-sub mono-caption">{course.title}</span>
            </a>
          </header>

          <div className="side-lang-row">
            <LanguageSwitcher />
          </div>

          <OverallProgress />
          <SearchInput />
          <Sidebar />

          <div className="side-foot">
            <button className="ghost" onClick={handleExport}>
              {t("sidebar.export")}
            </button>
            <button className="ghost" onClick={handleImport}>
              {t("sidebar.import")}
            </button>
            <button id="reset-progress" className="ghost" onClick={handleReset}>
              {t("sidebar.reset")}
            </button>
            <input type="file" id="import-input" accept="application/json" style={{ display: "none" }} />
          </div>
        </nav>

        <main id="content">{children}</main>
      </div>
    </>
  );
}

export default function LearnShell({ course, children }: { course: Course; children: ReactNode }) {
  return (
    <CourseProvider course={course}>
      <LearnShellContent course={course}>{children}</LearnShellContent>
    </CourseProvider>
  );
}
