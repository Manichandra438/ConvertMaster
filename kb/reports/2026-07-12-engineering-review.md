---
date: 2026-07-12
type: engineering-guidelines-review
guidelines-source: kb/guidelines/ENGINEERING_GUIDELINES.md
status: resolved
total: 8
critical: 0
major: 5
minor: 3
---

# Engineering Guidelines Review — 2026-07-12

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0     |
| Major    | 5     |
| Minor    | 3     |
| **Total open** | **8** |

Sections reviewed: 1 (Core Principles), 2 (Architecture & Design), 3 (Project Structure), 4 (Naming Conventions), 5 (Functions & Code Structure), 6 (Error Handling), 7 (Testing), 8 (Git Workflow), 9 (Code Review), 10 (Security), 15 (Performance), 16 (Dependencies), 17 (Documentation), 18 (CI/CD & Releases), 19 (Concurrency & Async), 21 (Accessibility & Internationalization), 23 (Technical Debt & Refactoring), 24 (Definition of Done), 25 (Guidelines for AI Assistants)

Sections marked N/A: §11 API Design (no backend/API — pure client-side SPA), §12 Data & Persistence (no database), §13 Configuration & Secrets (no env-based config or secrets used anywhere in the app), §14 Logging & Observability (no server process — nothing to structure-log or alert on), §20 Privacy & Compliance (no personal data collected or stored), §22 Incident Response & Postmortems (no production service / on-call process for a static site)

## Major

### [M1] `handleCopy` clipboard helper duplicated verbatim across 5 tool pages
- **Location:** `src/pages/Base64Tool.jsx:142-150`, `src/pages/UrlTool.jsx:33-41`, `src/pages/JsonTool.jsx:30-38`, `src/pages/JwtTool.jsx:46-54`, `src/pages/HtmlEntityTool.jsx:39-47`
- **Guideline:** §1 Core Principles — DRY ("Extract shared code only when the duplication is real and stable (rule of three)")
- **Issue:** Identical `handleCopy` function (clipboard write + `copied` id state + 2s timeout reset + `console.error` on failure) copy-pasted byte-for-byte in 5 separate files. Duplication is well past the "rule of three" threshold.
- **Fix:** Extract to a shared hook, e.g. `src/lib/useCopy.js` — `const { copied, copy } = useCopy()` — and use it in all 5 tool pages.
- **Status:** fixed

### [M2] `sleep` / `formatBytes` / `triggerDownload` duplicated verbatim across 3 file-tool pages
- **Location:** `src/pages/ImageConverterTool.jsx:9-15,83-89`, `src/pages/PdfTool.jsx:17-31`, `src/pages/ResizeCompressTool.jsx:9-15,83-89`
- **Guideline:** §1 Core Principles — DRY (rule of three)
- **Issue:** Same three helper functions defined identically in three files. Already flagged as a watch-item in `kb/anti-patterns.md`; now confirmed at 3x duplication.
- **Fix:** Extract to `src/lib/fileHelpers.js` and import in all three pages.
- **Status:** fixed

### [M3] No test suite anywhere in the repository
- **Location:** `package.json:6-11` (scripts block has `dev`/`build`/`lint`/`preview`, no `test`); repo-wide — zero `*.test.*`/`*.spec.*` files
- **Guideline:** §7 Testing — "New code ships with tests in the same commit/PR"; §24 Definition of Done — "Tests written and passing"
- **Issue:** Every tool contains non-trivial parsing/encoding logic (Base64, JWT decode, JSON parse, PDF page rendering, image resize math) with zero automated coverage. No test runner is even configured.
- **Fix:** Introduce a unit test runner (e.g. Vitest, since the project already uses Vite) and add tests for the pure logic functions first (`resizeImage` math, `getMimeTypeFromBytes`, JWT part decoding, JSON format/minify).
- **Status:** fixed

