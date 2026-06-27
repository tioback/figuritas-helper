/*
 * Figuritas Trade Matcher - core logic + album data.
 *
 * Plain (non-module) script: exposes a global `FH` namespace so the page and
 * the test runner work when opened directly from the filesystem (file://) as
 * well as when hosted on GitHub Pages. No build step, no dependencies.
 */
var FH = (function () {
  'use strict';

  // Album sequence: [code, lo, hi] in page order. FWC appears twice because its
  // stickers are split across album pages, but it is a SINGLE group sharing one
  // number sequence (1-19); the per-line icons in the app export only mark pages.
  var ALBUM = [
    ['FWC', 1, 8],
    ['MEX', 1, 20], ['RSA', 1, 20], ['KOR', 1, 20], ['CZE', 1, 20],
    ['CAN', 1, 20], ['BIH', 1, 20], ['QAT', 1, 20], ['SUI', 1, 20],
    ['BRA', 1, 20], ['MAR', 1, 20], ['HAI', 1, 20], ['SCO', 1, 20],
    ['USA', 1, 20], ['PAR', 1, 20], ['AUS', 1, 20], ['TUR', 1, 20],
    ['GER', 1, 20], ['CUW', 1, 20], ['CIV', 1, 20], ['ECU', 1, 20],
    ['NED', 1, 20], ['JPN', 1, 20], ['SWE', 1, 20], ['TUN', 1, 20],
    ['BEL', 1, 20], ['EGY', 1, 20], ['IRN', 1, 20], ['NZL', 1, 20],
    ['ESP', 1, 20], ['CPV', 1, 20], ['KSA', 1, 20], ['URU', 1, 20],
    ['FRA', 1, 20], ['SEN', 1, 20], ['IRQ', 1, 20], ['NOR', 1, 20],
    ['ARG', 1, 20], ['ALG', 1, 20], ['AUT', 1, 20], ['JOR', 1, 20],
    ['POR', 1, 20], ['COD', 1, 20], ['UZB', 1, 20], ['COL', 1, 20],
    ['ENG', 1, 20], ['CRO', 1, 20], ['GHA', 1, 20], ['PAN', 1, 20],
    ['FWC', 9, 19],
    ['CC', 1, 14]
  ];

  // Canonical country order (unique codes, first appearance).
  var ALBUM_ORDER = [];
  // code -> Set of every valid number for that country (union of its ranges).
  var COUNTRY_NUMBERS = {};
  ALBUM.forEach(function (entry) {
    var code = entry[0], lo = entry[1], hi = entry[2];
    if (ALBUM_ORDER.indexOf(code) === -1) ALBUM_ORDER.push(code);
    if (!COUNTRY_NUMBERS[code]) COUNTRY_NUMBERS[code] = new Set();
    for (var n = lo; n <= hi; n++) COUNTRY_NUMBERS[code].add(n);
  });

  function albumIndex(code) {
    var i = ALBUM_ORDER.indexOf(code);
    return i === -1 ? ALBUM_ORDER.length : i;
  }

  // Matches a data line "CODE EMOJI: n, n, n". Header/footer lines (no colon
  // immediately followed by a number list) are skipped. The left side may hold a
  // 2- or 3-letter code (e.g. CC) plus an optional emoji/flag.
  var LINE_RE = /^\s*(.+?):\s*(\d+(?:\s*,\s*\d+)*)\s*$/;

  /**
   * Parse a Figuritas export into a Map: code -> { emoji, numbers:Set<number>,
   * numberEmoji:Map<number,string> }. Lines that share a code (e.g. the FWC
   * icons) are merged into one group, but the icon actually printed next to
   * each number is kept per-number in `numberEmoji` — some codes (FWC) are
   * exported across several lines with different page icons, and which icon
   * is "first" depends only on incidental line order in the pasted text.
   * `emoji` keeps the first non-empty icon seen as a last-resort fallback for
   * numbers that never appear on an icon-bearing line.
   */
  function parseList(text) {
    var map = new Map();
    (text || '').split(/\r?\n/).forEach(function (rawLine) {
      var m = LINE_RE.exec(rawLine);
      if (!m) return;
      var left = m[1].trim();
      var tokens = left.split(/\s+/);
      var code = tokens[0];
      var emoji = tokens.slice(1).join(' ');
      if (!map.has(code)) map.set(code, { emoji: emoji, numbers: new Set(), numberEmoji: new Map() });
      var group = map.get(code);
      if (!group.emoji && emoji) group.emoji = emoji;
      m[2].split(',').forEach(function (part) {
        var n = parseInt(part.trim(), 10);
        if (isNaN(n)) return;
        group.numbers.add(n);
        if (emoji) group.numberEmoji.set(n, emoji);
      });
    });
    return map;
  }

  // The icon to show for a specific number: prefer whichever side actually
  // tagged that exact number with an icon (giver, then receiver), and only
  // fall back to a group-level guess if neither did. This keeps the icon
  // choice tied to the number itself rather than to input line order.
  function iconFor(n, giver, receiver) {
    return giver.numberEmoji.get(n) ||
      (receiver && receiver.numberEmoji.get(n)) ||
      giver.emoji || (receiver && receiver.emoji) || '';
  }

  // Intersection of the giver's repeated stickers with the receiver's missing
  // stickers, per country. Returns Map: code -> { numbers:Set, numberEmoji:Map }.
  function intersect(giverRepeated, receiverMissing) {
    var out = new Map();
    giverRepeated.forEach(function (group, code) {
      var wanted = receiverMissing.get(code);
      if (!wanted) return;
      var numbers = new Set();
      var numberEmoji = new Map();
      group.numbers.forEach(function (n) {
        if (!wanted.numbers.has(n)) return;
        numbers.add(n);
        var icon = iconFor(n, group, wanted);
        if (icon) numberEmoji.set(n, icon);
      });
      if (numbers.size) out.set(code, { numbers: numbers, numberEmoji: numberEmoji });
    });
    return out;
  }

  /**
   * Split a giver's repeated stickers against a receiver's missing map into two
   * ordered lists of { code, numbers:number[], numberEmoji:Map } in album order:
   *   useful — the receiver is missing these (giver.repeated ∩ receiver.missing)
   *   extra  — repeats the receiver already owns (giver.repeated \ receiver.missing)
   * Within each country numbers are ascending. `total` counts the stickers.
   */
  function splitRepeats(giverRepeated, receiverMissing) {
    var useful = [], extra = [];
    giverRepeated.forEach(function (group, code) {
      var wanted = receiverMissing.get(code);
      var u = [], e = [];
      var uIcons = new Map(), eIcons = new Map();
      group.numbers.forEach(function (n) {
        var icon = iconFor(n, group, wanted);
        if (wanted && wanted.numbers.has(n)) {
          u.push(n);
          if (icon) uIcons.set(n, icon);
        } else {
          e.push(n);
          if (icon) eIcons.set(n, icon);
        }
      });
      if (u.length) useful.push({ code: code, numbers: u, numberEmoji: uIcons });
      if (e.length) extra.push({ code: code, numbers: e, numberEmoji: eIcons });
    });
    function byAlbum(x, y) { return albumIndex(x.code) - albumIndex(y.code); }
    function sortNums(list) {
      list.forEach(function (g) { g.numbers.sort(function (a, b) { return a - b; }); });
      list.sort(byAlbum);
    }
    sortNums(useful); sortNums(extra);
    return {
      useful: useful,
      extra: extra,
      usefulCount: useful.reduce(function (s, g) { return s + g.numbers.length; }, 0),
      extraCount: extra.reduce(function (s, g) { return s + g.numbers.length; }, 0)
    };
  }

  // Build a trade Map (code -> { numbers:Set, numberEmoji:Map }) by taking up
  // to `limit` stickers, useful (receiver's missing) first then extra repeats,
  // preserving album order. limit === null means take everything useful only.
  function buildTrade(split, limit) {
    var out = new Map();
    var remaining = (limit === null) ? Infinity : limit;
    function take(list) {
      list.forEach(function (g) {
        if (remaining <= 0) return;
        var picked = (g.numbers.length <= remaining) ? g.numbers : g.numbers.slice(0, remaining);
        if (!picked.length) return;
        remaining -= picked.length;
        var entry = out.get(g.code);
        if (!entry) { entry = { numbers: new Set(), numberEmoji: new Map() }; out.set(g.code, entry); }
        picked.forEach(function (n) {
          entry.numbers.add(n);
          var icon = g.numberEmoji.get(n);
          if (icon) entry.numberEmoji.set(n, icon);
        });
      });
    }
    take(split.useful);
    if (limit !== null) take(split.extra);
    return out;
  }

  /**
   * Compute both trade directions.
   * personA / personB: { missing:Map, repeated:Map } (from parseList).
   * opts (optional): { even, aAccepts, bAccepts } — all default false.
   *   even      — limit both directions to the same count (the minimum either
   *               person can give the other).
   *   aAccepts  — Person A accepts receiving repeated stickers, so B may give A
   *               more than A is missing (raising the even-match minimum).
   *   bAccepts  — Person B accepts receiving repeated stickers (symmetric).
   * Returns { aGivesToB, bGivesToA } as Maps (code -> { numbers:Set, numberEmoji:Map }).
   */
  function computeTrades(personA, personB, opts) {
    opts = opts || {};
    if (!opts.even) {
      // Default behaviour: each gives every repeat the other is missing.
      return {
        aGivesToB: intersect(personA.repeated, personB.missing),
        bGivesToA: intersect(personB.repeated, personA.missing)
      };
    }
    var aToB = splitRepeats(personA.repeated, personB.missing);
    var bToA = splitRepeats(personB.repeated, personA.missing);
    // Capacity = useful only, unless the receiver accepts repeats (then the
    // giver may also hand over its remaining repeats = its full repeated count).
    var capAB = opts.bAccepts ? aToB.usefulCount + aToB.extraCount : aToB.usefulCount;
    var capBA = opts.aAccepts ? bToA.usefulCount + bToA.extraCount : bToA.usefulCount;
    var target = Math.min(capAB, capBA);
    return {
      aGivesToB: buildTrade(aToB, target),
      bGivesToA: buildTrade(bToA, target)
    };
  }

  /**
   * Order a trade Map for display.
   * mode "sequential": country lines in album order, numbers ascending.
   * mode "completion": countries the recipient is closest to finishing first
   *   (fewest still-missing after the trade; 0 = country completed), tie-break
   *   by album order.
   * recipientMissing is the receiver's parsed `missing` Map (used by completion).
   * Country block order never depends on icon assignment, but a single code can
   * still expand into more than one output line (see splitByIcon) when its
   * numbers were tagged with more than one icon.
   * Returns an array of { code, emoji, numbers:number[] }.
   */
  function orderTrades(tradeMap, recipientMissing, mode) {
    var codeEntries = [];
    tradeMap.forEach(function (group, code) {
      codeEntries.push({
        code: code,
        numbers: Array.from(group.numbers).sort(function (a, b) { return a - b; }),
        numberEmoji: group.numberEmoji
      });
    });

    if (mode === 'completion') {
      codeEntries.sort(function (x, y) {
        var rx = remainingAfterTrade(x, recipientMissing);
        var ry = remainingAfterTrade(y, recipientMissing);
        if (rx !== ry) return rx - ry;
        return albumIndex(x.code) - albumIndex(y.code);
      });
    } else {
      codeEntries.sort(function (x, y) {
        return albumIndex(x.code) - albumIndex(y.code);
      });
    }

    var lines = [];
    codeEntries.forEach(function (ce) {
      splitByIcon(ce).forEach(function (line) { lines.push(line); });
    });
    return lines;
  }

  // A code's numbers can carry more than one icon (FWC spans trophy/globe/
  // scroll pages). Group its ascending numbers by the icon each was actually
  // tagged with, so a country renders as one line per real page icon — output
  // groups are ordered by their smallest number, independent of which side
  // (giver/receiver) recorded the icon or what order its lines were pasted in.
  function splitByIcon(codeEntry) {
    var order = [];
    var groups = new Map();
    codeEntry.numbers.forEach(function (n) {
      var icon = codeEntry.numberEmoji.get(n) || '';
      if (!groups.has(icon)) { groups.set(icon, []); order.push(icon); }
      groups.get(icon).push(n);
    });
    return order.map(function (icon) {
      return { code: codeEntry.code, emoji: icon, numbers: groups.get(icon) };
    });
  }

  function remainingAfterTrade(entry, recipientMissing) {
    var miss = recipientMissing && recipientMissing.get(entry.code);
    if (!miss) return 0; // recipient already had the whole country.
    // Only count traded numbers the recipient was actually missing; repeat
    // top-ups (numbers the recipient already owns) reduce nothing.
    var filled = 0;
    entry.numbers.forEach(function (n) { if (miss.numbers.has(n)) filled++; });
    return miss.numbers.size - filled;
  }

  // Render ordered trades back into the app's list format.
  function formatList(orderedTrades) {
    if (!orderedTrades.length) return '';
    return orderedTrades.map(function (e) {
      var label = e.emoji ? e.code + ' ' + e.emoji : e.code;
      return label + ': ' + e.numbers.join(', ');
    }).join('\n');
  }

  return {
    ALBUM: ALBUM,
    ALBUM_ORDER: ALBUM_ORDER,
    COUNTRY_NUMBERS: COUNTRY_NUMBERS,
    parseList: parseList,
    computeTrades: computeTrades,
    orderTrades: orderTrades,
    formatList: formatList
  };
})();

// Make available to a CommonJS-style require if ever needed (harmless in browser).
if (typeof module !== 'undefined' && module.exports) module.exports = FH;
