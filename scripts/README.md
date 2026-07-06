# Auto-sync org profile table

## How it works (zero manual commands)

```
gh repo create topping-tech/new-project
        ↓
repository event (org .github workflow)
        ↓
pinned-repos.json + README table updated
        ↓
push to main in any repo
        ↓
sync-org-profile.yml → repository_dispatch
        ↓
table updated again
```

| Trigger | When |
|---------|------|
| **repository** | New / renamed / deleted org repo (instant) |
| **push** | Any repo with `sync-org-profile.yml` on `main` |
| **schedule** | Every 30 minutes (backup) |

## New repository setup

**Public repo:** Nothing required — `repository` event registers it automatically.

**Private repo:** Also auto-registered on `repository` created event via `register-from-event.js`.

Copy sync workflow into the new repo (or use template):

```bash
mkdir -p .github/workflows
curl -o .github/workflows/sync-org-profile.yml \
  https://raw.githubusercontent.com/topping-tech/.github/main/templates/sync-org-profile.yml
git add .github/workflows/sync-org-profile.yml
git commit -m "ci: sync org profile on push"
git push
```

Or one-liner after create:

```bash
gh repo create topping-tech/NEW --public --clone && \
  mkdir -p NEW/.github/workflows && \
  cp path/to/templates/sync-org-profile.yml NEW/.github/workflows/ && \
  cd NEW && git add . && git commit -m "ci: sync org profile" && git push
```

## Extra links (GitHub Pages, etc.)

Edit `scripts/repo-extras.json` in this repo.

## Files

| File | Purpose |
|------|---------|
| `scripts/update-repo-table.js` | Build README table from API + pinned |
| `scripts/register-from-event.js` | Auto-add repos from GitHub org events |
| `scripts/pinned-repos.json` | Private repos + auto-registered repos |
| `templates/sync-org-profile.yml` | Copy into each org repo |
