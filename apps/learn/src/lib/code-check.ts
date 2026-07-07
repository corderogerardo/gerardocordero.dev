// Code normalization + regex-based checking.
// Keep in sync with tools/validate.mjs (same normalize logic).

import { deserializeRe } from "./regexp";

export type LangId = "swift" | "python" | "kotlin" | "ruby" | "go";

export interface CheckRule {
  re: unknown;
  hint: string;
}

export interface CheckResult {
  pass: boolean;
  hint?: string;
}

export function normalize(code: string, lang: LangId): string {
  const stripped =
    lang === "python"
      ? code.replace(/#[^\n]*/g, " ")
      : lang === "ruby"
        ? code.replace(/#(?!\{)[^\n]*/g, " ")
        : code.replace(/\/\/[^\n]*/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ");
  return stripped
    .replace(/\s+/g, " ")
    .replace(/\s*([^\w\s])\s*/g, "$1")
    .trim();
}

export function runChecks(
  step: { checks?: CheckRule[]; mustNot?: CheckRule[] },
  code: string,
  lang: LangId,
): CheckResult {
  const n = normalize(code, lang);
  for (const rule of step.mustNot || []) {
    if (deserializeRe(rule.re).test(n)) return { pass: false, hint: rule.hint };
  }
  for (const rule of step.checks || []) {
    if (!deserializeRe(rule.re).test(n)) return { pass: false, hint: rule.hint };
  }
  return { pass: true };
}
