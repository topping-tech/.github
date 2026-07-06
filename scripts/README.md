# Auto-sync org profile table

## Fully automatic — no manual commands

```
gh repo create topping-tech/new-project
        ↓
(first push to main)
        ↓
sync-org-profile.yml in repo
        ↓
org README table updated
```

If the new repo has no sync workflow yet, the **10-minute schedule** in `topping-tech/.github` picks it up automatically.

## Triggers

| Trigger | Where | When |
|---------|-------|------|
| **push → main** | Any repo with `sync-org-profile.yml` | Instant |
| **schedule** | `topping-tech/.github` | Every 10 minutes |
| **push** | `topping-tech/.github` | On workflow/script changes |

## Add sync to a new repository

Copy the template on first push:

```bash
mkdir -p .github/workflows
curl -sL -o .github/workflows/sync-org-profile.yml \
  https://raw.githubusercontent.com/topping-tech/.github/main/templates/sync-org-profile.yml
git add .github/workflows/sync-org-profile.yml
git commit -m "ci: sync org profile on push"
git push
```

Or use repo template (recommended): `gh repo create topping-tech/NAME --template topping-tech/starter`

## Private repos

Auto-registered in `scripts/pinned-repos.json` when the update runs (API cannot list private repos from Actions).

## Extra links

Edit `scripts/repo-extras.json` (e.g. GitHub Pages live link for playbook).
