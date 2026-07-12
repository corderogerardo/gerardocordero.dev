"use client";

import { type ReactNode, useEffect, useRef } from "react";
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
  const resetRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const toggle = menuToggleRef.current;
    const reset = resetRef.current;
    if (!toggle || !reset) return;

    const handleToggle = () => document.body.classList.toggle("menu-open");
    toggle.addEventListener("click", handleToggle);

    const handleReset = () => {
      if (confirm(t("sidebar.reset.confirm"))) {
        localStorage.setItem(course.storeKey, "{}");
        location.reload();
      }
    };
    reset.addEventListener("click", handleReset);

    return () => {
      toggle.removeEventListener("click", handleToggle);
      reset.removeEventListener("click", handleReset);
    };
  }, [course.storeKey, t]);

  return (
    <>
      <button id="menu-toggle" ref={menuToggleRef}>☰</button>
      <div className="layout">
      <nav id="sidebar">
        <header>
          <a href={`/${currentLocale}/learn/${course.id}`}>
            <span className="brand-emoji">{course.emoji}</span>
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
          <button className="ghost" onClick={exportProgress}>{t("sidebar.export")}</button>
          <button className="ghost" onClick={importProgress}>{t("sidebar.import")}</button>
          <button id="reset-progress" ref={resetRef}>{t("sidebar.reset")}</button>
          <input type="file" id="import-input" accept="application/json" style={{ display: "none" }} />
        </div>
      </nav>

      <main id="content">{children}</main>
      </div>
    </>
  );
}

function exportProgress() {
  const raw = localStorage.getItem(
    document.querySelector<HTMLButtonElement>("#reset-progress")?.dataset.storeKey || "pawwalk-academy-ios-v1",
  ) || "{}";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([raw], { type: "application/json" }));
  a.download = `${location.pathname.split("/")[2]}-progress.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function importProgress() {
  const input = document.getElementById("import-input") as HTMLInputElement;
  input.value = "";
  input.click();
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      if (typeof parsed !== "object" || !parsed) throw new Error("not an object");
      if (confirm("Replace current progress with the imported file?")) {
        const storeKey =
          document.querySelector<HTMLButtonElement>("#reset-progress")?.dataset.storeKey || "pawwalk-academy-ios-v1";
        localStorage.setItem(storeKey, JSON.stringify(parsed));
        location.reload();
      }
    } catch {
      alert("Not a valid progress file.");
    }
  };
}

export default function LearnShell({ course, locale, children }: { course: Course; locale?: string; children: ReactNode }) {
  return (
    <CourseProvider course={course}>
      <LearnShellContent course={course}>{children}</LearnShellContent>
    </CourseProvider>
  );
}
