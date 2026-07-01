# Study content sources

External reference repos and official docs used as source material when
authoring the flashcards, quiz questions, practice prompts, and study-guide
sections for this app. These are curated *inspiration and fact-checking
references* — content here is original, hand-written prose/code in
`src/data/`, not copied from these sources.

| Source | What it is | Informed |
|---|---|---|
| [vercel/next.js](https://github.com/vercel/next.js) | The official Next.js repo — release notes, RFCs, and the canonical behavior for every API referenced in this guide. | Fact-checking every Next.js 16.2 / React 19.2 claim across `study.ts`, `flashcards.ts`, `quiz.ts`, and `architecture.ts` — Cache Components, `proxy.ts`, async request APIs, `revalidateTag`/`updateTag`/`refresh`. |
| [nextjs.org/docs](https://nextjs.org/docs) (App Router) | The official Next.js documentation. | The App Router mental model, Server/Client Component composition, caching model (`study.ts` sections 01–17), and Route Handler/metadata coverage. |
| [bytefer/awesome-nextjs](https://github.com/bytefer/awesome-nextjs) | Curated list of Next.js libraries, tools, and learning resources. | Scoping which ecosystem topics (auth libraries, state management, testing tools) belong in the `auth`/`testing`/architecture coverage. |
| [unicodeveloper/awesome-nextjs](https://github.com/unicodeveloper/awesome-nextjs) | Curated list of Next.js articles, videos, and resources. | Cross-checking breadth of topics a well-rounded Next.js study guide should cover before finalizing the 8-category taxonomy in `lib/levels.ts`. |
| [Devinterview-io/next-interview-questions](https://github.com/Devinterview-io/next-interview-questions) | Community-maintained Next.js interview Q&A repo. | Sanity-checking which topics show up most often in real Next.js interviews — informed category weighting in `flashcards.ts`/`quiz.ts`. |
| [mrhrifat/nextjs-interview-questions](https://github.com/mrhrifat/nextjs-interview-questions) | Large community list of Next.js interview questions. | Cross-referencing common interview question framings for `quiz.ts`. |

## Adding more

Drop new source repos in the table above with a one-line description and
which file/section they informed, then author the content per the
"Study engine" / data-file conventions in the root `CLAUDE.md`.
