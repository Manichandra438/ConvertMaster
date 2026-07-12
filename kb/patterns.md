---
project: ConvertMaster
confidence: medium
last-verified: 2026-07-12 (23:10 update)
status: active
---

# Code Patterns

## Conventions
- Tool metadata lives ONLY in `src/lib/tools.js` (`tools` array + `categories` map). Never hardcode tool lists elsewhere — Layout/HomePage/ToolCard all derive from `getToolsByCategory()` / `getRelatedTools()`.
- Styling is a mix: Tailwind utility classes for tool-page internals (buttons, inputs, layout), inline `style={{...}}` objects with CSS custom properties (`var(--bg)`, `var(--panel-bg)`, `var(--border)`, `var(--text-dim)`, etc.) for the VSCode-shell chrome (Layout, Sidebar, ToolCard header). Don't mix these up — chrome components use the CSS-var inline-style pattern, tool bodies use Tailwind + `cn()`.
- Shared file-tool CSS classes (`ft-dropzone`, `ft-file-item`, `ft-status-wait/done/error`, `ft-progress-wrap/bar`, `ft-tool-card`, `ft-page-grid/card/label/check`, `ft-spinner`) live in `src/index.css` — reused across ImageConverterTool, PdfTool, ResizeCompressTool. Reuse these classes for any new file-upload tool rather than reinventing dropzone/progress UI.

## How to add a new tool
1. Add entry to `tools` array in `src/lib/tools.js` (id, path, name, emoji, color, category, desc).
2. Create `src/pages/XTool.jsx` returning `<><SEO .../><ToolCard toolId="x" title=... description=...>{...}</ToolCard></>`.
3. Register route in `src/App.jsx`.
4. If it's a file-upload tool, reuse `ft-*` CSS classes from `index.css` + the drag/drop + progress + file-list pattern seen in `ImageConverterTool.jsx`/`PdfTool.jsx`.
5. If it's a text tool, follow `Base64Tool.jsx`'s pattern: useEffect-driven live conversion on input change, copy-button with `copied` state + 2s timeout reset, error state shown inline below output.

## Common patterns in this codebase
- **Live conversion via useEffect**: text tools (Base64, presumably URL/JSON/JWT/HTML) recompute output in a `useEffect([input, mode])`, catch errors into a local error state, no debounce.
- **File queue pattern** (ImageConverterTool, PdfTool, ResizeCompressTool): `files` state array of `{ id, file, status: 'ready'|'working'|'done'|'error', result }`, sequential `for` loop with `await sleep(N)` between items to let UI repaint progress %, `setFiles([...updated])` after each mutation (no functional batching).
- **Download trigger**: `triggerDownload(blob, name)` from `src/lib/fileHelpers.js` — creates object URL, synthetic `<a>` click, revokes URL after 1s timeout. As of 2026-07-12 this is a shared import, not duplicated — always import from `fileHelpers.js`, never redefine locally.
- **Copy-to-clipboard**: `useCopy()` hook from `src/lib/useCopy.js` — returns `{ copied, copy }`. `copy(text, id)` writes to clipboard, sets `copied` to the id, resets after 2s. AnimatePresence swaps Copy/Check icon based on `copied === id`. As of 2026-07-12 this is shared, not duplicated — always use the hook, never redefine `handleCopy` locally.
- **Canvas-based image processing**: draw to offscreen `<canvas>`, optional pixel manipulation (`applyGrayscale`/`applySepia` in ImageConverterTool), `canvas.toBlob(cb, mimeType, quality)`.
- **PDF page rendering**: `pdfjsLib.getDocument({data}).promise` → `pdf.getPage(n)` → `page.getViewport({scale})` → render to canvas → `canvas.toBlob`.
- **Pure-logic extraction for testability**: when a component has a genuinely pure function (no DOM/canvas dependency — e.g. byte-sniffing, string parsing, dimension math), pull it into `src/lib/{name}.js` with a matching `{name}.test.js`, then import it back into the component. Don't extract functions that are inherently DOM-coupled (e.g. the canvas-drawing parts of `resizeImage` stay in the component; only the width/height math moved to `lib/resize.js`).
- **Keyboard-accessible dropzones**: file-upload dropzones use `role="button" tabIndex={0}` + `onKeyDown` handling Enter/Space (in addition to `onClick`) so keyboard-only users can open the file picker. Added 2026-07-12 — any new dropzone should follow this from the start, not just `onClick`.

## Testing approach
Vitest (`npm run test` → `vitest run`), added 2026-07-12. Only pure `src/lib/*.js` functions have tests so far (`mime.test.js`, `jwt.test.js`, `resize.test.js`, `fileHelpers.test.js` — 20 tests total). No component/integration tests yet — UI behavior is still verified manually/visually (or via live browser-driving, see the project's `.claude/skills/verify/SKILL.md`).

## Cross-links
[[architecture]], [[anti-patterns]]
