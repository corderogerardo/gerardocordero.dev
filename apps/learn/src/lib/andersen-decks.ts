import fs from 'fs'
import path from 'path'
import type { Flashcard } from './flashcards'

// Per-specialization flashcard decks generated from the Andersen knowledge matrix.
// Each spec lives in docs/andersen/<slug>/ (a flashcards.md index + content files);
// shared foundational categories (JS, engineering, processes) live in
// docs/andersen/_shared/ and are referenced from a spec's index via `../_shared/…`.
const ANDERSEN_DIR = path.join(process.cwd(), '../../docs/andersen')

export interface AndersenSpec {
  slug: string
  title: string
  emoji: string
}

// Registered specs — add one line per spec as its deck lands.
export const ANDERSEN_SPECS: AndersenSpec[] = [
  { slug: 'react', title: 'React', emoji: '⚛️' },
]

function githubSlug(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s/g, '-')
}

function readFile(specDir: string, file: string): string {
  const filePath = path.join(specDir, file)
  if (!fs.existsSync(filePath)) {
    throw new Error(`andersen deck: content file not found: ${file}`)
  }
  return fs.readFileSync(filePath, 'utf-8')
}

function extractAnswer(content: string, anchor: string, file: string): { heading: string; answer: string } {
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^###\s+(.+)$/)
    if (!m || githubSlug(m[1].trim()) !== anchor) continue
    let end = lines.length
    for (let j = i + 1; j < lines.length; j++) {
      if (/^#{2,3}\s/.test(lines[j])) { end = j; break }
    }
    return { heading: m[1].trim(), answer: lines.slice(i + 1, end).join('\n').trim() }
  }
  throw new Error(`andersen deck: anchor not found: ${file}#${anchor}`)
}

/** Specs whose deck content actually exists on disk (so a registered-but-unbuilt spec 404s). */
export function getSpecs(): AndersenSpec[] {
  return ANDERSEN_SPECS.filter((s) => fs.existsSync(path.join(ANDERSEN_DIR, s.slug, 'flashcards.md')))
}

export function getSpecMeta(slug: string): AndersenSpec | undefined {
  return getSpecs().find((s) => s.slug === slug)
}

export function getSpecFlashcards(slug: string): Flashcard[] {
  const specDir = path.join(ANDERSEN_DIR, slug)
  const index = readFile(specDir, 'flashcards.md')
  const cache = new Map<string, string>()
  const cards: Flashcard[] = []
  let category = ''
  let theme = ''

  for (const line of index.split('\n')) {
    const h2 = line.match(/^##\s+(.+)$/)
    if (h2 && !line.startsWith('###')) { category = h2[1].trim(); continue }

    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) { theme = h3[1].trim(); continue }

    const card = line.match(/^-\s+(.+?)\s+—\s+\[answer\]\(([^#)]+)#([^)]+)\)(?:\s+\{([^}]+)\})?\s*$/)
    if (!card) continue

    const [, question, file, anchor, levelStr] = card
    const levels = levelStr ? levelStr.split(',').map((s) => s.trim()).filter(Boolean) : ['S2']
    if (!cache.has(file)) cache.set(file, readFile(specDir, file))
    const { heading, answer } = extractAnswer(cache.get(file)!, anchor, file)
    cards.push({
      id: cards.length + 1,
      category,
      theme,
      question: question.trim(),
      anchor,
      file,
      levels,
      heading,
      answer,
    })
  }
  return cards
}

export function getSpecCategories(slug: string): string[] {
  return [...new Set(getSpecFlashcards(slug).map((c) => c.category))]
}

export function getSpecLevels(slug: string): string[] {
  const order = ['J1', 'J2', 'J3', 'M1', 'M2', 'M3', 'S1', 'S2']
  const present = new Set(getSpecFlashcards(slug).flatMap((c) => c.levels))
  return order.filter((l) => present.has(l))
}
