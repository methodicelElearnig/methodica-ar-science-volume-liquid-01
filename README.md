# methodica-ar-science-volume-liquid-01

**Arabic build** of the 720 learning-module (לומדה) `methodica-science-volume-liquid-01` — a 7th–8th grade science unit on measuring
liquid volume, built as a sequence of parts. Each `methodica-ar-science-volume-liquid-01-0N`
subfolder is one statically-served component (its own `index.html` / `css/` /
`js/` / `assets/`) covering one segment of the unit. Code and assets that are
identical across parts live once, in the shared folders at the repo root.


## Arabic build

This repo is the Arabic twin of `methodica-science-volume-liquid-01`: the learner sees Arabic only, and
the behaviour (screens, scoring, gates, xAPI, resume, routing) is identical to Hebrew `895a4ea`
(2026-10-08). Checked 2026-11-02: with translated text masked out, every `js/main.js` and the
structure of every `index.html` match Hebrew.

**Identity.** Every id is the Hebrew one with `ar/` after `/720active/` and `methodica-ar-` for
`methodica-` (`unit-js/10-identity.js`, `metadata/`). Kata has no Arabic unit: the seven Arabic
components join the Hebrew unit `methodica-science-volume-liquid-01` (`docs-and-tools/send-metadata.ps1`,
parent-unit mode). `XAPI_UNIT_ID` / `learningUnitId` stay `methodica-ar-science-volume-liquid-01`. The
character and nav-edge storage keys and the resume state keys (from the folder names) carry `ar`, so
Hebrew and Arabic state never mix in one browser. Hosting (content, not ids):
`https://lomdot.education.gov.il/metodica/720/ar/science/volume-liquid/01/` (confirmed 2026-11-02).

**Metadata** (supplied 2026-11-02, then aligned with Hebrew behaviour): question ids `…/<item>/qN`
(the supplied `…/?q=qN` broke the item result after a reload, fix O-8); 01-007 q2 is `fill-in` with one
Arabic answer string, as in Hebrew; part 03 `isRequired: true`, as in Hebrew. Kept as supplied:
`languages: ["Arabic"]`, the 06/07 `informationToBot` (assessment: no help), the 07 q1 answers without a
unit, as the dropdown shows them.

**Arabic-only differences from Hebrew** (deliberate):
- Fonts: `Calibri, Arial, sans-serif` everywhere (system fonts, no `@font-face`), including the canvas
  text in part 01.
- Issue report: the learner sees `REPORT_TYPE_DISPLAY` (Arabic); `REPORT_TYPE_LABELS`, the value posted
  to the form all 720 units share, stays Hebrew so the sheet stays filterable (`unit-js/25-report.js`).
- Layout fixes for longer Arabic text: the hint-popup close button (`unit-css/scq.css`), 01 S9 speech
  bubble, the 03 "هل القياسان كافيان؟" dropdown at 15px, the 07 S4 distractor pills.
