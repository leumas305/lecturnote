# lecturnote

Keyboard-first lecture notes editor for Computational Biology, Bioinformatics, and Mathematics.
Built with Electron — runs as a native desktop app, fully offline, no server required.

**Notes are stored in Electron's localStorage** (`~/.config/lecturnote/` on Linux, `~/Library/Application Support/lecturnote/` on macOS) — they never touch the project files and will not be uploaded to Git.

---

## Setup

Requires **Node.js LTS** — https://nodejs.org

```bash
git clone <your-repo-url>
cd lecturnote-app
npm install
npm start
```

### Build a distributable app

```bash
npm run build-mac     # macOS  → dist/*.dmg
npm run build-win     # Windows → dist/*.exe
npm run build-linux   # Linux  → dist/*.AppImage
```

---

## File structure

```
lecturnote-app/
├── index.html          # Full app UI — edit this to customise commands/snippets
├── main.js             # Electron main process
├── preload.js          # Loads Hunspell spellchecker via Node, exposes to renderer
├── package.json        # Dependencies: electron, electron-builder, nspell
├── dict/
│   ├── en.aff          # Hunspell English affix rules
│   ├── en.dic          # Hunspell English dictionary (~49k words)
│   ├── es.aff          # Hunspell Spanish affix rules
│   └── es.dic          # Hunspell Spanish dictionary (~57k words)
└── README.md
```

---

## Keyboard shortcuts

All shortcuts are remappable via **Ctrl+,** (settings panel).
You can change the key and the modifier family (Ctrl+Alt / Ctrl / Ctrl+Shift) per action.

### Navigation & UI
| Shortcut | Action |
|----------|--------|
| Ctrl+G | Section jump palette |
| Ctrl+Alt+O | Toggle notes sidebar |
| Ctrl+Alt+Z | Toggle scratchpad (not saved) |
| Ctrl+, | Shortcuts settings |

