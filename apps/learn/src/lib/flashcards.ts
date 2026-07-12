import fs from 'fs'
import path from 'path'

const CONTENT_DIR = path.join(process.cwd(), '../../docs/react-native-senior')

/** GitHub-style anchor slug: lowercase, strip punctuation, every space → dash (not collapsed).
 *  "Xcode & Android Studio" → "xcode--android-studio" */
function githubSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s/g, '-')
}

const fileCache = new Map<string, string>()

function readContentFile(file: string): string {
  if (!fileCache.has(file)) {
    const filePath = path.join(CONTENT_DIR, file)
    // Fail the build loudly rather than emitting cards with blank answers.
    if (!fs.existsSync(filePath)) {
      throw new Error(`flashcards: content file not found: ${file}`)
    }
    fileCache.set(file, fs.readFileSync(filePath, 'utf-8'))
  }
  return fileCache.get(file)!
}

/** Extract the entry section for an anchor: from its `### Heading` to the next `##`/`###` heading. */
function extractAnswer(file: string, anchor: string): { heading: string; answer: string } {
  const content = readContentFile(file)
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^###\s+(.+)$/)
    if (!match || githubSlug(match[1].trim()) !== anchor) continue

    let end = lines.length
    for (let j = i + 1; j < lines.length; j++) {
      if (/^#{2,3}\s/.test(lines[j])) { end = j; break }
    }
    return {
      heading: match[1].trim(),
      answer: lines.slice(i + 1, end).join('\n').trim(),
    }
  }
  // A deck line pointed at an anchor that doesn't exist — fail loudly.
  throw new Error(`flashcards: anchor not found: ${file}#${anchor}`)
}

export function getAllFlashcards(): Flashcard[] {
  // Re-read from disk on every call: `next dev` is a long-running process, and a
  // stale module-level cache would keep serving old content after you edit the
  // markdown. Cleared per-call, the cache still dedupes the ~240 per-card answer
  // reads within a single deck build; it just no longer survives across requests.
  fileCache.clear()
  const content = readContentFile('flashcards.md')
  const cards: Flashcard[] = []
  let category = ''
  let theme = ''

  for (const line of content.split('\n')) {
    const h2 = line.match(/^##\s+(.+)$/)
    if (h2 && !line.startsWith('###')) { category = h2[1].trim(); continue }

    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) { theme = h3[1].trim(); continue }

    // Optional trailing `{J1, J2}` tag marks which Andersen matrix levels the row
    // appears at. Untagged rows are the original senior deck → default to S2.
    const card = line.match(/^-\s+(.+?)\s+—\s+\[answer\]\(([^#)]+)#([^)]+)\)(?:\s+\{([^}]+)\})?\s*$/)
    if (!card) continue

    const [, question, file, anchor, levelStr] = card
    const levels = levelStr
      ? levelStr.split(',').map(s => s.trim()).filter(Boolean)
      : ['S2']
    const { heading, answer } = extractAnswer(file, anchor)
    cards.push({
      id: cards.length + 1,
      category,
      theme,
      question: question.trim(),
      anchor,
      file,
      levels,
      heading: heading || anchor.replace(/-+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      answer,
    })
  }

  return cards
}

/** Derive from an already-parsed deck so a page parses the deck once, not per value. */
export function getCategories(cards: Flashcard[]): string[] {
  return [...new Set(cards.map(c => c.category))]
}

/** Andersen matrix levels present in the deck, in career order (J1 → S2). */
export function getLevels(cards: Flashcard[]): string[] {
  const order = ['J1', 'J2', 'J3', 'M1', 'M2', 'M3', 'S1', 'S2']
  const present = new Set(cards.flatMap(c => c.levels))
  return order.filter(l => present.has(l))
}

export interface Flashcard {
  id: number
  category: string
  theme: string
  question: string
  anchor: string
  file: string
  levels: string[]
  heading: string
  answer: string
}
