# Figuritas Trade Matcher

A tiny static web page that compares two people's [Figuritas app](https://www.figuritas.app)
exports and works out which **repeated** stickers each person should hand to the
other (i.e. the repeats one person has that the other is still **missing**).

Pure HTML + JavaScript — no framework, no build step, no server. Just open the
file or drop it on GitHub Pages.

## Usage

1. Open `index.html` in a browser.
2. For each person, paste their **Faltantes** (missing) and **Repetidas**
   (repeated) exports from the app into the labeled boxes.
3. Pick how each person wants the stickers *they receive* ordered:
   - **Sequential** — in album order, numbers ascending.
   - **Completion** — countries the person is closest to finishing first
     (a trade that completes a country floats to the top).
4. Optionally enable **Allow exchanging repeated stickers** under a person — see
   *Even matching* below.
5. Click **Compare**. The two result panes — *Give these to B* and
   *Give these to A* — are in the same app list format, ready to copy/share.

Use **Load sample data** to populate the inputs with the bundled example.

## Even matching

By default each person hands over **every** repeat the other is missing, so a
trade can be lopsided (one person gives 4, the other 2). Tick **Even matching**
(next to *Compare*) to cap both sides to the **same** count — the smaller of
what either person can give.

Each person also has an **Allow exchanging repeated stickers** toggle. Enabling
it means that person accepts receiving stickers they already own, which lets the
other person give more and so raises the even-match count. When topping up like
this, stickers the receiver is **missing** are always handed over first, and
only then the giver's remaining duplicates. With Even matching off these toggles
have no effect.

## How the input is read

Each data line looks like `CODE EMOJI: n, n, n` (e.g. `MEX 🇲🇽: 1, 7, 12`).
Notes baked into the parser:

- **`FWC` is a single group.** The app prints it on several lines with different
  page icons (🏆 / 🌎 / 📜), but all of them share one number sequence (1–19), so
  they are merged. Grouping is by the **3-letter (or `CC` two-letter) code only**;
  the emoji is just kept for display.
- Multi-codepoint flags (e.g. `🏴󠁧󠁢󠁳󠁣󠁴󠁿`) are handled by splitting on the colon
  rather than matching the emoji.
- Header lines (`Figurinhas App - Lista`, the album name, `Faltantes`/`Repetidas`)
  and the `Baixe o app` footer are ignored.

The album page order and each country's full sticker set are embedded in
`app.js` (`ALBUM`), driving the Sequential and Completion ordering.

## Tests

Open **`test.html`** in a browser — it runs the parsing, matching, ordering and
formatting checks against the fixtures in `fixtures.js` and prints a green/red
pass-fail list. No tooling required.

## Hosting on GitHub Pages

The files are already static at the repo root, so:

1. Push to GitHub.
2. **Settings → Pages → Build and deployment → Deploy from a branch**, pick the
   branch and `/ (root)`.
3. The page is served at `https://<user>.github.io/figuritas-helper/`.

## Files

| File           | Purpose                                             |
| -------------- | --------------------------------------------------- |
| `index.html`   | The app UI (inputs, options, results).              |
| `app.js`       | Parsing, matching, ordering, formatting + album data. |
| `fixtures.js`  | Sample exports used by the tests and *Load sample*. |
| `test.html`    | In-browser test runner.                             |
