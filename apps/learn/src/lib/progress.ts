export const FLASHCARD_PROGRESS_KEY = 'rn-s2-flashcard-progress'
export const CHALLENGE_PROGRESS_KEY = 'rn-s2-challenge-progress'

export function loadProgress<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveProgress(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — progress just won't persist
  }
}

export function clearProgress(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {}
}
