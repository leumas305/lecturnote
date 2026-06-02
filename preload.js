const { contextBridge } = require('electron');

// Minimal test — if this works, window.hunspell.ready will be false
// but window.hunspell will exist (not undefined)
console.log('[lecturnote] preload executing, contextBridge:', typeof contextBridge);

let spellEN = null;
let spellES = null;
let loadError = null;

try {
  const NSpell = require('nspell');
  const fs   = require('fs');
  const path = require('path');
  const dictDir = path.join(__dirname, 'dict');
  console.log('[lecturnote] loading dicts from', dictDir);
  spellEN = NSpell(
    fs.readFileSync(path.join(dictDir, 'en.aff'), 'utf8'),
    fs.readFileSync(path.join(dictDir, 'en.dic'), 'utf8')
  );
  spellES = NSpell(
    fs.readFileSync(path.join(dictDir, 'es.aff'), 'utf8'),
    fs.readFileSync(path.join(dictDir, 'es.dic'), 'utf8')
  );
  console.log('[lecturnote] spellers ready. hello=', spellEN.correct('hello'));
} catch(e) {
  loadError = e.message;
  console.error('[lecturnote] error:', e.message);
}

contextBridge.exposeInMainWorld('hunspell', {
  ready: !!(spellEN && spellES),
  loadError: loadError,
  correct(word, lang) {
    const w = word.toLowerCase();
    if (lang === 'en') return spellEN ? spellEN.correct(w) : true;
    if (lang === 'es') return spellES ? spellES.correct(w) : true;
    return (spellEN ? spellEN.correct(w) : false) || (spellES ? spellES.correct(w) : false);
  },
  suggest(word, lang) {
    const w = word.toLowerCase();
    if (lang === 'en') return spellEN ? spellEN.suggest(w) : [];
    if (lang === 'es') return spellES ? spellES.suggest(w) : [];
    const en = spellEN ? spellEN.suggest(w) : [];
    const es = spellES ? spellES.suggest(w) : [];
    const merged = [], seen = new Set();
    const max = Math.max(en.length, es.length);
    for (let i = 0; i < max; i++) {
      if (en[i] && !seen.has(en[i])) { merged.push(en[i]); seen.add(en[i]); }
      if (es[i] && !seen.has(es[i])) { merged.push(es[i]); seen.add(es[i]); }
    }
    return merged;
  },
});

console.log('[lecturnote] contextBridge.exposeInMainWorld called');