### [M4] CI workflow has no push/PR trigger and no lint step
- **Location:** `.github/workflows/deploy.yml:3-14` (only `workflow_dispatch` trigger, no `push`/`pull_request`), `.github/workflows/deploy.yml:33-68` (job runs install → build → deploy, no lint step)
- **Guideline:** §18 CI/CD & Releases — "Every push runs CI: lint → build → test. All three gate the merge." / "Deploys are automated, boring, and rolled back easily."
- **Issue:** There is no CI that runs on push or PR at all — the only workflow is a manual `workflow_dispatch` that builds and deploys directly to production (GitHub Pages) with no lint gate and no test gate. A broken/unlinted commit on `master` can be deployed straight to production by hand.
- **Fix:** Add a `pull_request`/`push` triggered workflow that runs `npm run lint` (and `test` once M3 lands) before any deploy workflow can run; keep `workflow_dispatch` for the deploy step itself but gate it on the CI workflow passing.
- **Status:** fixed

### [M5] File-upload dropzones are mouse-only — not reachable by keyboard
- **Location:** `src/pages/PdfTool.jsx:315-322`, `src/pages/ImageConverterTool.jsx:180-187`, `src/pages/ResizeCompressTool.jsx:192-199`, `src/pages/Base64Tool.jsx:397-418`
- **Guideline:** §21 Accessibility & Internationalization — "Everything works with a keyboard alone: logical tab order, visible focus indicator, no keyboard traps"
- **Issue:** The drag-and-drop upload zones are plain `<div>`/`<motion.div>` elements with only an `onClick` handler that triggers the hidden `<input type="file">`. They have no `tabIndex`, `role="button"`, or `onKeyDown` handler, so a keyboard-only user cannot open the file picker at all in 4 of the 5 file-handling tools — the entire "Image → Base64" flow, PDF tools, Image Converter, and Resize/Compress are unusable without a mouse.
- **Fix:** Make the dropzone a real `<button>` (or add `role="button" tabIndex={0}` + `onKeyDown` handling Enter/Space) that triggers the file input.
- **Status:** fixed

## Minor

### [N1] README is unedited Vite template boilerplate — no project-specific setup instructions
- **Location:** `README.md:1-22`
- **Guideline:** §17 Documentation — "README answers, in order: what this project is, how to install/run it, how to run the tests, how to configure it, where to learn more. A newcomer should reach 'running locally' from the README alone."
- **Issue:** The README is a one-line project description plus the stock `create-vite` React template text about HMR/Babel/SWC/React Compiler. It never states `npm install`, `npm run dev`, `npm run build`, or `npm run lint` — a newcomer cannot get the project running from the README alone.
- **Fix:** Replace the boilerplate section with actual setup steps (`npm install`, `npm run dev`, `npm run build`, `npm run lint`) and a one-line note that there's no test suite yet (or a `npm test` line once M3 lands).
- **Status:** fixed

