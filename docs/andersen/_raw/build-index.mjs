// Builds a spec's flashcards.md index from the content files the authors wrote.
// Bridge for partial decks (agents write content first, index last); safe to re-run —
// regenerates the index from whatever ### cards currently exist.
// Usage: node docs/andersen/_raw/build-index.mjs <slug> [<slug> ...]
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ANDERSEN_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const githubSlug = (t) => t.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s/g, '-')

const ACRONYMS = { api: 'API', cicd: 'CI/CD', iac: 'IaC', k8s: 'K8s', ui: 'UI', sql: 'SQL',
  oop: 'OOP', jvm: 'JVM', ios: 'iOS', js: 'JS', nosql: 'NoSQL', orm: 'ORM', http: 'HTTP',
  drf: 'DRF', mvi: 'MVI', mvvm: 'MVVM' }
const humanize = (file) => file.replace(/\.md$/, '').split('-')
  .map((w) => ACRONYMS[w.toLowerCase()] || w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

// Display title per spec. Files within a spec are emitted in alphabetical order.
const TITLES = { react: 'React', node: 'Node.js', go: 'Go', python: 'Python', android: 'Android',
  ios: 'iOS', devops: 'DevOps', 'business-analyst': 'Business Analyst', 'system-analyst': 'System Analyst' }

function extractCards(md) {
  const lines = md.split('\n')
  const cards = []
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^###\s+(.+)$/)
    if (!h) continue
    const heading = h[1].trim()
    // find the They-ask question in the next few lines
    let q = heading
    for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
      if (/^#{2,3}\s/.test(lines[j])) break
      const ask = lines[j].match(/\*\*They ask:\*\*\s*[""]?(.+?)[""]?\s*$/)
      if (ask) { q = ask[1].replace(/^["""]|["""]$/g, '').trim(); break }
    }
    cards.push({ heading, anchor: githubSlug(heading), q })
  }
  return cards
}

function buildIndex(slug) {
  const dir = path.join(ANDERSEN_DIR, slug)
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'flashcards.md').sort()
  const title = TITLES[slug] || slug
  let out = `# Flashcards — ${title} (Andersen matrix)\n\nEvery matrix row as an interviewer question. Filter by level and category in the deck.\n`
  const seen = new Set()
  let total = 0
  for (const file of files) {
    const cards = extractCards(fs.readFileSync(path.join(dir, file), 'utf-8'))
    if (!cards.length) continue
    const cat = humanize(file)
    out += `\n## ${cat}\n\n### ${cat}\n\n`
    for (const c of cards) {
      const key = file + '#' + c.anchor
      if (seen.has(key)) continue // dup anchor in same file → skip (first wins, matches loader)
      seen.add(key)
      out += `- ${c.q} — [answer](${file}#${c.anchor})\n`
      total++
    }
  }
  fs.writeFileSync(path.join(dir, 'flashcards.md'), out)
  return { total, files: files.length }
}

const specs = process.argv.slice(2)
if (!specs.length) { console.error('usage: build-index.mjs <slug> ...'); process.exit(1) }
for (const slug of specs) {
  const r = buildIndex(slug)
  console.log(`${slug}: index built — ${r.total} cards from ${r.files} files`)
}
