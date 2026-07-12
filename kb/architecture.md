---
project: ConvertMaster
confidence: medium
last-verified: 2026-07-12
status: active
---

# Architecture

## What it does
Static SPA of 8 browser-only conversion/dev tools (Base64, URL, JSON, JWT, HTML entities, Image Converter, PDF Tools, Resize/Compress). Deployed to GitHub Pages under `/ConvertMaster` base path. "100% browser-based, no uploads" is the core selling point — every tool processes files client-side via Canvas/FileReader/pdf-lib, never hits a server.

## Key components
- `src/App.jsx` — route table, one `<Route>` per tool, wrapped in `<Router basename="/ConvertMaster">` + `<Layout>`.
- `src/components/Layout.jsx` — VSCode-style shell: titlebar (logo, GitHub link), collapsible sidebar (`Sidebar` sub-component, grouped by category from `lib/tools.js`), status bar (tool count, walking-characters toggle), main content area with route-based fade/slide transition (`motion.div` keyed on `location.pathname`).
- `src/lib/tools.js` — **single source of truth** for tool metadata (id, path, name, emoji, color, category, desc) and category metadata. Explicitly commented "never duplicate tool lists" — Layout, HomePage, ToolCard all read from here.
- `src/components/ToolCard.jsx` — shared page chrome for every tool page: breadcrumb header, description bar, body (`children`), "related tools" footer computed via `getRelatedTools(toolId)`.
- `src/components/SEO.jsx` — per-page `<Helmet>` wrapper (title/description/OG/Twitter/JSON-LD). Every tool page renders `<SEO ... />` + `<ToolCard>` as its top-level return.
- `src/pages/*.jsx` — one file per tool, self-contained (state + conversion logic + UI in the same file, no shared tool-logic layer).
- `src/config.js` — small central config object (currently just `walkingCharacters` feature flag + speeds).
- `src/lib/utils.js` — just `cn()` (clsx + tailwind-merge), standard shadcn-style helper.

## Data flow
User picks a tool from Sidebar → route renders the tool's page component → page manages its own local state (useState) → conversion happens synchronously or via FileReader/Canvas/pdf-lib callbacks, all in-browser → output shown in textarea/preview/downloadable Blob via `URL.createObjectURL` + synthetic `<a download>` click. No global state store, no API layer — every tool page is an island.

## External dependencies
- `pdf-lib` — build/merge/compress PDFs (PDFDocument.create/load/save).
- `pdfjs-dist` — render PDF pages to canvas (PDF → Images, Compress). Worker configured via `pdfjsLib.GlobalWorkerOptions.workerSrc` pointing at the bundled worker file.
- `framer-motion` — used pervasively for tab transitions, drag-drop zone feedback, mount/unmount animations, copy-button checkmark swap.
- `react-helmet-async` — per-route SEO tags.
- `clsx` + `tailwind-merge` — className composition (`cn()`).
- `lucide-react` — icon set.

## Entry points
- Dev: `npm run dev` (Vite dev server)
- Build: `npm run build` → `dist/`
- Deploy: GitHub Actions workflow `.github/workflows/*.yml`, manual `workflow_dispatch` picking branch (master/main/Ads), `npm ci --legacy-peer-deps` (needed for React 19 peer-dep conflicts) → `npm run build` → upload `dist/` to GitHub Pages.

## Cross-links
[[patterns]], [[anti-patterns]]
