# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-purpose static web tool: it compares two people's [Figuritas app](https://www.figuritas.app)
exports and computes which **repeated** stickers each person should hand to the other
(the repeats one person holds that the other is still **missing**), then renders the
two trade lists back in the app's own list format so they can be pasted/shared.

**Hard constraint:** pure HTML + JavaScript, **no framework, no build step, no Node,
no dependencies, no server.** Everything must run by opening a file directly
(`file://`) and must also work when served statically from GitHub Pages. Do not
introduce a bundler, package manager, ES modules, or fetch-based loading — these
would break the `file://` use case. Scripts communicate through plain globals
(`FH`, `FIXTURES`).

## Running and testing

There are no build/lint/test commands — everything is browser-loaded:

- **Run the app:** open `index.html` in a browser.
- **Run the tests:** open `test.html` in a browser. It loads `app.js` + `fixtures.js`,
  runs the parsing/matching/ordering/formatting assertions, and prints a green/red
  pass-fail list with a `N passed, M failed` summary. There is no test framework —
  the runner (`test()`/`assert()`/`eqJSON()`) is hand-rolled inline in `test.html`.
- To add a test, add a `test('name', fn)` block inside the IIFE in `test.html`.
  There is no way to run a single test in isolation; the whole file runs on load.

## Architecture

Four files at the repo root, plus `.agents/` (historical agent notes, ignore for code work):

- **`app.js`** — all core logic, exposed as a single global `FH` namespace (IIFE).
  This is the only place with real logic. The pipeline is:
  `parseList` → `computeTrades` → `orderTrades` → `formatList`.
- **`index.html`** — the UI (4 textareas, two per-person ordering radios, results
  panes) plus a small inline `<script>` that wires the buttons to `FH`. All styling
  is inline `<style>`.
- **`fixtures.js`** — exposes a global `FIXTURES`. `personA_*` are real exports;
  `personB_*` is synthetic data crafted to exercise matching/ordering. Used by both
  the test runner **and** the "Load sample data" button.
- **`test.html`** — self-contained in-browser test runner.

### Data model and the FWC/code-grouping rule

`parseList(text)` returns a `Map: code -> { emoji, numbers: Set<number> }`.

The single most important domain rule, baked into the parser and the `ALBUM` data:
**stickers are grouped by their 3-letter (or 2-letter, e.g. `CC`) code only.** The
app exports `FWC` across several lines with different page icons (🏆 / 🌎 / 📜), but
they are **one group sharing a single number sequence (1–19)** — the parser merges
all lines with the same code. The emoji is display-only (first one seen wins).

Parsing notes that must be preserved:
- Lines match `LINE_RE = /^\s*(.+?):\s*(\d+(?:\s*,\s*\d+)*)\s*$/`. The code is the
  first whitespace token of the left side; the rest is the emoji.
- Flags can be multi-codepoint (e.g. `🏴󠁧󠁢󠁳󠁣󠁴󠁿`), so splitting is done **on the colon**,
  never by trying to match the emoji.
- Header lines (`Figurinhas App - Lista`, album name, `Faltantes`/`Repetidas`) and
  the `Baixe o app` footer naturally fail `LINE_RE` (no `code: numbers`) and are skipped.

### The `ALBUM` table

`ALBUM` in `app.js` is the source of truth, a list of `[code, lo, hi]` page ranges in
album order. From it `app.js` derives `ALBUM_ORDER` (canonical country order, first
appearance) and `COUNTRY_NUMBERS` (code → Set of all valid numbers). `FWC` appears
twice (`1–8` and `9–19`) because it spans two album pages but is one group; standard
countries are `1–20`; `CC` is `1–14`. If the album definition changes, edit `ALBUM`
only — the derived structures rebuild automatically.

### Matching and ordering

- `computeTrades(personA, personB)` returns `{ aGivesToB, bGivesToA }`, each the
  per-country intersection of the giver's `repeated` with the receiver's `missing`.
- `orderTrades(tradeMap, recipientMissing, mode)` orders a trade list for one
  recipient:
  - `"sequential"` — country lines in `ALBUM_ORDER`, numbers ascending.
  - `"completion"` — countries the recipient is closest to finishing first, sorted by
    *remaining missing count after the trade* (`remainingAfterTrade`; 0 = country
    gets completed → floats to top), tie-broken by album order.
- `formatList` renders ordered trades back to `CODE EMOJI: n, n, ...` lines — the same
  format as the input, so output is directly pasteable into the app.

Note the wiring in `index.html`: each result pane is ordered by the **recipient's**
preference — "Give these to B" uses B's radio and B's `missing` map, and vice versa.

## Conventions

- ES5-style JavaScript (`var`, function expressions, no arrow functions/modules) is
  used throughout for maximum `file://` browser compatibility. Match it.
- Both `app.js` and `fixtures.js` end with a defensive
  `if (typeof module !== 'undefined' ...) module.exports = ...` so they *could* be
  `require`d, but the browser path via globals is the real contract.
- Hosting: the static files at the repo root are deployed via GitHub Pages
  (Settings → Pages → Deploy from a branch → `/ (root)`).
