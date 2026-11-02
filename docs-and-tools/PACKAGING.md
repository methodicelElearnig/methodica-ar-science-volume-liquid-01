> **methodica-science-volume-liquid-01 (2026-09-28):** copied from methodica-science-mass-weight-01. Only
> `package-allowlist.ps1` differs (this unit's seven parts; each ships `index.html`, `js/*.js`, `css/*.css`,
> `assets/`). Mentions of other units below are the donor's history.

# Building a deployment package

Three scripts, one definition of what ships (PowerShell 7+).

| File | Role |
|---|---|
| `package-allowlist.ps1` | **The only definition** of what a package contains. Not run directly — the other two load it. |
| `build-package.ps1` | Cuts a package into `../../deployments/<yyyy-MM-dd>/` (next to the repo), then verifies its own output. |
| `verify-package.ps1` | Answers one question: is the package on disk **exactly** this tree? |

`build-package.ps1` and `verify-package.ps1` are byte-identical to the mass-measure-03 / ratio-01 /
ratio-02 copies; only the allowlist differs (see its `.NOTES`).

## Run

```powershell
pwsh -File docs-and-tools/build-package.ps1 -DryRun   # what would ship, writes nothing
pwsh -File docs-and-tools/build-package.ps1           # cut to ../../deployments/<today>
pwsh -File docs-and-tools/verify-package.ps1          # check the newest package
```

Then cross-check the package with the harness (the gate is still `verify-package.ps1`):

```bash
NODE_PATH=<jsdom outside OneDrive> node _test/verify-report.js ../../deployments/<date>
```

`build-package.ps1` refuses a dirty working tree (`-AllowDirty` overrides) and a non-empty target
(`-Force` overrides and keeps a hand-written `DEPLOY.md`). `deployments/` is outside the repo, so an
overwrite cannot be undone.

## What ships, and what never does

Ships: root `index.html` (the redirect), `metadata/`, `unit-js/`, `unit-css/`, `unit-assets/`, and in
each part `index.html`, `js/*.js`, `css/*.css`, `assets/` (the part-05 Galileo applet lives there).

Never ships — refused because no rule accepts it: the legacy single-file build at the root (`css/`,
`js/`, `assets/`, `index-monolith-backup.html`), the QA/dev shell (`qa-shell.html`, `unit-shell.js`,
`unit-manifest.js`, every `index_dev.html`), `_test/`, `docs/`, `docs-and-tools/`, `translation/`,
`metadata-from/`, every `*.md`, `*.ps1`, `*.log`, and any key file.

## Why an allowlist

A denylist with one missing entry publishes whatever was forgotten — a new document, a dev page, a
`kata-api-key.txt`. With an allowlist a new file at the root simply does not match and does not ship.

## verify-package's four checks

| Check | Asks |
|---|---|
| FORWARD | every file in the package exists in the tree with the same content (MD5) |
| REVERSE | every file the allowlist ships **is** in the package (a file added after the cut would 404) |
| HYGIENE | no key, `*.ps1`, `*.log`, dev page, `README.md` or `_`-path in the package |
| COMMIT | the commit `DEPLOY.md` names vs HEAD — stale only if a **shipped** file changed |

## Deploy order (ADDING-REPORTING-AND-RESUME.md §11)

1. The library is already on the CDN (`xapi-720-k.js`); verify it by size and signature, not HTTP 200.
2. Upload **all parts at once** (and roll back all at once); a part on an old build beside resume-enabled
   parts corrupts the shared ledger's view.
3. Verify every uploaded file by byte size against `DEPLOY.md` — the MOE CDN answers 200 with 0 bytes
   for a missing path.
4. Bump `?v=` identically in every part for any shared file or `main.js` that changed since the last
   upload.
