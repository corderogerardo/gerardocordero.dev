// Standalone validator mirroring apps/learn/src/lib/andersen-decks.ts getSpecFlashcards.
// Usage: node docs/andersen/_raw/check-deck.mjs <slug> [<slug> ...]   (no args = all built specs)
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ANDERSEN_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const githubSlug = (t) => t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s/g, '-')

function extractAnswer(content, anchor, file) {
  const lines = content.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^###\s+(.+)$/)
    if (!m || githubSlug(m[1].trim()) !== anchor) continue
    let end = lines.length
    for (let j = i + 1; j < lines.length; j++) if (/^#{2,3}\s/.test(lines[j])) { end = j; break }
    return { heading: m[1].trim(), answer: lines.slice(i + 1, end).join('\n').trim() }
  }
  throw new Error(`anchor not found: ${file}#${anchor}`)
}

function loadDeck(slug) {
  const dir = path.join(ANDERSEN_DIR, slug)
  const index = fs.readFileSync(path.join(dir, 'flashcards.md'), 'utf-8')
  const cache = new Map()
  const cards = []
  let category = '', theme = ''
  for (const line of index.split('\n')) {
    const h2 = line.match(/^##\s+(.+)$/)
    if (h2 && !line.startsWith('###')) { category = h2[1].trim(); continue }
    const h3 = line.match(/^###\s+(.+)$/)
    if (h3) { theme = h3[1].trim(); continue }
    const card = line.match(/^-\s+(.+?)\s+—\s+\[answer\]\(([^#)]+)#([^)]+)\)(?:\s+\{([^}]+)\})?\s*$/)
    if (!card) continue
    const [, question, file, anchor, levelStr] = card
    const levels = levelStr ? levelStr.split(',').map((s) => s.trim()).filter(Boolean) : ['S2']
    if (!cache.has(file)) cache.set(file, fs.readFileSync(path.join(dir, file), 'utf-8'))
    const { answer } = extractAnswer(cache.get(file), anchor, file)
    if (!answer) throw new Error(`empty answer: ${file}#${anchor} (q: ${question.slice(0,50)})`)
    cards.push({ category, theme, question, file, anchor, levels })
  }
  return cards
}

const specs = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(ANDERSEN_DIR).filter((d) => d !== '_raw' && d !== '_shared' &&
      fs.existsSync(path.join(ANDERSEN_DIR, d, 'flashcards.md')))

let fail = 0
for (const slug of specs) {
  try {
    const cards = loadDeck(slug)
    const cats = [...new Set(cards.map((c) => c.category))]
    console.log(`✅ ${slug}: ${cards.length} cards, ${cats.length} categories [${cats.join(', ')}]`)
  } catch (e) {
    fail++
    console.log(`❌ ${slug}: ${e.message}`)
  }
}
process.exit(fail ? 1 : 0)