### [N2] Icon-only buttons rely on `title` alone for their accessible name
- **Location:** `src/pages/Base64Tool.jsx:271-303` (representative — same pattern repeats in every tool page's Copy/Clear/Trash/Download/X icon buttons)
- **Guideline:** §21 Accessibility & Internationalization — semantic structure / accessible controls baseline (WCAG 2.1 AA)
- **Issue:** Icon-only buttons (Copy, Trash2, Download, X) across every tool page set `title="Copy"` etc. but no `aria-label`. `title` is not reliably announced by all screen readers/browsers, unlike `aria-label`.
- **Fix:** Add `aria-label` matching the `title` text on every icon-only button (can be done alongside M1's `CopyButton` extraction to fix all copy buttons in one place).
- **Status:** fixed

### [N3] PDF page-size dimensions are unnamed magic numbers
- **Location:** `src/pages/PdfTool.jsx:121`
- **Guideline:** §5 Functions & Code Structure — "No magic values. Named constants for any literal whose meaning isn't obvious in context."
- **Issue:** `const [pw, ph] = pageSize === 'a4' ? [595, 842] : pageSize === 'letter' ? [612, 792] : [0, 0];` — the PDF-point dimensions for A4/Letter are inlined with no constant name or unit comment.
- **Fix:** Extract to named constants, e.g. `const PAGE_SIZES = { a4: [595, 842], letter: [612, 792] }; // PDF points (1/72")`.
- **Status:** fixed

## Resolution Log

- **M1** — fixed — 2026-07-12 — Extracted `useCopy()` hook to `src/lib/useCopy.js`; replaced the duplicated `handleCopy` in Base64Tool.jsx, UrlTool.jsx, JsonTool.jsx, JwtTool.jsx, HtmlEntityTool.jsx with `const { copied, copy: handleCopy } = useCopy();`. Lint error count unchanged from baseline; build green.
- **M2** — fixed — 2026-07-12 — Extracted `sleep`/`formatBytes`/`triggerDownload` to `src/lib/fileHelpers.js`; removed local copies from ImageConverterTool.jsx, PdfTool.jsx, ResizeCompressTool.jsx. Build green.
- **M3** — fixed — 2026-07-12 — Added Vitest (`npm run test` → `vitest run`). Extracted three previously-inline pure functions to make them testable: `getMimeTypeFromBytes` → `src/lib/mime.js`, JWT part decoding → `src/lib/jwt.js` (`decodeJwtPart`), resize dimension math → `src/lib/resize.js` (`computeResizedDimensions`) — each now imported back into its original page. Added `mime.test.js`, `jwt.test.js`, `resize.test.js`, `fileHelpers.test.js` (20 tests total, all passing). JSON format/minify was not given a dedicated test since it's a thin wrapper over `JSON.parse`/`JSON.stringify` with no custom logic to verify.
- **M4** — fixed — 2026-07-12 — Added `push`/`pull_request` triggers to `.github/workflows/deploy.yml`, split the job into `lint-and-test` (always runs: lint + test) and `build-and-deploy` (`needs: lint-and-test`, gated to only actually deploy on `workflow_dispatch` — push/PR events run CI only, preserving the existing manual-deploy design). **Caveat, not silently swept under "done":** the new lint gate will currently show CI red because the repo has 23 pre-existing lint errors (`no-unused-vars` on `motion` imports used only in JSX — a pre-existing eslint config gap missing `react/jsx-uses-vars` — plus a few unrelated `set-state-in-effect`/unused-catch-var errors). These predate this session (verified via `git stash` — baseline was 24 before M1-M3 touched anything, now 23 as an incidental side effect of the JwtTool extraction, not a deliberate fix). Fixing them was not approved as part of this Major-only pass, so they're left open — flagging here rather than fixing unrequested or hiding the fact that CI will fail on the next push.
- **M5** — fixed — 2026-07-12 — Added `role="button" tabIndex={0}` + `aria-label` + `onKeyDown` (Enter/Space triggers the hidden file input) to the four mouse-only dropzones in PdfTool.jsx, ImageConverterTool.jsx, ResizeCompressTool.jsx, and Base64Tool.jsx.
- **N1** — fixed — 2026-07-12 — Rewrote `README.md`: real project description, `npm install`/`npm run dev` setup steps, a scripts table (`dev`/`build`/`preview`/`lint`/`test`), a config note (no secrets/env vars needed), and the stack list. Removed the stock create-vite boilerplate text.
- **N2** — fixed — 2026-07-12 — Added `aria-label` (matching existing `title` where present) to every icon-only Copy/Clear button across Base64Tool.jsx, UrlTool.jsx, JsonTool.jsx, JwtTool.jsx, HtmlEntityTool.jsx, and to the Download/Remove buttons in ImageConverterTool.jsx and ResizeCompressTool.jsx. Also fixed PdfTool.jsx's Download/Remove buttons and Base64Tool.jsx's file-remove button, which had **no** accessible name at all (worse than the cited case) — same underlying defect, caught while fixing the cited instance.
- **N3** — fixed — 2026-07-12 — Extracted `PAGE_SIZES = { a4: [595, 842], letter: [612, 792] }` (PDF points, 1/72") in PdfTool.jsx; page-size lookup now `PAGE_SIZES[pageSize] || [0, 0]`.

All fixes verified: `npm run build` succeeds, `npm run test` — 20/20 passing, `npm run lint` — 23 errors (unchanged from the pre-existing baseline established during the Major-fix pass; no new errors introduced by any Minor fix either).

### Follow-up still needed (out of scope of this review, surfaced for visibility)
- 23 pre-existing lint errors block the CI lint gate added in M4 (see that Resolution Log entry) — recommend a dedicated pass to fix the `no-unused-vars`-on-JSX config gap and the handful of `react-hooks/set-state-in-effect` warnings before the next push, or CI will be red.
