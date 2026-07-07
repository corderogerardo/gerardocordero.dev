// Deterministic per-quiz shuffle so the correct answer's position carries no
// signal. FNV-1a hash + LCG (portable, same as app.js).

export function choiceOrder(n: number, seedStr: string): number[] {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const idx = Array.from({ length: n }, (_, k) => k);
  for (let i = n - 1; i > 0; i--) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    const j = Math.abs(h) % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}
