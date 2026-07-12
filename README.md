# ConvertMaster

A collection of browser-only developer tools — Base64, URL, JSON, JWT, and HTML entity encoding/decoding, plus image conversion, PDF tools, and image resize/compress. Everything runs client-side; no files are ever uploaded to a server.

Live site: [https://manichandra438.github.io/ConvertMaster](https://manichandra438.github.io/ConvertMaster)

## Setup

```bash
npm install
npm run dev
```

Open the printed local URL in your browser.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint over the codebase |
| `npm run test` | Run the Vitest unit test suite |

## Configuration

No environment variables or secrets are required — it's a static client-side app. App-wide toggles (e.g. the walking-characters easter egg) live in `src/config.js`.

## Stack

React 19 + Vite 7 + React Router + Tailwind CSS + framer-motion, with `pdf-lib`/`pdfjs-dist` for PDF handling.
