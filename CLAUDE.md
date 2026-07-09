# CLAUDE.md

Guidance for Claude Code (and other AI assistants) working in this repository.

## What this is

**Easy English Coach** — a Manifest V3 Chrome extension for beginner English
learners. Users select unknown English text on any web page, get a small
in-page action bubble, study a beginner-friendly breakdown (meaning, chunks,
key words, speaking, variations, mini check), save it to a wordbook with the
source page, and review with online/offline quizzes. See `README.md` for the
full feature list and the intended 5-minutes-a-day user flow.

No build step, no bundler, no package manager — plain JS loaded directly by
Chrome. There is no test suite; verify changes by loading the unpacked
extension (`chrome://extensions` → Developer mode → Load unpacked → this
folder) and exercising the flow in-browser.

## File map

| File | Responsibility |
|---|---|
| `manifest.json` | MV3 manifest: permissions (`activeTab`, `alarms`, `contextMenus`, `notifications`, `storage`, `scripting`), `<all_urls>` host permission, content script registration |
| `background.js` | Service worker: context menu items, daily study-reminder alarm, `CAPTURE_SELECTION` message handling, writes captured selection into `chrome.storage.local` |
| `content.js` | Injected into every page/frame (`all_frames: true`). Detects text selection, shows the in-page shadow-DOM bubble ("학습"/"단어장" buttons), sends `CAPTURE_SELECTION`/responds to `GET_SELECTION` messages |
| `popup.js` | The bulk of the app logic: lesson builder, wordbook CRUD, quiz generation (online + offline fallback), coach recommendations, stats/streak tracking. ~1100 lines, all in one file |
| `popup.html` | Popup UI markup/tabs that `popup.js` drives |
| `styles.css` | Popup styling |
| `icon128.png` | Extension icon |

## Cross-context messaging

Three JS contexts communicate via `chrome.runtime.sendMessage` /
`chrome.runtime.onMessage`, message `type` field as the discriminator:

- `content.js` → background: `{ type: "CAPTURE_SELECTION", text, source, saveIntent, openPopup? }`
- popup/background → content: `{ type: "GET_SELECTION" }` → `{ text, source }`
- Right-click context menu items also route through `captureSelection()` in
  `background.js`, then call `chrome.action.openPopup()`.

Follow the existing pattern when adding a new message type: a `type` string
constant, an early-return guard for non-matching messages, and (for async
handlers) `return true` from the listener to keep the response channel open.

## Storage schema (`chrome.storage.local`)

All persisted state lives in `chrome.storage.local` under a small set of
top-level keys — there is no schema/migration layer, so keep changes
backward-compatible with data already saved on users' machines:

- `selectedText`, `selectedAt`, `selectedSource: {title, url}`, `pendingSave` — the most recent capture, written by `captureSelection()` in `background.js`, read by `popup.js` on open
- `words` — the wordbook array (entries built by `buildEntry`/`mergeWordEntry` in `popup.js`), each with a status (`learning`/`confused`/`mastered`, see `getStatusLabel`)
- `stats` — daily-goal/streak/review/accuracy tracking (`markStudy`, `getStats`, `saveQuizResult`)

## Conventions

- Plain functions, no classes, no framework. `async function` + top-level
  `await chrome.storage.local.get([...])` / `.set({...})` is the standard
  read/write pattern — always destructure with a default (e.g.
  `const { words = [] } = await chrome.storage.local.get(["words"])`).
- Constants for IDs/keys are declared `const ALL_CAPS` at file scope (e.g.
  `CONTEXT_MENU_LEARN_ID`, `DAILY_ALARM_ID` in `background.js`).
- User-facing strings are Korean; code identifiers, comments, and this file
  are English. Keep that split when adding UI text.
- `content.js` renders the in-page bubble into a custom element with a
  **closed shadow root** and inline `<style>` (`all: initial` on `:host`) so
  host-page CSS can never leak in or be leaked to. Follow the same isolation
  approach for any new page-injected UI, and keep using `escapeHtml()` before
  interpolating page-derived text into `innerHTML`.
- Network calls (`fetchJson`, dictionary/random-word APIs in `popup.js`) all
  go through explicit timeouts and have an offline fallback path (see
  `buildOnlineQuiz`/`buildOfflineQuiz`, `buildOnlineEntry`) — the extension
  must keep working with no network.
- `host_permissions: ["<all_urls>"]` plus `activeTab`/`scripting` is
  intentional (the extension needs to read selections from and inject the
  bubble into arbitrary pages). Don't broaden permissions further without a
  concrete feature need — MV3 review scrutinizes this.

## Working conventions

- There's no linter/formatter/test config in this repo — match the existing
  style (2-space indent, double-quoted strings, `const`/`let`, arrow
  functions for callbacks) by eye.
- Manual verification is the only verification: reload the unpacked
  extension, select text on a real page, and walk through capture → bubble →
  popup study flow → save → quiz, per the checklist in `README.md`'s "Daily
  Routine".
- Keep `README.md`'s feature list and Chrome-loading instructions in sync
  with any user-visible behavior change.
