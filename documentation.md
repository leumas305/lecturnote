# lecturnote — Documentation

Full syntax reference and customisation guide. For setup and shortcuts, see [README.md](README.md).

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
mat(3x3)[1,0,0,0,1,0,0,0,1]          # filled, left-to-right top-to-bottom
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

- A reference chip appears in-place: `◆ Exercise 1 · name`
- All exercises are collected at the bottom of the preview
- Solutions are hidden by default with a toggle button
- On PDF export, all solutions are always visible
- **Tab** cycles: exercise name → problem → solution

---

## Table of contents & section numbering

Write `%index%` anywhere and press Space or Enter to insert a clickable TOC.

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

**Adding your own:** open `index.html`, find `SNIPPETS` in the commands block:
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

Tags appear as filter chips in the sidebar. Click to filter the notes list. Deleting a note removes its tags.

---

## Autocorrect

Fires on spacebar or Enter. Green flash = correction applied.

**Two layers:**
1. **Explicit dict** — the `AUTOCORRECT` map in `index.html`. Exact match, always wins.
2. **Hunspell** — real spell-checking using the `.aff`/`.dic` files in `dict/`:
   - English: ~49,000 words with full morphology
   - Spanish: ~57,000 words with full morphology
   - Knows that `tiro`, `tira`, `absoluta` etc. are correct — won't touch them
   - Suggests `absoluta` for `absotluta`, `palabras` for `parlabras` etc.

**Dictionary selector** (top bar): English / Spanish / Both / Off

**Adding explicit corrections:** find `AUTOCORRECT` in `index.html`:
```js
'mytypo': 'correction',
```

---

## Internal anchor links

- Type `[[#` → autocomplete dropdown appears, filter and Enter to confirm
- Or press **Ctrl+Alt+K** → heading picker

Clicking an anchor in the preview scrolls to that heading with a highlight flash.

---

## Scratchpad

**Ctrl+Alt+Z** opens a floating temporary notepad. Content is not saved between sessions.
Press **Esc** or **Ctrl+Alt+Z** again to close.

---

## Image paste

Copy any image to clipboard and press **Ctrl+V** in the editor.
Embeds as base64 inline and renders immediately in the preview.

---

## PDF export

**Ctrl+Shift+S** → print dialog → Save as PDF.

- Only the preview is printed, editor panel is hidden
- Exercises section is included with all solutions visible
- `page-break-inside: avoid` applied to boxes, tables, and code blocks
- Page size: A4, 2cm top/bottom, 2.5cm left/right

---

## Customisation

Open `index.html` in any text editor. Find the banner at the top of the `<script>` block:

```
╔══════════════════════════════════════════════════════════════════════════╗
║  LECTURNOTE COMMANDS  — edit this section freely                        ║
```

Editable sections:
- `MATH_FUNCTIONS` — add new structured math commands
- `MATH_SYMBOLS` — add new symbol shorthands
- `SNIPPETS` — add subject-specific text expansions
- `AUTOCORRECT` — add explicit typo corrections

Restart the app after editing (`npm start`).

---

## Terminal warning (Linux)

```
GetVSyncParametersIfAvailable() failed
```

Harmless Linux GPU driver message — Electron can't query the display refresh rate.
Suppress it by adding to `main.js`:
```js
app.commandLine.appendSwitch('disable-gpu-vsync');
```
