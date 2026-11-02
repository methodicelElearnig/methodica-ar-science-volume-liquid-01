# `_test/` — headless regression checks

**Never shipped.** `docs-and-tools/package-allowlist.ps1` excludes this folder.

## Running

jsdom (~26 MB) and acorn are installed **outside** this OneDrive-synced tree and reached through
`NODE_PATH` (guide `ADDING-REPORTING-AND-RESUME.md` §10.1):

```bash
mkdir -p "$TEMP/jstools" && cd "$TEMP/jstools" && npm install jsdom acorn acorn-walk
```

From the repo root, in PowerShell:

```powershell
$env:NODE_PATH = "$env:TEMP\jstools\node_modules"
node _test/verify-report.js      # 562 checks
node _test/mutations.js          # 12 deliberate defects, each must make verify-report.js fail
```

Without jsdom/acorn the static sections still run and the rest is reported as skipped.
`verify-report.js [dir]` checks another directory, e.g. a built package (static sections only).

## What `verify-report.js` checks, and why

Every check guards a failure that is **silent** at runtime — the lomda works, the data is wrong.

| Section | What |
|---|---|
| 1. catalogue identity | `XAPI_ID_PREFIX` / `XAPI_UNIT_ID` vs `metadata/`; per part `XAPI_COMP_SLUG`, `XAPI_COMP_ID`, `METADATA.id` byte for byte, `XAPI_METADATA_FILE`, `learningUnitId`, item and question id shapes; no "mass-liquid" left |
| 2. screen map | `SCREEN_TO_SUBCONTENT` has exactly `TOTAL_SCREENS` keys; every mapped suffix is in the catalogue and every catalogue item has a screen; `XAPI_EVAL_ITEMS` = the items that declare questions; `XAPI_END_BTN` exists |
| 3. layer wiring | script order (10 20 25 40 45 50 … main.js … 90-boot last); `?v=` on every code reference and identical across parts; `25-report.css` after the part stylesheet; the three dialogs inside `#app`, outside every `.screen`, starting hidden; the boot cover before `#app`; the library letter inside the `XAPI_USING_G` regex; `RESUME_ENABLED`; the `DEV_NAV` formula; the one 720 form target |
| 4. names, routing, D-1, character, legacy | no name declared in both the shared layer and a part; every cross-part hop behind `DEV_NAV`; no unit-level `completed`; part 05's YouTube iframe built by us (no `widget_referrer`, no API-built src); the per-unit character key, the old origin-wide key unused; no per-part motion copies, `.ttf` fonts or `sync-motion.ps1` grown back |
| 5. resume wiring | the four hooks in every part; `goTo` = `.active` → `repaintScreen` → `xapiOnScreen` → `scheduleResumeSave`; `restoreScreenUI` wrapped; in every function that commits an answer a flush follows the last commitment and no `return` of that function sits between the commitment and a flush (parsed, not by name) |
| 6. asset contract | every literal asset path in HTML / JS / CSS resolves with exact case (the CDN is case-sensitive; Windows is not) |
| 7. runtime (jsdom, every part) | off-platform: no `sendStatement720`, `xapiOnScreen` a no-op, scoring still recorded, `DEV_NAV` false, first-screen back hidden; with the stub: the loader boots, one component `initialized`, the landing item iff screen 0 is mapped, **every screen boundary sends exactly the map's `completed` / `initialized` pairs** (an unanswered evaluated item is not closed — B-1), no statement uses the unit id, `METADATA.id` matches; resume: capture→apply→capture is stable, forcing every question answered and walking every screen raises no `[resume]` error, the document is v5 with the four ledgers; no unexpected `console.error` |

## Not covered here — checked in a real browser (see the Phase 5/6 commit messages)

Screen looks (marks, popups, toggles) after a reload vs live play, the per-question statement
payloads (answer text, `answered` vs `answered.last`, hints once), component results and the
failed-gate paths, the issue-report POST, the YouTube canary, the character crossing parts.

**Not covered by anything local:** a real Kata run — stubs prove payload shape, not arrival
(guide §12).

## `xapi-720-k.js` — the local stand-in for the CDN library

From methodica-math-ratio-01. Loaded only on localhost via `?xapiLib=../_test/xapi-720-k.js`.
Console helpers: `__stmts()` `__state()` `__dupes()` `__reset()` `__failWrites(bool|status)`.
It keys its store by state id, not by registration — start a second scenario with `?resetState`.
