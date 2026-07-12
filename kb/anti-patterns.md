---
project: ConvertMaster
confidence: medium
last-verified: 2026-07-12
status: active
---

# Anti-Patterns — What NOT to Do

## Peer-dep install without --legacy-peer-deps — commit 9a4cd7b
**What failed:** `npm ci` in GitHub Actions failed on React 19 peer-dependency conflicts.
**Root cause:** Some deps (likely react-helmet-async or similar) don't declare React 19 in peerDependencies yet.
**How we fixed it:** CI workflow uses `npm ci --legacy-peer-deps`.
**Never do this because:** plain `npm ci`/`npm install` will break CI again until deps catch up to React 19.
**Watch for:** any new dependency added — verify it doesn't reintroduce a hard peer-dep failure, or keep using `--legacy-peer-deps`.

## triggerDownload / formatBytes / sleep duplicated per file
**What failed:** nothing broken yet, but `triggerDownload`, `formatBytes`, `sleep` helpers are copy-pasted identically in `ImageConverterTool.jsx` and `PdfTool.jsx` instead of living in `src/lib/`.
**Root cause:** each tool page built standalone, no shared file-tool utils module.
**How we fixed it:** not fixed — flagging for future extraction to `src/lib/fileHelpers.js` if a third file-tool needs them (ResizeCompressTool likely already duplicates too — verify before extracting).
**Watch for:** adding a 4th copy — extract instead.

## Cross-links
[[patterns]], [[architecture]]
