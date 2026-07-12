---
name: verify
description: Launch ConvertMaster and drive it in a real browser to verify changes
---

# Verifying ConvertMaster

Client-only React SPA. Surface is the browser — no server/API to hit.

## Launch

```
npm install   # if node_modules missing
npm run dev   # Vite dev server, prints http://localhost:5173/ConvertMaster/
```

Base path is `/ConvertMaster/` — routes are `http://localhost:5173/ConvertMaster/<tool-path>`
(e.g. `/base64`, `/jwt`, `/pdf-tools`, `/resize-compress`, `/image-converter`).

## Driving it

Use `mcp__claude-in-chrome__*` tools (navigate, computer, find, read_page, javascript_tool).
Multiple Chrome profiles may be connected — expect an `AskUserQuestion` browser-selection prompt
the first time; `switch_browser` + confirm-in-extension works if the user wants to pick live.

**File uploads**: `file_upload` (path-based) does not work in this environment. Instead, dispatch a
synthetic `change` event via `javascript_tool`:
```js
const bytes = /* Uint8Array of file content */;
const file = new File([bytes], 'name.png', { type: 'image/png' });
const dt = new DataTransfer(); dt.items.add(file);
const input = document.querySelector('[aria-label="Choose images to upload"] input[type=file]');
input.files = dt.files;
input.dispatchEvent(new Event('change', { bubbles: true }));
```
A verified-valid tiny PNG for tests: `iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC`
(10×10 red square). Don't hand-roll your own base64 PNG bytes — they'll fail to decode.

**Never click real Download buttons** — they write to the user's actual Downloads folder. Confirm
the download button appears with a triggerDownload wired up; don't click it.

**Never press Enter/Space on a dropzone with a real intent to open the file picker** — it opens a
native OS dialog that hangs the automation session. To test keyboard-accessibility of a dropzone,
verify via JS instead: `el.focus(); document.activeElement === el`, and probe the keydown handler
by temporarily monkey-patching `input.click` to a no-op before dispatching a `KeyboardEvent`.

## Known gotchas

- **`computer` `type` action silently drops characters** on longer strings (seen twice: dropped a
  `0` mid-string). If a decode/parse test fails unexpectedly after typing a long token, verify the
  textarea's actual value length before concluding the app is buggy — set the value directly via
  the native `HTMLTextAreaElement.prototype.value` setter + dispatch `input` event instead.
- **CDP screenshot calls intermittently time out** ("renderer may be frozen") especially right
  after triggering CPU-heavy work (pdf-lib page rendering, canvas resize). Just retry the
  screenshot call once — it reliably succeeds on retry and the page is not actually frozen.
- **Framer-motion fade-in can make a freshly-navigated/tab-switched page look blank** in a
  screenshot taken too soon. If a screenshot looks empty/washed-out right after a click or
  navigate, wait ~1s and re-screenshot, or check the DOM directly via `javascript_tool`
  (`getBoundingClientRect`/`getComputedStyle`) before concluding something failed to render.

## Useful flows to drive

- **Text tools** (Base64/URL/JSON/JWT/HTML — share the `useCopy` hook in `src/lib/useCopy.js`):
  type into the input textarea, verify output textarea updates live; click the copy icon, confirm
  it swaps to a green checkmark (`find` the button by its `aria-label`, e.g. "Copy").
- **File tools** (ImageConverter/PdfTool/ResizeCompress — share `src/lib/fileHelpers.js`): dispatch
  a file via the synthetic-input trick above, verify it appears in the file list with a size, click
  the tool's run/process button, verify status flips to `DONE` and a size/result summary appears
  (`formatBytes` output like `"78 B → 762 B"`).
- **Base64 file-decode MIME sniffing** (`src/lib/mime.js`): paste a base64 payload *without* a
  `data:` prefix into the "Base64 to File" input on `/base64` (File tab) — this is the only path
  that exercises `getMimeTypeFromBytes` (the encode side always includes the prefix already).
