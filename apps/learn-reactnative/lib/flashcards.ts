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
    fileCache.set(file, fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '')
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
  return { heading: '', answer: '' }
}

export function getAllFlashcards(): Flashcard[] {
  const content = readContentFile('flashcards.md')
  const cards: Flashcard[] = []
  let category = ''
  let theme = ''

  for (const line of content.split('\n')) {
    const h2 = line.match(/^##\s+(.+)$/)
    if (h2 && !line.startsWith('###')) { category = h2[1].trim(); continue }

    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) { theme = h3[1].trim(); continue }

    const card = line.match(/^-\s+(.+)\s+—\s+\[answer\]\(([^#)]+)#([^)]+)\)\s*$/)
    if (!card) continue

    const [, question, file, anchor] = card
    const { heading, answer } = extractAnswer(file, anchor)
    cards.push({
      id: cards.length + 1,
      category,
      theme,
      question: question.trim(),
      anchor,
      file,
      heading: heading || anchor.replace(/-+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      answer,
    })
  }

  return cards
}

export function getCategories(): string[] {
  return [...new Set(getAllFlashcards().map(c => c.category))]
}

export interface Flashcard {
  id: number
  category: string
  theme: string
  question: string
  anchor: string
  file: string
  heading: string
  answer: string
}