### Formatting
| Shortcut | Action |
|----------|--------|
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+\` | Inline code |
| `(` `[` `{` | Auto-close pair; typing the closing char jumps over it |

### Colored boxes
| Shortcut | Box |
|----------|-----|
| Ctrl+Alt+E | Example (blue) |
| Ctrl+Alt+D | Definition (green) |
| Ctrl+Alt+W | Theorem (purple) |
| Ctrl+Alt+P | Proof (teal) |
| Ctrl+Alt+N | Note (pink) |
| Ctrl+Alt+R | Remark (grey) |
| Ctrl+Alt+! | Warning (amber) |
| Ctrl+Alt+Q | Sequence block (DNA / RNA / AA) |
| Ctrl+Alt+X | Exercise block (with solution toggle) |
| Ctrl+Alt+B | Box picker menu |

### Tables
| Shortcut | Action |
|----------|--------|
| Ctrl+Alt+Y | Open visual table editor |
| Tab / Shift+Tab | Navigate between cells |
| ↑ ↓ ← → | Navigate between cells |
| Ctrl++ | Add row |
| Ctrl+- | Remove last row |
| Ctrl+Shift++ | Add column |
| Ctrl+Shift+- | Remove last column |
| Enter | Confirm and insert |
| Esc | Cancel |

### Code blocks
| Shortcut | Action |
|----------|--------|
| Ctrl+Alt+J | Code language picker |

Language keys: **P** Python · **J** JavaScript · **T** TypeScript · **R** Rust · **C** C++ · **M** Matlab · **L** LaTeX · **B** Bash · **H** HTML · **S** SQL

### Other insert
| Shortcut | Action |
|----------|--------|
| Ctrl+Alt+K | Internal anchor picker |
| Type `[[#` | Inline anchor autocomplete |
| Ctrl+Alt+Space | Timestamp [HH:MM] |
| Ctrl+Alt+M | New note |
| Ctrl+S | Save |
| Ctrl+Shift+S | Export to PDF |

---

## Math syntax

Delimiters: `$(...)$` inline · `$$(...)$$` display block

### Fractions
```
(a)/(b)
```

### Operators with bounds
```
sum(k=0)(n)      int(a)(b)      lim(x->0)      prod(k=1)(n)
sum(k=0)         int(a)
```

### Functions
```
sqrt(x)          sqrt(n)(x)     binom(n)(k)
abs(x)           norm(x)        floor(x)       ceil(x)
```

### Decorators
```
vec(x)  hat(x)  bar(x)  tilde(x)  over(x)  under(x)
obrace(x)(label)     ubrace(x)(label)     text(word)
```

### Matrices
```
mat(2x3)                              # empty matrix with · placeholders
mat(3x3)[1,0,0,0,1,0,0,0,1]          # filled matrix, left-to-right top-to-bottom
mat(2x2)[alpha, beta, (1)/(2), 0]     # math expressions as values
```

### Greek letters
```
alpha beta gamma delta epsilon zeta eta theta iota kappa lambda
mu nu xi pi rho sigma tau upsilon phi chi psi omega
Gamma Delta Theta Lambda Xi Pi Sigma Upsilon Phi Psi Omega
```

### Number sets
```
RR  ZZ  QQ  NN  CC  FF
```

### Logic & sets
```
forall  exists  nexists  not  and  or  implies  iff
in  notin  subset  supset  subseteq  supseteq  cup  cap  emptyset  setminus
```

### Relations & operators
```
neq  approx  equiv  leq  geq  ll  gg  sim  propto   >=  <=  !=
pm  mp  xx  cdot  circ  div  oplus  otimes  oslash
nabla  partial  inf
```

### Arrows
```
->   =>   <-   <=>   ~>   uparrow   downarrow
```

### Misc
```
dots  cdots  vdots  ddots  deg  prime  star  dagger
cases   # piecewise template
```

---

## Sequence blocks

```
:::sequence
DNA
ATGCATGCATGC
:::
```

First line sets the type: `DNA` (default), `RNA`, `AA` / `PROTEIN`.
FASTA headers (`>seq_id`) are rendered in muted grey.

**Base colors:**
- DNA: A=green  T=red  G=amber  C=blue
- RNA: A=green  U=pink  G=amber  C=blue  (T not valid in RNA)
- AA: hydrophobic=purple · polar=teal · +charged=blue · −charged=red · G=amber

---

## Graph / concept map diagrams

```
:::graph LR
a: Node A
b: Node B
c: Node C

a -> b : label
a --> c
b -- c
a -.-> c : optional
:::
```

**Directions:** `LR` · `TD` · `RL` · `BT` (default: `LR`)

**Edge types:**
| Syntax | Style |
|--------|-------|
| `a -> b` | Directed arrow |
| `a --> b` | Bold directed arrow |
| `a -- b` | Undirected line |
| `a -.-> b` | Dashed arrow |
| `a -> b : label` | Any type with label |

Undeclared node IDs are auto-created with the ID as label.
Layout computed automatically via Sugiyama algorithm (dagre).

---

## Exercises

```
:::exercise Exercise name
Problem statement here.
:::solution
Solution here.
:::
```

- Reference chip appears in-place: `◆ Exercise 1 · name`
- All exercises collected at the bottom of the preview
- Solutions hidden by default with toggle button
- On PDF export, all solutions are always visible
- **Tab** cycles: exercise name → problem → solution

---

## Table of contents & section numbering

Write `%index%` anywhere in your note and press Space or Enter to insert a clickable TOC.

`##`, `###`, `####` headings are automatically numbered in the preview:
```
## Introduction       →  1. Introduction
## Methods            →  2. Methods
### Data collection   →  2.1 Data collection
```
The `#` title is never numbered. Numbers appear only in the preview — raw markdown stays clean.

---

## Snippets

Type a key then press **Tab** to expand:

| Key | Expands to |
|-----|-----------|
| `pcr` | PCR protocol template |
| `seq` | Empty sequence block |
| `fasta` | FASTA format template |
| `align` | Sequence alignment display |
| `phylo` | Phylogenetic tree graph |
| `smith` | Smith-Waterman parameters |
| `blast` | BLAST parameters |
| `pf` | Proof box |
| `thm` | Theorem box |
| `def` | Definition box |
| `matrix` | 2×2 matrix |
| `cases` | Piecewise cases |
| `todo` | Checkbox item |
| `date` | Today's date |

**Adding snippets:** open `index.html`, find `SNIPPETS` in the commands block:
```js
'mykey': 'expanded text with \\n for newlines',
```

---

## Tags

Write `#tagname` on the **line immediately after `# Title`** — that line must contain only tags:

```
# Lecture 5
#sequence-alignment #dynamic-programming
```

Tags appear as filter chips in the sidebar. Click to filter. Deleting a note removes its tags.

---

## Autocorrect

Fires on spacebar or Enter. Green flash = correction applied.

**Two layers:**
1. **Explicit dict** — the `AUTOCORRECT` map in `index.html`. Exact match, always wins.
2. **Hunspell** — real spell-checking using the `.aff`/`.dic` files in `dict/`:
   - English: ~49,000 words with full morphology
   - Spanish: ~57,000 words with full morphology

**Dictionary selector** (top bar): English / Spanish / Both / Off

**Adding explicit corrections:** find `AUTOCORRECT` in `index.html`:
```js
'mytypo': 'correction',
```

---

## Internal anchor links

- Type `[[#` → autocomplete dropdown, filter and Enter to confirm
- Or press **Ctrl+Alt+K** → heading picker

Clicking an anchor in the preview scrolls to that heading with a highlight flash.

---

## Scratchpad

**Ctrl+Alt+Z** opens a floating temporary notepad. Not saved. **Esc** or **Ctrl+Alt+Z** to close.

---

## Image paste

Copy any image to clipboard and **Ctrl+V** in the editor — embeds as base64, renders immediately.

---

## PDF export

**Ctrl+Shift+S** → print dialog → Save as PDF.

- Only preview is printed, editor hidden
- Exercises section included with all solutions visible
- `page-break-inside: avoid` on boxes, tables, code blocks
- Page size: A4, 2cm top/bottom, 2.5cm left/right

---

## Customisation

Open `index.html` in any text editor. Find the banner at the top of the `<script>` block:

```
╔══════════════════════════════════════════════════════════════════════════╗
║  LECTURNOTE COMMANDS  — edit this section freely                        ║
```

Editable sections:
- `MATH_FUNCTIONS` — new structured math commands
- `MATH_SYMBOLS` — new symbol shorthands
- `SNIPPETS` — subject-specific text expansions
- `AUTOCORRECT` — explicit typo corrections

Restart the app after editing (`npm start`).

---

## Terminal warning (Linux)

```
GetVSyncParametersIfAvailable() failed
```

Harmless Linux GPU driver message. Suppress with:
```js
// in main.js
app.commandLine.appendSwitch('disable-gpu-vsync');
```

---
## Feedback
You can leave some feedback (wether it's bugs found or comments) at: https://github.com/leumas305/lecturnote/issues

## Notes on future work

- **BK-tree** — for real-time lookup against larger custom dictionaries
- **Note export/import** — backup all notes to `.json` and restore
- **Inter-note links** — `[[note:Title]]` to link between different notes
