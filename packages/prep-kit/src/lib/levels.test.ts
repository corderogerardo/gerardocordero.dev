// Pins the shared level taxonomy. prep-kit renders it in the flashcard/prompt
// decks and every *-prep app re-exports it for its roadmap, so a change to any
// value here is a visible change on five sites at once.
import {
  LEVELS,
  LEVEL_BADGE,
  LEVEL_LABEL,
  LEVEL_LABEL_ES,
  LEVEL_LOCALE_KEY,
} from "./levels";
import en from "../locales/en.json";
import es from "../locales/es.json";

describe("level taxonomy", () => {
  it("keeps the five levels in their canonical order", () => {
    expect(LEVELS.map((level) => level.value)).toEqual([
      "junior",
      "mid",
      "senior",
      "architect",
      "beyond",
    ]);
  });

  it("exposes the English display labels", () => {
    expect(LEVEL_LABEL).toEqual({
      junior: "Junior",
      mid: "Mid",
      senior: "Senior",
      architect: "Architect",
      beyond: "Beyond",
    });
  });

  it("exposes the Spanish display labels", () => {
    expect(LEVEL_LABEL_ES).toEqual({
      junior: "Junior",
      mid: "Mid",
      senior: "Senior",
      architect: "Arquitecto",
      beyond: "Beyond",
    });
  });

  it("exposes one i18n key per level", () => {
    expect(LEVEL_LOCALE_KEY).toEqual({
      junior: "level.junior",
      mid: "level.mid",
      senior: "level.senior",
      architect: "level.architect",
      beyond: "level.beyond",
    });
  });

  it("keeps the short badges", () => {
    expect(LEVELS.map((level) => level.short)).toEqual([
      "JR",
      "MID",
      "SR",
      "ARCH",
      "★",
    ]);
  });

  it("keeps the badge classes", () => {
    expect(LEVEL_BADGE).toEqual({
      junior: "border-good/40 bg-good/12 text-good",
      mid: "border-accent/40 bg-accent/12 text-accent",
      senior: "border-warn/40 bg-warn/12 text-warn",
      architect: "border-accent-2/40 bg-accent-2/12 text-accent-2",
      beyond: "border-bad/40 bg-bad/12 text-bad",
    });
  });

  it("keeps LEVELS agreeing with the label and key maps", () => {
    for (const level of LEVELS) {
      expect(level.label).toBe(LEVEL_LABEL[level.value]);
      expect(level.labelEs).toBe(LEVEL_LABEL_ES[level.value]);
      expect(level.localeKey).toBe(LEVEL_LOCALE_KEY[level.value]);
    }
  });

  // `t()` falls back to echoing the key when a translation is missing, so the
  // only meaningful check is that both dictionaries define every key.
  it.each(LEVELS.map((level) => [level.value, level.localeKey] as const))(
    "translates the %s label in both locales",
    (_value, localeKey) => {
      expect(en[localeKey as keyof typeof en]).toEqual(expect.any(String));
      expect(en[localeKey as keyof typeof en].length).toBeGreaterThan(0);
      expect(es[localeKey as keyof typeof es]).toEqual(expect.any(String));
      expect(es[localeKey as keyof typeof es].length).toBeGreaterThan(0);
    },
  );
});
