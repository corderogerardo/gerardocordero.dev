// Minimal per-app level resolution. The shared label/badge styling lives in the
// kit; here you only map your categories to a default seniority level (cards can
// still override with an explicit `level`).
export type Level = "junior" | "mid" | "senior" | "architect" | "beyond";

const LEVEL_BY_CATEGORY: Record<string, Level> = {
  fundamentals: "mid",
  lifecycle: "senior",
  "di-providers": "senior",
  data: "senior",
  "graphql-micro": "senior",
  testing: "mid",
  security: "senior",
  "perf-observ": "architect",
};

const LEVEL_OVERRIDES: Record<string, Level> = {};

export function resolveLevel(card: {
  id: string;
  category: string;
  level?: Level;
}): Level {
  return (
    card.level ?? LEVEL_OVERRIDES[card.id] ?? LEVEL_BY_CATEGORY[card.category] ?? "senior"
  );
}
