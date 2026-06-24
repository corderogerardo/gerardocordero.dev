// Subject registry — the single place that wires content into the engine.
//
// ▸ To add a new subject (Android, Python, Go, system design, …):
//     1. create src/study/content/<id>.ts exporting a `Subject`
//     2. import it here and add it to SUBJECTS
//   That's it — the picker, filters, SRS, streak, and stats all pick it up.
import type { Category, Subject } from "./types";
import { reactNativeSubject } from "./content/react-native";
import { iosSubject } from "./content/ios";

export const SUBJECTS: Subject[] = [reactNativeSubject, iosSubject];

export function subjectById(id: string): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

/** Categories for a subject, derived from card order (no hand-kept list to drift). */
export function subjectCategories(subject: Subject): Category[] {
  const seen = new Map<string, string>();
  for (const c of subject.cards) {
    if (!seen.has(c.category)) seen.set(c.category, c.categoryLabel);
  }
  return [
    { value: "all", label: "All" },
    ...[...seen.entries()].map(([value, label]) => ({ value, label })),
  ];
}

/** Card ids for a subject, optionally narrowed to one category ("all" = no filter). */
export function cardIds(subject: Subject, category = "all"): string[] {
  return subject.cards
    .filter((c) => category === "all" || c.category === category)
    .map((c) => c.id);
}

export const ALL_CARDS = SUBJECTS.flatMap((s) => s.cards);
export const TOTAL_CARDS = ALL_CARDS.length;
