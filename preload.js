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
  // Add a word to the in-memory dictionary. nspell's .add() adds it for
  // the session — for persistence across restarts we also save it to a
  // custom words file in the user data directory.
  addWord(word, lang) {
    if (!word) return false;
    const w = word.toLowerCase();
    try {
      if (lang === 'en' && spellEN) spellEN.add(w);
      else if (lang === 'es' && spellES) spellES.add(w);
      else {
        if (spellEN) spellEN.add(w);
        if (spellES) spellES.add(w);
      }
      // Persist to a custom words file
      const os = require('os');
      const fs2 = require('fs');
      const path2 = require('path');
      const userDataDir = path2.join(os.homedir(), '.config', 'lecturnote');
      if (!fs2.existsSync(userDataDir)) fs2.mkdirSync(userDataDir, { recursive: true });
      const customFile = path2.join(userDataDir, 'custom-words.txt');
      fs2.appendFileSync(customFile, `${w}\t${lang || 'both'}\n`);
      return true;
    } catch(e) {
      console.error('[lecturnote] addWord error:', e.message);
      return false;
    }
  },
});

// Load custom words that were added in previous sessions
try {
  const os = require('os');
  const fs2 = require('fs');
  const path2 = require('path');
  const customFile = path2.join(os.homedir(), '.config', 'lecturnote', 'custom-words.txt');
  if (fs2.existsSync(customFile)) {
    const content = fs2.readFileSync(customFile, 'utf8');
    for (const line of content.split('\n')) {
      const [w, lang] = line.split('\t');
      if (!w) continue;
      if (lang === 'en' && spellEN) spellEN.add(w);
      else if (lang === 'es' && spellES) spellES.add(w);
      else {
        if (spellEN) spellEN.add(w);
        if (spellES) spellES.add(w);
      }
    }
  }
} catch(e) {
  console.warn('[lecturnote] could not load custom words:', e.message);
}

console.log('[lecturnote] contextBridge.exposeInMainWorld called');
