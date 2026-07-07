"use client";

import { useState, useCallback, useRef } from "react";
import { useCourseStore } from "@/stores/course-context";
import { useI18n } from "@/lib/i18n";
import { runChecks } from "@/lib/code-check";
import type { ExerciseStep as ExerciseStepType, LangId } from "@/lib/course-data";
import CodeBlock from "@/components/code-block";
import { runCode } from "@/lib/code-runner";

export default function ExerciseStep({
  step,
  stepKey,
  onProgress,
}: {
  step: ExerciseStepType;
  stepKey: string;
  onProgress?: () => void;
}) {
  const { t } = useI18n();
  const code = useCourseStore((s) => s.code);
  const done = useCourseStore((s) => s.done);
  const setCode = useCourseStore((s) => s.setCode);
  const setDone = useCourseStore((s) => s.setDone);
  const isDone = !!done[stepKey];
  const lang: LangId = step.lang ?? "swift";
  const [fails, setFails] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<"ok" | "bad" | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const runOutRef = useRef<HTMLPreElement>(null);

  const val = (code[stepKey] ?? step.starter ?? "") as string;

  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCode(stepKey, e.target.value);
    },
    [setCode, stepKey],
  );

  const handleCheck = useCallback(() => {
    const result = runChecks(step, val, lang);
    if (result.pass) {
      setFeedback(result.hint || step.success || t("step.exercise.success"));
      setFeedbackType("ok");
      setDone(stepKey, showSolution ? "help" : true);
      onProgress?.();
    } else {
      const newFails = fails + 1;
      setFails(newFails);
      setFeedback(result.hint || t("step.exercise.fail"));
      setFeedbackType("bad");
    }
  }, [step, val, lang, fails, showSolution, setDone, stepKey, onProgress, t]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart, selectionEnd } = ta;
      const next = ta.value.slice(0, selectionStart) + "    " + ta.value.slice(selectionEnd);
      setCode(stepKey, next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 4;
      });
    } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleCheck();
    }
  }, [handleCheck, setCode, stepKey]);

  const handleReset = useCallback(() => {
    setCode(stepKey, step.starter ?? "");
    setFeedback(null);
    setFeedbackType(null);
    setFails(0);
  }, [setCode, stepKey, step.starter]);

  const handleRun = useCallback(async () => {
    if (!runOutRef.current) return;
    runOutRef.current.style.display = "";
    runOutRef.current.textContent = t("step.exercise.running");
    runOutRef.current.classList.remove("err");
    await runCode(val, lang, runOutRef.current);
  }, [val, lang, t]);

  const rows = Math.max(4, val.split("\n").length + 2);

  return (
    <div className={`card step${isDone ? " done" : ""}`}>
      <div className="card-tag">
        <span className="dot"></span>
        <span className="mono-caption">{t("step.exercise.tag")}</span>
      </div>
      {step.title && <h4>{step.title}</h4>}
      {step.prompt && (
        <div
          dangerouslySetInnerHTML={{
            __html: step.prompt.map((p) => `<p>${p}</p>`).join(""),
          }}
        />
      )}

      <textarea
        ref={editorRef}
        className="editor"
        spellCheck={false}
        value={val}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        rows={rows}
        disabled={isDone}
      />

      <div className="ex-actions">
        <button className="btn" onClick={handleCheck} disabled={isDone}>
          {t("step.exercise.check")}
        </button>
        <button className="btn secondary" onClick={handleReset} disabled={isDone}>
          {t("step.exercise.reset")}
        </button>
        {(lang === "python" || lang === "ruby") && (
          <button className="btn secondary" onClick={handleRun}>
            {t("step.exercise.run")}
          </button>
        )}
        {fails >= 2 && !showSolution && (
          <button className="linkish" onClick={() => setShowSolution(true)} style={{ display: "inline" }}>
            {t("step.exercise.stuck")}
          </button>
        )}
      </div>

      <pre ref={runOutRef} className="run-out" style={{ display: "none" }} />

      {feedback && feedbackType && (
        <div className={`feedback ${feedbackType}`}>
          {feedbackType === "ok" && <>{t("step.exercise.feedback.ok", { hint: feedback })}</>}
          {feedbackType === "bad" && <><span className="fb-label">{t("step.exercise.feedback.bad")}</span> {feedback}</>}
        </div>
      )}

      {showSolution && (
        <div className="solution-reveal">
          <CodeBlock
            source={step.solution}
            title={t("step.exercise.solution.title")}
            lang={lang}
          />
          <p dangerouslySetInnerHTML={{ __html: t("step.exercise.solution.hint") }} />
        </div>
      )}

      {isDone && (
        <div className="feedback ok">
          {done[stepKey] === "help" ? t("step.exercise.done.help") : t("step.exercise.done")}
        </div>
      )}
    </div>
  );
}
