"use client";

import type { CodeStep as CodeStepType, LangId } from "@/lib/course-data";
import CodeBlock from "@/components/code-block";

export default function CodeStep({ step }: { step: CodeStepType }) {
  const lang: LangId = step.lang ?? "swift";
  return (
    <div className="step">
      <CodeBlock source={step.source} title={step.title} lang={lang} />
      {step.caption && <p dangerouslySetInnerHTML={{ __html: step.caption }} />}
    </div>
  );
}
