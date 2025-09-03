# Push Protocol (HyperTrack Pro)

This repository uses a single app located in `hypertrack-pro-v2` (Create React App). Vercel is configured to build from that subdirectory. Follow this exact protocol for every change.

## Branch & Scope
- Branch: `main`
- App root: `hypertrack-pro-v2`
- Do NOT create nested git repos (no `hypertrack-pro-v2/.git`).
- Do NOT add a `vercel.json` at repo root.

## PowerShell Push (non-interactive)
Use semicolons; do not rely on `&&`/`||`.

```powershell
# From repo root
git status;
git fetch --all;
# Scope add to the app unless you intentionally changed root files
git add -A .\hypertrack-pro-v2;
# If you changed root docs/scripts too:
# git add -A;
$MSG = "Update: <describe change>";
if (-not (git diff --cached --quiet)) { git commit -m $MSG };
# Rebase to avoid merge commits in CI
git pull --rebase origin main;
# Push
git push origin main;
```

## Vercel Settings (for reference)
- Project Root Directory: `hypertrack-pro-v2`
- Framework: Create React App
- Build Command: `npm run build`
- Output Directory: `build`
- Node.js: 20.x or 22.x

## Common Issues
- "No Output Directory named build": Root Directory is wrong. Set to `hypertrack-pro-v2`.
- "Missing index.html": ensure `hypertrack-pro-v2/public/index.html` is committed.
- ESLint fails in CI: fix warnings locally; CI treats warnings as errors.
- Deleted files by accident (e.g., `api/*.js`): `git restore path\\to\\file` then re-commit.

## Optional helper
You can also run `./push-updates.ps1` (repo root). Ensure the script stages `hypertrack-pro-v2` and rebases before pushing.

---
Authoritative copies: this file and `.cursorrules.mdc` (Push Protocol section).
