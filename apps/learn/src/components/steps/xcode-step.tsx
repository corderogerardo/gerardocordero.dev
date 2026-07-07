"use client";

import { useCourseStore } from "@/stores/course-context";
import { useI18n } from "@/lib/i18n";
import { esc, mdInline } from "@/lib/markdown";
import type { XcodeStep as XcodeStepType } from "@/lib/course-data";

export default function XcodeStep({
  step,
  stepKey,
  onProgress,
}: {
  step: XcodeStepType;
  stepKey: string;
  onProgress?: () => void;
}) {
  const { t } = useI18n();
  const checks = useCourseStore((s) => s.checks);
  const done = useCourseStore((s) => s.done);
  const setCheck = useCourseStore((s) => s.setCheck);
  const setDone = useCourseStore((s) => s.setDone);
  const isDone = !!done[stepKey];

  const allChecked = step.items.every((_, ci) => checks[`${stepKey}/${ci}`]);

  const handleCheck = (ci: number, checked: boolean) => {
    setCheck(`${stepKey}/${ci}`, checked);
    const nextAll = step.items.every((_, i) =>
      i === ci ? checked : checks[`${stepKey}/${i}`],
    );
    if (nextAll && !done[stepKey]) {
      setDone(stepKey, true);
      onProgress?.();
    }
  };

  const handleSkip = () => {
    setDone(stepKey, "skip");
    onProgress?.();
  };

  return (
    <div className={`card xcode step${isDone ? " done" : ""}`}>
      <div className="card-tag">
        <span className="dot"></span>
        <span className="mono-caption">{esc(step.label || t("step.xcode.tag"))}</span>
      </div>
      {step.title && <h4>{esc(step.title)}</h4>}
      {step.intro && (
        <div
          dangerouslySetInnerHTML={{
            __html: step.intro.map((p) => `<p>${p}</p>`).join(""),
          }}
        />
      )}

      <div>
        {step.items.map((item, ci) => {
          const ck = `${stepKey}/${ci}`;
          const checked = !!checks[ck];
          return (
            <label key={ci} className={`check-item${checked ? " checked" : ""}`}>
              <input
                type="checkbox"
                checked={checked}
                disabled={isDone}
                onChange={(e) => handleCheck(ci, e.target.checked)}
              />
              <span dangerouslySetInnerHTML={{ __html: mdInline(item) }} />
            </label>
          );
        })}
      </div>

      {!isDone && (
        <button className="linkish" onClick={handleSkip}>
          {t("step.xcode.skip")}
        </button>
      )}
    </div>
  );
}
