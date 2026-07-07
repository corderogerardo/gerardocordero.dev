"use client";

import { md } from "@/lib/markdown";
import type { TextStep as TextStepType } from "@/lib/course-data";

export default function TextStep({ step }: { step: TextStepType }) {
  return <div className="step" dangerouslySetInnerHTML={{ __html: md(step.md) }} />;
}
