# Deploying the prep apps to Cloudflare Pages

This covers `apps/ios-prep`, `apps/reactnative-prep`, and `apps/android-prep`
(all static Next.js exports). The live portfolio (`apps/portfolio`) is handled
by the existing `deploy-web` job in `ci.yml` and is unchanged.

| App | Pages project | Custom domain |
|---|---|---|
| `apps/ios-prep` | `ios-prep` | `ios.gerardocordero.dev` |
| `apps/reactnative-prep` | `reactnative-prep` | `reactnative.gerardocordero.dev` |
| `apps/android-prep` | `android-prep` | `android.gerardocordero.dev` |

## How it works now

`.github/workflows/ci.yml` runs on every push to `main` and every PR:

1. **`verify`** — `pnpm typecheck`, `pnpm lint`, `pnpm test` across the monorepo.
2. **`deploy-ios-prep`**, **`deploy-reactnative-prep`**, and
   **`deploy-android-prep`** — each `needs: verify` (a red `main` can't ship),
   then **only deploys if that app actually changed** in the push. The job diffs
   `github.event.before..github.sha`; if nothing under `apps/ios-prep/` (resp.
   `apps/reactnative-prep/`, `apps/android-prep/`) changed, the build/deploy steps
   are skipped and the job is a fast no-op.

So: merge something that touches `apps/ios-prep/**` → only `ios-prep` redeploys.
Touch several → each changed app redeploys. Touch none → none redeploy.

You can also trigger a deploy manually: **GitHub → Actions → CI → Run workflow**
(`workflow_dispatch`) deploys all three prep apps regardless of what changed.

Auth reuses the two repo secrets the portfolio deploy already uses:
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

## One-time setup

1. **Commit these changes** (already made for you in the working tree):
   - `apps/ios-prep/` (the new app)
   - `pnpm-lock.yaml` (now includes `apps/ios-prep` as an importer — required for
     CI's `pnpm install --frozen-lockfile`)
   - `.github/workflows/ci.yml` (the two new deploy jobs)

   ```bash
   pnpm install          # confirms the lockfile is correct (should be a no-op)
   git add apps/ios-prep pnpm-lock.yaml .github/workflows/ci.yml DEPLOY.md
   git commit -m "Add ios-prep app + path-filtered Cloudflare Pages deploys"
   ```

2. **Confirm the API token can edit Pages.** The existing `CLOUDFLARE_API_TOKEN`
   already deploys the portfolio, so it has **Account → Cloudflare Pages → Edit**.
   That same scope covers any Pages project in the account, so no new token is
   needed. (If a prep deploy ever fails with a 403/auth error, the token is scoped
   to a single project — widen it to account-level Pages: Edit.)

3. **Create the Pages projects** (one-time). The safest way is to pre-create
   them so the first deploy can't fail on a missing project. Either:

   **Dashboard:** Workers & Pages → Create → Pages → *Direct Upload* → name it
   `ios-prep` (and again `reactnative-prep`, `android-prep`), production branch
   `main`.

   **or wrangler (local), authenticated as the same account:**
   ```bash
   npx wrangler pages project create ios-prep --production-branch=main
   npx wrangler pages project create reactnative-prep --production-branch=main
   npx wrangler pages project create android-prep --production-branch=main
   ```
   (Recent wrangler will also auto-create the project on first `pages deploy`, but
   pre-creating removes any doubt.)

## First deploy

Push the commit from step 1 to `main` — the new app counts as "changed", so
`deploy-ios-prep` builds and uploads it. Watch it in **Actions → CI**. When it's
green, the site is live at `https://ios-prep.pages.dev` (and the RN one at
`https://reactnative-prep.pages.dev`).

To deploy without a code change, use **Actions → CI → Run workflow**.

## Custom domains (DNS)

`apps/ios-prep` is already configured for `ios.gerardocordero.dev`
(`metadataBase` in `src/app/layout.tsx`). After the first deploy, attach the domain
to the project — because `gerardocordero.dev` is on this same Cloudflare account,
Cloudflare **creates the DNS record and TLS cert for you**:

**Dashboard:** Workers & Pages → `ios-prep` → **Custom domains** → *Set up a custom
domain* → `ios.gerardocordero.dev` → Activate. (Repeat on `reactnative-prep` with
`reactnative.gerardocordero.dev`, and on `android-prep` with
`android.gerardocordero.dev`.)

**or API** (uses the same token + account id):
```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/ios-prep/domains" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"name":"ios.gerardocordero.dev"}'
```

Cloudflare provisions the certificate in a minute or two; then
`https://ios.gerardocordero.dev` serves the site.

## Notes / optional follow-ups

- The portfolio (`deploy-web`) still deploys on **every** push to `main`, even when
  only a prep app changed. If you want it path-filtered too, mirror the
  `Detect changes` step into that job (filter on `apps/portfolio/**`).
- `next.config.ts` in each prep app uses `output: "export"` + `trailingSlash: true`,
  so each route is its own `index.html` — no SPA `_redirects` needed.
