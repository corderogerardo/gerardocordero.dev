// Integrity checks for the study content + registry. These guard the scaling
// contract: every subject's cards are well-formed, ids are globally unique, and the
// content stays RN-renderable (no HTML / leftover entities).
import {
  ALL_CARDS,
  cardIds,
  SUBJECTS,
  subjectCategories,
} from "../src/study/registry";
import { tokenize } from "../src/study/rich";

const LEVELS = new Set(["junior", "mid", "senior", "architect", "beyond"]);
// Real HTML block/inline tags we must never see (note: `<Stack>`, `Array<T>` etc.
// are legitimate code and are intentionally NOT in this list).
const HTML_TAG = /<\/?(div|span|p|ul|ol|li|code|b|i|em|strong|table|tr|td|th|br|h[1-6])\b/i;
const ENTITY = /&(amp|lt|gt|quot|#0?39|apos|nbsp);/i;

describe("study registry", () => {
  it("registers at least React Native and iOS", () => {
    const ids = SUBJECTS.map((s) => s.id);
    expect(ids).toEqual(expect.arrayContaining(["react-native", "ios"]));
  });

  it("has a non-trivial corpus", () => {
    expect(ALL_CARDS.length).toBeGreaterThan(40);
  });

  it("has globally unique card ids", () => {
    const ids = ALL_CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("derives a category list led by 'all' for every subject", () => {
    for (const s of SUBJECTS) {
      const cats = subjectCategories(s);
      expect(cats[0]).toEqual({ value: "all", label: "All" });
      expect(cats.length).toBeGreaterThan(1);
      // cardIds('all') covers the whole deck
      expect(cardIds(s, "all").length).toBe(s.cards.length);
    }
  });
});

describe("study cards", () => {
  it("every card is well-formed and RN-renderable", () => {
    for (const c of ALL_CARDS) {
      expect(c.id.trim().length).toBeGreaterThan(0);
      expect(c.category.trim().length).toBeGreaterThan(0);
      expect(c.categoryLabel.trim().length).toBeGreaterThan(0);
      expect(c.question.trim().length).toBeGreaterThan(0);
      expect(c.answer.trim().length).toBeGreaterThan(0);
      if (c.level) expect(LEVELS.has(c.level)).toBe(true);

      for (const field of [c.question, c.answer]) {
        expect(field).not.toMatch(HTML_TAG);
        expect(field).not.toMatch(ENTITY);
      }
    }
  });
});

describe("rich.tokenize", () => {
  it("splits plain, code, and bold runs", () => {
    const segs = tokenize("use `useMemo` for **stable** props");
    expect(segs.find((s) => s.code)?.text).toBe("useMemo");
    expect(segs.find((s) => s.bold)?.text).toBe("stable");
    expect(segs.map((s) => s.text).join("")).toBe(
      "use useMemo for stable props",
    );
  });

  it("returns a single plain segment when there is no markup", () => {
    expect(tokenize("just text")).toEqual([{ text: "just text" }]);
  });
});
