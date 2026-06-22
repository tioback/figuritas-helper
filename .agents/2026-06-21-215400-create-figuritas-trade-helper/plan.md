# Figuritas Trade Matcher

## Context

Two people each export, from the Figuritas app, a list of **Faltantes** (missing)
and **Repetidas** (repeated/duplicate) stickers. To trade, each person wants to
know which of *their* repeated stickers the *other* person is missing. This tool
takes both people's exports, computes the two trade lists, and presents them in
the same app format so the result can be pasted/shared directly.

Everything must be **pure static HTML + JavaScript — no framework, no build step,
no Node** — so it can be dropped onto GitHub Pages (or Claude's webpage service)
as-is. The repo is currently empty.

### Facts from the samples + user clarifications
- A data line looks like `CODE EMOJI: n, n, n` (e.g. `MEX 🇲🇽: 1, 7, 12`).
- **`FWC` is a single group.** It appears on multiple lines with different icons
  (`🏆`, `🌎`, `📜`) — the icons only mark album pages; all FWC numbers share **one
  sequence (1–19)**. The parser therefore keys on the **3-letter code only** and
  **merges** all lines with the same code into one group.
- Some flags are multi-codepoint (e.g. `🏴󠁧󠁢󠁳󠁣󠁴󠁿`), so we split on the colon rather
  than rely on `.` matching the flag. Header lines (`Figurinhas App - Lista`,
  album name, `Faltantes`/`Repetidas`) and the `Baixe o app` footer are ignored.
- **Album sequence** (page-range : code : number-range) is provided and will be
  embedded as data. It defines (a) the canonical country order and (b) each
  country's full number set. Note FWC spans two ranges (1–8 and 9–19) → full set
  `{1..19}`; standard countries are `{1..20}`; `CC` is `{1..14}`.

## Decisions (from user)
- **Input:** 4 labeled boxes — Person A Faltantes, A Repetidas, B Faltantes, B Repetidas.
- **Per-person preference radio:** `Sequential` vs `Completion` — controls the
  order of the stickers that person *receives*:
  - *Sequential:* country lines in **album order** (from the embedded sequence),
    numbers ascending.
  - *Completion:* country lines ordered so the recipient's near-complete countries
    come first — sort by the recipient's *remaining* missing count after the trade
    (0 = country gets completed → top), tie-break by album order.
- **Output:** two lists titled **"Give these to B"** and **"Give these to A"**,
  formatted exactly like the input (`CODE EMOJI: n, n, ...`, one line per group;
  emoji = first one seen for that code).
- **Testing:** fixture resources + a simple **in-browser** test page (no framework,
  no Node).

## Files to create (all static)
- `index.html` — the page: 4 `<textarea>`s, 2 radio groups, a **Compare** button,
  two output panes (`<pre>` for copyable app-format text). Minimal inline CSS.
  Loads `app.js` as `<script type="module">`.
- `app.js` — ES-module logic, pure exported functions + embedded album data:
  - `ALBUM` constant (array of `{pages, code, range:[lo,hi]}`) from the user's
    table; derive `ALBUM_ORDER` (unique codes in order) and `COUNTRY_NUMBERS`
    (code → full Set, union of ranges).
  - `parseList(text)` → `Map<code, {emoji, numbers:Set}>`, **merging** repeated
    codes (FWC). Data-line regex `/^(.+?):\s*(\d+(?:\s*,\s*\d+)*)\s*$/`; code =
    first token of the left side; capture emoji (rest of left side) once per code.
  - `computeTrades(personA, personB)` — each person `{missing, repeated}` (parsed
    maps). Returns `{aGivesToB, bGivesToA}`; per code, intersection of giver's
    `repeated` with receiver's `missing`.
  - `orderTrades(tradeMap, recipientMissing, mode)` — Sequential vs Completion
    ordering as defined above; returns an ordered array of `{code, emoji, numbers[]}`.
  - `formatList(orderedTrades)` → app-format string.
  - `main()` wires the Compare button (reads textareas + radios, renders output).
- `fixtures.js` — exports the two **provided** samples as string constants
  (`personA_faltantes`, `personA_repetidas`) plus a small **synthetic Person B**
  (`personB_faltantes`, `personB_repetidas`) so matching/ordering can be tested
  (the request only supplied one person). Importable — no fetch, works on `file://`.
- `test.html` — opens directly in a browser; imports `app.js` + `fixtures.js`,
  runs assertions, renders green/red pass-fail results. Tiny inline `assert` helper
  (no framework). Cases:
  - parser merges the 3 `FWC` lines into one group with numbers `{4,5,6,7,10,12,17}`;
    handles multi-codepoint flags; ignores header/footer.
  - `computeTrades` intersections match a hand-checked case.
  - Sequential follows album order; Completion floats a completable country to top.
- `README.md` — what it does, how to use, "open `test.html` to run tests", and
  GitHub Pages setup.

## GitHub Pages hosting
Pure static files at the repo root → enable **Settings → Pages → deploy from
branch**, served at `https://<user>.github.io/figuritas-helper/`. No build/CI
needed. README will spell this out.

## Verification
- Open `test.html` in a browser → all checks green.
- Open `index.html`, paste the provided samples as Person A and the synthetic
  fixtures as Person B, click **Compare**; confirm both outputs are valid
  app-format text and toggling a person's radio (Sequential/Completion) reorders
  their received list.

---

## Implementation notes (as built)

The plan above was approved and implemented, with two pragmatic adjustments made
during the build:

- **Plain scripts instead of ES modules.** `app.js`/`fixtures.js` expose globals
  (`FH`, `FIXTURES`) via a small IIFE and are loaded with classic `<script>` tags.
  This avoids the `file://` CORS restriction Chrome applies to ES-module imports,
  so `index.html` and `test.html` open straight from disk. The files also set
  `module.exports` when present, so the same logic can be sanity-checked under
  Node without changing the browser path.
- **A "Load sample data" button** was added to `index.html` to populate the
  inputs from the fixtures — convenient for manual verification.

Deferred to a follow-up PR (user's call): improving the **Completion** tie-break
(currently album order among countries with equal remaining-after-trade).
