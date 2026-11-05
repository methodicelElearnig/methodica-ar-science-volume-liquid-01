# Live verification — same change as the Hebrew twin, 2026-11-05

Package `../../deployments/2026-11-05` (commit `8fbedec`), uploaded by the unit owner on 2026-11-05 to
`https://lomdot.education.gov.il/metodica/720/ar/science/volume-liquid/01/`. Method, and the Hebrew results,
in the Hebrew repo's `docs-and-tools/LIVE-VERIFICATION-2026-11-05.md`.

## CDN upload

All **139** package files: **139 / 139 MD5-identical** to the package. The 42 old originals in DEPLOY.md's
Delete table still answer (step 3 not done yet; nothing loads them).

## Kata

Learner `VL01-AR-LIVE-11051756`, links from `New-KataLaunchLinks.ps1 -InputFile
components-methodica-ar-science-volume-liquid-01.txt` (`kata-links-methodica-ar-science-volume-liquid-01-live-11051756.csv`).
The seven Arabic components are still **draft** in Kata (MOE publish pending); draft components launch.

## Results — PASS (one known exception)

Every statement POST **200**, every state PUT **204**. Each response was compared **byte for byte** with
the page's `METADATA` pattern (invisible direction marks would not show in a printout).

| Question | `result.response` (correct answer) | = pattern |
|---|---|---|
| `01-004/q1` matching | `في المختبر يجب إضافة 5 ملل…[.]ماصّة[,]…[.]ملعقة قياس طبّية[,]…[.]محقنة` | yes |
| `01-007/q2` 4 dropdowns | `أداة[,]على مستوى العينين[,]ثلاث[,]المعدل` | **no — known** (metadata still `fill-in`, deferred) |
| `01-008/q1` sequencing | `اختيار أداة القياس – …[,]…[,]حساب المعدل` | yes |
| `02-001/q1` hotspot | `ت. عند أدنى نقطة في الانحناء` | yes |
| `02-002/q1` / `q2` | `30` / `false` then `true` | yes |
| `03-002/q1` multi-select, reverse picks | `مخبار مدرّج[,]كوب قياس[,]محقنة` | yes |
| `05-001/q1` | `15 ملل` — **the direction-mark fix (`5597de9` / `8fbedec`) holds live** | yes |
| `05-002/q1` | the full sentence | yes |
| `07-001/q1` | `751.25` | yes |

- 01 S6: `selected` on each confirmed choice (two), none on the card click; response `interactive-content`.
- 05 S3: `played` on 05-002, no re-open of 001.
- Part 01 first launch: `_resumeReady` true, no failed read; one image, the two `-opt` clips.
- Part 02 save → relaunch: lands on screen 2, both parts restored.
