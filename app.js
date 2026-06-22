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
   * Parse a Figuritas export into a Map: code -> { emoji, numbers:Set<number> }.
   * Lines that share a code (e.g. the FWC icons) are merged into one group.
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
      if (!map.has(code)) map.set(code, { emoji: emoji, numbers: new Set() });
      var group = map.get(code);
      if (!group.emoji && emoji) group.emoji = emoji;
      m[2].split(',').forEach(function (part) {
        var n = parseInt(part.trim(), 10);
        if (!isNaN(n)) group.numbers.add(n);
      });
    });
    return map;
  }

  // Intersection of the giver's repeated stickers with the receiver's missing
  // stickers, per country. Returns Map: code -> { emoji, numbers:Set }.
  function intersect(giverRepeated, receiverMissing) {
    var out = new Map();
    giverRepeated.forEach(function (group, code) {
      var wanted = receiverMissing.get(code);
      if (!wanted) return;
      var numbers = new Set();
      group.numbers.forEach(function (n) {
        if (wanted.numbers.has(n)) numbers.add(n);
      });
      if (numbers.size) {
        var emoji = group.emoji || wanted.emoji || '';
        out.set(code, { emoji: emoji, numbers: numbers });
      }
    });
    return out;
  }

  /**
   * Compute both trade directions.
   * personA / personB: { missing:Map, repeated:Map } (from parseList).
   * Returns { aGivesToB, bGivesToA } as Maps (code -> { emoji, numbers:Set }).
   */
  function computeTrades(personA, personB) {
    return {
      aGivesToB: intersect(personA.repeated, personB.missing),
      bGivesToA: intersect(personB.repeated, personA.missing)
    };
  }

  /**
   * Order a trade Map for display.
   * mode "sequential": country lines in album order, numbers ascending.
   * mode "completion": countries the recipient is closest to finishing first
   *   (fewest still-missing after the trade; 0 = country completed), tie-break
   *   by album order.
   * recipientMissing is the receiver's parsed `missing` Map (used by completion).
   * Returns an array of { code, emoji, numbers:number[] }.
   */
  function orderTrades(tradeMap, recipientMissing, mode) {
    var entries = [];
    tradeMap.forEach(function (group, code) {
      entries.push({
        code: code,
        emoji: group.emoji || '',
        numbers: Array.from(group.numbers).sort(function (a, b) { return a - b; })
      });
    });

    if (mode === 'completion') {
      entries.sort(function (x, y) {
        var rx = remainingAfterTrade(x, recipientMissing);
        var ry = remainingAfterTrade(y, recipientMissing);
        if (rx !== ry) return rx - ry;
        return albumIndex(x.code) - albumIndex(y.code);
      });
    } else {
      entries.sort(function (x, y) {
        return albumIndex(x.code) - albumIndex(y.code);
      });
    }
    return entries;
  }

  function remainingAfterTrade(entry, recipientMissing) {
    var miss = recipientMissing && recipientMissing.get(entry.code);
    var missingCount = miss ? miss.numbers.size : entry.numbers.length;
    // Traded stickers are a subset of what the recipient is missing.
    return missingCount - entry.numbers.length;
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
