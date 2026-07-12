---
project: ConvertMaster
confidence: medium
last-verified: 2026-07-12 (23:10 update)
status: active
---

# Anti-Patterns — What NOT to Do

## Peer-dep install without --legacy-peer-deps — commit 9a4cd7b
**What failed:** `npm ci` in GitHub Actions failed on React 19 peer-dependency conflicts.
**Root cause:** Some deps (likely react-helmet-async or similar) don't declare React 19 in peerDependencies yet.
**How we fixed it:** CI workflow uses `npm ci --legacy-peer-deps`.
**Never do this because:** plain `npm ci`/`npm install` will break CI again until deps catch up to React 19.
**Watch for:** any new dependency added — verify it doesn't reintroduce a hard peer-dep failure, or keep using `--legacy-peer-deps`.

## triggerDownload / formatBytes / sleep duplicated per file — RESOLVED 2026-07-12
**What failed:** `triggerDownload`, `formatBytes`, `sleep` helpers were copy-pasted identically in `ImageConverterTool.jsx`, `PdfTool.jsx`, and `ResizeCompressTool.jsx` (confirmed 3x, not just 2x as first suspected).
**Root cause:** each tool page built standalone, no shared file-tool utils module.
**How we fixed it:** extracted to `src/lib/fileHelpers.js`, all three pages now import from there.
**Never do this because:** n/a — resolved. Keeping this entry as a marker: if a 4th duplicate copy of any of these three functions ever appears, that's a regression — extract-don't-duplicate again.
**Watch for:** any new file-upload tool redefining `sleep`/`formatBytes`/`triggerDownload` locally instead of importing from `fileHelpers.js`.

## handleCopy duplicated across all 5 text tools — RESOLVED 2026-07-12
**What failed:** identical `handleCopy` (clipboard write + `copied` state + 2s reset) copy-pasted in Base64Tool, UrlTool, JsonTool, JwtTool, HtmlEntityTool.
**Root cause:** same as above — no shared hook existed when the tools were first built.
**How we fixed it:** extracted to `src/lib/useCopy.js` as a hook (`{ copied, copy }`), all 5 pages now use it.
**Watch for:** any new text tool redefining copy-to-clipboard logic locally instead of using `useCopy()`.

## ESLint no-unused-vars false-positives on JSX-only imports — logged 2026-07-12, not fixed
**What failed:** every file that imports `motion` from framer-motion and only uses it as `<motion.div>` (never as a bare identifier) gets a false "'motion' is defined but never used" error. 23 such errors exist repo-wide as of 2026-07-12 (confirmed pre-existing via `git stash`, not caused by any recent session).
**Root cause:** `eslint.config.js` only extends `js.configs.recommended` + the two react-hooks/react-refresh plugins — no `eslint-plugin-react` (or equivalent) providing `jsx-uses-vars`, so the core `no-unused-vars` rule can't see JSX usage.
**How we fixed it:** not fixed — out of scope of the guideline-review session that found it (only Major findings were approved for that pass; this was noted but never a formal finding since it's not traceable to a specific ENGINEERING_GUIDELINES.md rule beyond "lint should pass").
**Never do this because:** a `.github/workflows/deploy.yml` CI gate now runs `npm run lint` on every push (added 2026-07-12) and will show red until this is fixed.
**Watch for:** anyone trying to "fix" this by removing/renaming the `motion` imports instead of fixing the ESLint config — the imports are correct, the lint rule is wrong.

## File-upload dropzones built keyboard-inaccessible by default — logged 2026-07-12, fixed for existing tools
**What failed:** dropzones (`ft-dropzone` divs, and Base64Tool's hand-rolled one) were `onClick`-only with no `role`, `tabIndex`, or `onKeyDown` — keyboard-only users couldn't open the file picker in 4 of 5 file-handling tools.
**Root cause:** dropzone UI copied from tool to tool without ever adding a keyboard path.
**How we fixed it:** added `role="button" tabIndex={0}` + `onKeyDown` (Enter/Space → same click handler) to all 4 existing dropzones.
**Never do this because:** WCAG 2.1 AA requires everything work via keyboard alone — this locked out an entire input modality for the core feature of 4 tools.
**Watch for:** any *new* dropzone built with `onClick` only — copy the pattern from an existing fixed dropzone (e.g. `PdfTool.jsx`), not from git history/old examples.

## Cross-links
[[patterns]], [[architecture]]
