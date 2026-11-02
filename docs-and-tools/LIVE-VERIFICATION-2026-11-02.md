# Live verification — first Arabic package, 2026-11-02

Package `../../deployments/2026-11-02` (commit `9a321ad`), uploaded to
`https://lomdot.education.gov.il/metodica/720/ar/science/volume-liquid/01/`.

## CDN upload

All 139 package files downloaded from the CDN and compared with the package: **139 / 139 byte-identical**
(MD5). Library `720active/common/xapi-720-k.js`: 52,370 bytes, MD5 `f8df5d9d4c17a560847c53542e0c9f87`.

Note: the CDN does not yet carry the images of `21c86b5` (Mariam-Rema, 7 images); those wait for the
fixed `DrinksAndMeasure.png` and a new package.

## KATA

The seven Arabic components (23 items) sit inside the Hebrew unit `methodica-science-volume-liquid-01`
(created 2026-11-02, `send-metadata-2026-11-02-create.log`), status **draft** — not published.

Launch links: `Tools/full-kata-link/New-KataLaunchLinks.ps1 -InputFile components-methodica-ar-science-volume-liquid-01.txt
-StudentId VADIM-AR-VL01-FULL2 -ResetState` — 7 of 7 OK (draft components launch).

A first run (student `VADIM-AR-VL01-FULL`) is **void**: the test wrapped `ADL.XAPIWrapper.sendStatement`
with a callback, which made the library's synchronous call return nothing; the library then threw after
each send (`reading 'xhr'`) and the resume ledgers were never marked. Statements of that run went out
(200), its saved state did not record `done`. Reproduced locally without the wrapper: the ledger is set.
The run below uses a passive XHR listener only.

## Full click-through, all seven parts finished (in-app browser, live CDN + KATA)

Every statement returned **200** and every state save **204**; the only non-2xx were the expected state
404 on each part's first launch. Every `answered` response is Arabic and matches the metadata strings
(exceptions in *Findings*). Character chosen in 01 (`character-2`) was adopted by 02–07.

| Part | Walked | Component `completed` |
|---|---|---|
| 01 | character; 002 hint → wrong → correct; 003 flip cards; 004 drag (real pointer events); 005; 006; **escape-room path** (six principles, four-blank dropdowns); 008 ordering drag; 009. (First, void run: scratch-card path — scratch canvases, hotspot q1, four-blank wrong → corrected.) **Reload after finish: state 200, S15 restored with the answer, `done` set, finish disabled** | success true (no score, by design) |
| 02 | 001 hotspot; 002 two-part (30 / نعم); 003; 004 one-attempt cards; 005 | success true, score 1 (5/5) |
| 03 | 001; 002 multi-select wrong twice (item false); 003 number 21 + dropdown (selected text fits at 15px); gate passed at 2/3; 004 bonus with the Arabic boards | success true, score 0.667 |
| 04 | class task; free-text note | success true (no score) |
| 05 | 001, 002; S3 YouTube `youtube-nocookie.com/embed/mE4r3rECnyc` (no token in the src, `strict-origin-when-cross-origin`), played to ENDED → `played` 200, continue unlocked | success true, score 1 |
| 06 | recall popup; q1; q2 wrong twice; q3; q4 cards | success true, score 0.75 (item 001 mirrors it) |
| 07 | hint (`requested`); q1 dropdown 751.25; q2 number 8; q3; q4. **Reload after finish: state 200, last screen with feedback restored, finish disabled** | success true, score 1 |

## Findings

1. **01-007 on the escape-room path completes as `success:false, scaled:0.5`** although every question
   shown was answered correctly. Item 007 declares q1 (hotspot, scratch-card path only) and q2 (both
   paths); since O-8 (`4f7a639`) an item's result counts every declared question, so the escape path can
   never pass 007. **Same code in Hebrew** — the Hebrew unit does the same. The component result is not
   affected (01 reports success, no score). Natural fix: the learning-path item split (Phase 2), or an
   `XAPI_ITEM_RESULT['007']` that counts only the questions of the path taken — in Hebrew and Arabic together.
2. **Invisible direction marks in responses.** Options such as `15‏‎ ‎ملل` (05-001) and `240‏‎ ‎ملل`
   (06 q1) carry RLM/LRM from the translation, so `result.response` differs from the metadata string
   (`15 ملل`) by invisible characters. Arabic only.
3. **The part-05 video's YouTube title is "قياس كتلة السوائل"** (measuring the mass of liquids); the Hebrew
   video is "a spoon that saves lives". Content to confirm.
4. 02-001 (hotspot) reports the letter only (`ت`), not the metadata sentence — same as Hebrew.

## Not checked here

- Publishing (components are draft) and a launch from the real learning platform.
- The report modal was not submitted (it posts to the shared Google Form).
- 01 scratch-card path in a clean run (it ran only in the void run; its statements were 200).
