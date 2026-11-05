# Media optimization — 2026-11-05 (Arabic twin; same tool, same boxes)

Part of the resume-hardening rollout (`Documentation/reporting-and-resume/BOOT-AND-RESUME-HARDENING-2026-11-03.md`
§2.4–2.5, §7.4: part 01 carried 30.7 MB of assets, screen 0 2.1 MB).

## Images — `reencode-media.py` (copied from methodica-science-mass-weight-01)

- Boxes: `media-display-boxes.json` (copied from the Hebrew unit and **re-measured here** on every screen: identical), **measured** in Chrome by walking every screen of every part (rendered
  size / the `#app` scale, `object-fit: contain` applied), plus each part's zoom stage for zoomable images.
- Target 2 × box (cover rule), never upscaled; PNG → libimagequant 256 colours + oxipng; JPEG q82. Type kept.
- **40 files, 44,579,074 → 5,383,671 bytes** (−39.2 MB). New names `<stem>-opt.<ext>`, references
  rewritten, originals removed (git history keeps them). Per-file rows: `reencode-rows.md`.
- Two paths are built in code and were rewritten by hand: 01 `main.js` `'-rope-opt.png'`, `'-peeking-opt.png'`.
- `character-1-happy.PNG` (04) came out as `character-1-happy-opt.png` (lower-case extension).
- Visual check: 01 S0, S3, S11 (the 2554 px lab background is palette-quantized, not resized — it is drawn
  full-width) compared side by side with the originals; no visible banding.

## Screen-0 clips (part 01)

| clip | before | after | px | kbps |
|---|---|---|---|---|
| `character-1-selection` | 1,308,649 | 202,114 | 960² → 448² | 317 |
| `character-2-selection` | 841,453 | 159,284 | 960² → 448² | 389 |

Drawn at 224 × 224 (measured). `ffmpeg -an -vf scale=448:448:flags=lanczos -c:v libx264 -profile:v high
-preset slow -crf 23 -maxrate 500k -bufsize 1000k -pix_fmt yuv420p -movflags +faststart`; 30 fps and the
duration kept (3.23 s for character-2, so `CARD_VIDEO_SAFE_END_TIME` is unchanged). The clips loaded later
(path cards, Sporty, Talking …) are outside the boot window and were left.

Screen 0 media: 2,138,352 → 361,398 bytes.
