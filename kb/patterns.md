---
project: ConvertMaster
confidence: medium
last-verified: 2026-07-12
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
- **File queue pattern** (ImageConverterTool, PdfTool): `files` state array of `{ id, file, status: 'ready'|'working'|'done'|'error', result }`, sequential `for` loop with `await sleep(N)` between items to let UI repaint progress %, `setFiles([...updated])` after each mutation (no functional batching).
- **Download trigger**: `triggerDownload(blob, name)` helper — creates object URL, synthetic `<a>` click, revokes URL after 1s timeout. Duplicated per-file (not extracted to `lib/`) — same function body copy-pasted in ImageConverterTool.jsx and PdfTool.jsx.
- **Copy-to-clipboard**: `navigator.clipboard.writeText`, sets `copied` state to an id string, `setTimeout(() => setCopied(null), 2000)`, AnimatePresence swaps Copy/Check icon.
- **Canvas-based image processing**: draw to offscreen `<canvas>`, optional pixel manipulation (`applyGrayscale`/`applySepia` in ImageConverterTool), `canvas.toBlob(cb, mimeType, quality)`.
- **PDF page rendering**: `pdfjsLib.getDocument({data}).promise` → `pdf.getPage(n)` → `page.getViewport({scale})` → render to canvas → `canvas.toBlob`.

## Testing approach
No test files found in the repo (no `*.test.*`/`*.spec.*`, no test runner in package.json). Verification is manual/visual only.

## Cross-links
[[architecture]], [[anti-patterns]]