- Part 05 video: `mE4r3rECnyc` (Hebrew: `lYn6pld-VXM`).
- Arabic images: 06 `recipe-1950-note.png`, `recipe-online.png`; 07 `OrangeJuiceBottle.png`.
- Images edited in place (2026-11-02), only the lettering, same names and sizes: 03 `Adi-Board.png`,
  `Almog-Board.png` ("מדידה N" -> "القياس N", Segoe UI over the handwritten digits, which were kept);
  01 `DrinksAndMeasure.png` (six "מ"ל" -> "ملل" on the two cylinders) and 05 `Bottle-Weight.png`
  ("מ"ל" -> "ملل" under "500 mL"), Arial Bold. A designer may still want to redraw the board headers
  by hand.

No image carries Hebrew lettering any more (checked 2026-11-02, every raster image).

Translation working files at the root (`lomda-transilation.md`, the `.xlf`) never ship: the package
takes no root files.

## Layout

```
unit-css/     shared stylesheets
  base.css              font stack, reset, subject tokens, canvas, flag/continue buttons  (all parts, loaded first)
  scq.css               SingleChoiceQuestion engine styles                           (all parts)
  img-zoom.css          image-zoom button + modal core                               (01 02 03 05 06)
  progress-question.css question-progress nav                                        (02 03 05)
  motion.css            animation-system engine styles                               (all parts)
  nav-buttons.css       back/hint sizing + nav labels                                (all parts, loaded LAST)
  25-report.css         issue-report dialogs                                         (all parts)
unit-js/      shared scripts, loaded before each part's js/main.js (90-boot.js after it)
  10-identity.js        unit IRIs, RESUME_ENABLED, DEV_NAV
  20-xapi.js            xAPI reporting layer (statements built here, sent by the 720 library)
  25-report.js          issue reporting (the one 720 Google form)
  40-resume.js          resume: state document v5, save/flush, per-unit character key
  45-resume-paint.js    painter helpers used by each part's restoreScreenUI
  50-loader.js          loads the 720 xAPI library from the CDN (xapi-720-k.js)
  05-motion.js          animation-system engine
  00-util.js · 30-nav.js · 32-navlabels.js · 35-popup.js · 38-progress.js
  90-boot.js            boot: resume restore, boot cover, first-screen back button
unit-assets/  images used by more than one part (no web fonts: Calibri/Arial, see *Arabic build*)
metadata/     catalogue metadata: <unit>_unit.json + one <unit>-0N.json per component
methodica-ar-science-volume-liquid-01-0N/   index.html, index_dev.html, css/style.css, js/main.js, assets/
_test/        headless regression harness + local stand-in for the 720 library   (never shipped)
docs-and-tools/  packaging, Kata metadata send/retrieve, state reset/save tools   (never shipped)
```

Path rules — they differ by reference type, because each resolves against a
different base: from a part's `index.html` or `js/main.js` a shared file is
`../unit-…/`; from a part's `css/style.css` it is `../../unit-assets/…`; from a
file in `unit-css/` it is `../unit-assets/…`. Every `<link>`/`<script>` carries a
`?v=` cache-buster; a shared file's `?v=` must be identical in all seven
`index.html`. A name declared in `unit-js/` must never be re-declared in a part.

The motion engine files are a verbatim copy of the animation-system skill's
engine (see the banner in each); to update, replace the body with the skill's
file and bump its `?v=` everywhere. Do not reintroduce per-part copies.

## Parts

Result reported by each part at its last click (`xapiEndComponent`):

- **01** — Introduction to liquid volume measurement; measuring-tool
  selection; character selection (carried to every later part, see
  *Character* below). Reports success, no score.
- **02** — The first standard practice series: five questions (a
  meniscus reading-point hotspot, then four single-choice questions)
  with a shared question-progress nav. Score out of 5, success at ≥ 4.
- **03** — Practice questions on volume measurement, reading a graduated
  cylinder, and unit conversion. A gate: 2 of 3 to pass, score out of 3;
  a failed gate ends the part at S3.
- **04** — Reliability of repeated measurements (averaging, consistency).
  Success, no score (S2 is an open, ungraded question).
- **05** — Medicine-dosage measurement scenarios, with the YouTube video
  reported on item 001. Score out of 2, success at ≥ 60% — so only 2/2
  passes. Changed 2026-10-08 (MOE, with Maya): the challenge ("בואו נאתגר
  את עצמנו") reports its real score; still no gate on screen, every
  learner continues, nothing is shown. Unanswered counts as wrong.
- **06** — Peak question ("שאלת השיא"): a 4-section assessment on
  standard units, tool selection, and measurement precision. Score out of 4, success at ≥ 3.
- **07** — A second peak question, built around a bottling-QC scenario
  (statistics: mean, range, sampling, and drawing a conclusion from
  measurement data). Score out of 4, success at ≥ 3.

**The platform owns routing.** Under a real launch (`?registration`) a part
reports and stops; Kata decides what comes next from `metadata/`. The
cross-part hops (01→02, 02→03/04 by score, `#last` back links) run only
with `?dev=1` and no `?registration` (`DEV_NAV`, `unit-js/30-nav.js`).

## Running any part locally

No build step or dependencies. Parts load the shared `../unit-*` folders, so
serve the **parent of the repo folder** (the unit is then reached through a
subpath, the way it is hosted in production — a wrong `../` depth that a
root-served test would hide shows up as a 404):

```bash
npx http-server .. -p 8080
# then open http://localhost:8080/methodica-ar-science-volume-liquid-01/methodica-ar-science-volume-liquid-01-0N/index.html
```

Add `?dev=1` to walk from part to part. Each part also ships an
`index_dev.html` that frames `index.html?dev=1` in a small dev bar
(screen jump, keyboard shortcuts).

Off-platform (no `?slxapi`) nothing is sent and scoring still works. To see
statements and resume locally, use the stand-in library (localhost only):

```
…/index.html?xapiLib=../_test/xapi-720-k.js&slxapi=x&registration=test-1&resetState
```

`?resetState` starts a clean scenario (the stub keys its store by state id,
not by registration). Then `__stmts()`, `__state()`, `__dupes()` in the console.

## Tests

`_test/README.md` has setup. From the repo root (jsdom/acorn via `NODE_PATH`):

```bash
node _test/verify-report.js
```

557 checks: catalogue identity vs `metadata/`, screen maps, layer wiring and
`?v=` parity, routing behind `DEV_NAV`, the YouTube canary, resume hooks and
flush placement, the asset contract (exact case), and a jsdom run of every
part with the stub, plus section 8 for the Arabic build (`lang="ar"`, no Hebrew outside comments,
no Hebrew-unit slug or key). `node _test/mutations.js` proves 11 deliberate defects are
caught. A real Kata run is not covered by anything local.

## Packaging and metadata

- `pwsh -File docs-and-tools/build-package.ps1` builds an allowlisted copy into
  `../../deployments/<date>/`; `verify-package.ps1` checks it (nothing from
  `_test/`, `docs-and-tools/`, `index_dev.html`, `*.md`, `*.ps1` ships;
  every referenced file present; no duplicate blobs). `node _test/verify-report.js <package dir>` runs the static checks on it.
- `send-metadata.ps1 -DryRun` prints every Kata call without touching the
  network. A live send needs `kata-api-key.txt` (git-ignored, never commit or
  ship it); `retrieve-metadata.ps1 -FailOnDrift` then compares Kata with `metadata/`.
- `docs-and-tools/reset-state.html` / `save-restore-state.html` clear or
  snapshot a learner's resume state.

## Character

Chosen in part 01 S0 and stored in the component's resume state, mirrored in
`localStorage['methodica_ar_science_volume_liquid_01_selectedCharacter']` — a
per-unit key, not the origin-wide `lomda_selectedCharacter` other units share.
Every part reads it through `getCharacter()` (`unit-js/00-util.js`).

## Known issues

- Dismissing the resume prompt still writes a state document (harmless; the
  next save overwrites it).
- The 720 library logs the launch URL, `slxapi` included, to the console.
- The local stub keeps state across registrations — use `?resetState`.

## YouTube embed (part 05, S3) — built so it cannot leak the launch URL

Fixed on this branch. The player used to be created by `YT.Player` on a bare `<div>`, which
makes the IFrame API append **`forigin`** taken from `window.location.href`; the code also set
**`widget_referrer`** from the same href. Once reporting is on, that href carries the platform's
xAPI credentials (`?slxapi=…`), so both would have sent them to Google.

Now `ytMountIframe()` in `methodica-ar-science-volume-liquid-01-05/js/main.js` replaces the
placeholder with an iframe whose `src` it builds itself (`ytEmbedSrc()`: `enablejsapi=1`,
`origin` from `location.origin` only, `referrerpolicy="strict-origin-when-cross-origin"`), and
`YT.Player` attaches to that iframe with events only — no `videoId`/`host`/`playerVars`, so the
API never rebuilds the `src`. Any future YouTube embed in this unit must follow the same
pattern. Background: `Documentation/reporting-and-resume/KNOWN-ISSUE-youtube-forigin-token-leak.md`.

## Shared conventions

All parts follow the same 720 engine conventions: a 1280×710 canvas
scaled to the viewport, RTL Arabic layout, a shared screen-navigation
state machine (`goTo`/`resetScreenState`/keyboard nav), and the same
question-template shapes (SingleChoiceQuestion, MultipleChoiceQuestion,
FlipCardsReveal, DragAndDropQuestion, ValueInputQuestion, DropdownQuestion).
Character choice made in part 01 is carried over to every subsequent
part (see *Character*).

See `methodica-ar-science-volume-liquid-01-03/README.md` for a detailed
write-up of that part's specific screen patterns.
