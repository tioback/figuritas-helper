/*
 * Figuritas Trade Matcher - UI internationalization (i18n).
 *
 * Plain (non-module) script: exposes a global `I18N` namespace, the same
 * contract used by `app.js` (FH) and `fixtures.js` (FIXTURES), so the page
 * works when opened directly from the filesystem (file://) as well as when
 * hosted on GitHub Pages. No build step, no dependencies.
 *
 * NOTE: This only localizes the tool's own UI chrome. The Figuritas app
 * export keywords that appear in the input data (`Faltantes`, `Repetidas`,
 * `Figurinhas App - Lista`, `Baixe o app`) are part of the data format and are
 * never translated here.
 */
var I18N = (function () {
  // One flat key -> string map per language. `subtitle` carries trusted,
  // static <strong> markup. `stickers` is a { one, other } shape consumed by
  // plural(). Add a language by adding a table with the same key set.
  var STRINGS = {
    'en': {
      title: 'Figuritas Trade Matcher',
      heading: 'Figuritas Trade Matcher',
      subtitle: "Paste each person's <strong>Faltantes</strong> and <strong>Repetidas</strong> exports. " +
                'The tool finds which repeats each one should hand to the other.',
      personA: 'Person A',
      personB: 'Person B',
      labelMissing: 'Faltantes (missing)',
      labelRepeated: 'Repetidas (repeated)',
      phMissingA: 'Figurinhas App - Lista\nFaltantes\nMEX 🇲🇽: 1, 7, 12 …',
      phRepeatedA: 'Figurinhas App - Lista\nRepetidas\nMEX 🇲🇽: 9, 16 …',
      phMissingB: 'Figurinhas App - Lista\nFaltantes\n…',
      phRepeatedB: 'Figurinhas App - Lista\nRepetidas\n…',
      orderByA: 'Order stickers A receives by',
      orderByB: 'Order stickers B receives by',
      optSequential: 'Album Sequence',
      optCompletion: 'Closest to Completion',
      repeats: 'Repeats',
      allowRepeats: 'Accept exchanging repeated stickers',
      btnCompare: 'Compare',
      evenMatching: 'Even matching',
      btnSample: 'Load sample data',
      btnClear: 'Clear',
      btnReset: 'Reset',
      tipEven: 'Balances the trade so each person hands over the same total number of stickers — the smaller of the two piles.',
      tipAllowRepeats: 'Lets this person receive stickers they already have, used to top up an even trade.',
      tipSequential: 'Lists the stickers this person receives in album (country) order.',
      tipCompletion: 'Lists the stickers this person receives so countries closest to being completed come first.',
      giveToB: 'Give these to B',
      giveToA: 'Give these to A',
      footer: 'Static page — no data leaves your browser. Source: app.js. Run the tests by opening test.html.',
      nothingToTrade: 'Nothing to trade.',
      langLabel: 'Language',
      stickers: { one: 'sticker', other: 'stickers' }
    },
    'pt-BR': {
      title: 'Auxiliar de Troca de Figurinhas',
      heading: 'Auxiliar de Troca de Figurinhas',
      subtitle: 'Cole as listas de <strong>Faltantes</strong> e <strong>Repetidas</strong> de cada pessoa. ' +
                'A ferramenta descobre quais repetidas cada uma deve passar para a outra.',
      personA: 'Pessoa A',
      personB: 'Pessoa B',
      labelMissing: 'Faltantes',
      labelRepeated: 'Repetidas',
      phMissingA: 'Figurinhas App - Lista\nFaltantes\nMEX 🇲🇽: 1, 7, 12 …',
      phRepeatedA: 'Figurinhas App - Lista\nRepetidas\nMEX 🇲🇽: 9, 16 …',
      phMissingB: 'Figurinhas App - Lista\nFaltantes\n…',
      phRepeatedB: 'Figurinhas App - Lista\nRepetidas\n…',
      orderByA: 'Ordenar figurinhas que A recebe por',
      orderByB: 'Ordenar figurinhas que B recebe por',
      optSequential: 'Sequência do Álbum',
      optCompletion: 'Mais Perto de Completar',
      repeats: 'Repetidas',
      allowRepeats: 'Aceitar troca de figurinhas repetidas',
      btnCompare: 'Comparar',
      evenMatching: 'Troca equilibrada',
      btnSample: 'Carregar dados de exemplo',
      btnClear: 'Limpar',
      btnReset: 'Redefinir',
      tipEven: 'Equilibra a troca para que cada pessoa entregue a mesma quantidade total de figurinhas — o menor dos dois montes.',
      tipAllowRepeats: 'Permite que esta pessoa receba figurinhas que já tem, usado para completar uma troca equilibrada.',
      tipSequential: 'Lista as figurinhas que esta pessoa recebe na ordem do álbum (por país).',
      tipCompletion: 'Lista as figurinhas que esta pessoa recebe colocando primeiro os países mais perto de completar.',
      giveToB: 'Dê estas para B',
      giveToA: 'Dê estas para A',
      footer: 'Página estática — nenhum dado sai do seu navegador. Fonte: app.js. Rode os testes abrindo test.html.',
      nothingToTrade: 'Nada para trocar.',
      langLabel: 'Idioma',
      stickers: { one: 'figurinha', other: 'figurinhas' }
    },
    'es': {
      title: 'Figuritas Trade Matcher',
      heading: 'Figuritas Trade Matcher',
      subtitle: 'Pega las listas de <strong>Faltantes</strong> y <strong>Repetidas</strong> de cada persona. ' +
                'La herramienta calcula qué repetidas debe pasar cada una a la otra.',
      personA: 'Persona A',
      personB: 'Persona B',
      labelMissing: 'Faltantes',
      labelRepeated: 'Repetidas',
      phMissingA: 'Figurinhas App - Lista\nFaltantes\nMEX 🇲🇽: 1, 7, 12 …',
      phRepeatedA: 'Figurinhas App - Lista\nRepetidas\nMEX 🇲🇽: 9, 16 …',
      phMissingB: 'Figurinhas App - Lista\nFaltantes\n…',
      phRepeatedB: 'Figurinhas App - Lista\nRepetidas\n…',
      orderByA: 'Ordenar las figuritas que recibe A por',
      orderByB: 'Ordenar las figuritas que recibe B por',
      optSequential: 'Secuencia del Album',
      optCompletion: 'Más cerca de Compleción',
      repeats: 'Repetidas',
      allowRepeats: 'Aceptar intercambio de figuritas repetidas',
      btnCompare: 'Comparar',
      evenMatching: 'Intercambio equilibrado',
      btnSample: 'Cargar datos de ejemplo',
      btnClear: 'Limpiar',
      btnReset: 'Restablecer',
      tipEven: 'Equilibra el intercambio para que cada persona entregue la misma cantidad total de figuritas — el menor de los dos montones.',
      tipAllowRepeats: 'Permite que esta persona reciba figuritas que ya tiene, usado para completar un intercambio equilibrado.',
      tipSequential: 'Lista las figuritas que esta persona recibe en el orden del álbum (por país).',
      tipCompletion: 'Lista las figuritas que esta persona recibe poniendo primero los países más cerca de completarse.',
      giveToB: 'Dá estas a B',
      giveToA: 'Dá estas a A',
      footer: 'Página estática — ningún dato sale de tu navegador. Fuente: app.js. Corré las pruebas abriendo test.html.',
      nothingToTrade: 'Nada para intercambiar.',
      langLabel: 'Idioma',
      stickers: { one: 'figurita', other: 'figuritas' }
    }
  };

  var STORAGE_KEY = 'fh_lang';
  var DEFAULT_LANG = 'pt-BR';
  var current = DEFAULT_LANG;

  function has(code) {
    return Object.prototype.hasOwnProperty.call(STRINGS, code);
  }

  // localStorage may throw (privacy mode, file://) - never let it break the UI.
  function readStored() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function writeStored(code) {
    try { window.localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* ignore */ }
  }

  // Saved choice wins; otherwise map the browser language (pt* -> pt-BR,
  // es* -> es) and fall back to English.
  function detect() {
    var saved = readStored();
    if (saved && has(saved)) return saved;
    var nav = (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) || '';
    nav = nav.toLowerCase();
    if (nav.indexOf('pt') === 0) return 'pt-BR';
    if (nav.indexOf('es') === 0) return 'es';
    return DEFAULT_LANG;
  }

  function getLang() { return current; }

  function setLang(code) {
    current = has(code) ? code : DEFAULT_LANG;
    writeStored(current);
    return current;
  }

  // Look up `key` in the current language, falling back to English, then to
  // the raw key so a missing string is visible rather than blank.
  function lookup(key) {
    var table = STRINGS[current] || STRINGS[DEFAULT_LANG];
    if (Object.prototype.hasOwnProperty.call(table, key)) return table[key];
    if (Object.prototype.hasOwnProperty.call(STRINGS[DEFAULT_LANG], key)) return STRINGS[DEFAULT_LANG][key];
    return key;
  }

  function t(key) {
    var val = lookup(key);
    return (typeof val === 'string') ? val : key;
  }

  // English-style plural selection (one vs other); adequate for the languages
  // we ship. `key` must resolve to a { one, other } entry.
  function plural(key, n) {
    var val = lookup(key);
    if (!val || typeof val !== 'object') return key;
    return (n === 1) ? val.one : val.other;
  }

  // Walk the DOM under `root` and localize tagged elements.
  function apply(root) {
    root = root || document;
    var i, els, el;

    els = root.querySelectorAll('[data-i18n]');
    for (i = 0; i < els.length; i++) {
      el = els[i];
      el.textContent = t(el.getAttribute('data-i18n'));
    }

    els = root.querySelectorAll('[data-i18n-html]');
    for (i = 0; i < els.length; i++) {
      el = els[i];
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    }

    els = root.querySelectorAll('[data-i18n-placeholder]');
    for (i = 0; i < els.length; i++) {
      el = els[i];
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    }

    // Help tooltips: `data-tip` feeds the CSS bubble, `aria-label` the
    // screen reader; both kept in sync with the active language.
    els = root.querySelectorAll('[data-i18n-tip]');
    for (i = 0; i < els.length; i++) {
      el = els[i];
      var tip = t(el.getAttribute('data-i18n-tip'));
      el.setAttribute('data-tip', tip);
      el.setAttribute('aria-label', tip);
    }

    if (document && document.documentElement) document.documentElement.lang = current;
  }

  return {
    STRINGS: STRINGS,
    detect: detect,
    getLang: getLang,
    setLang: setLang,
    t: t,
    plural: plural,
    apply: apply
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = I18N;
