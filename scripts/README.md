# Scripts — topping-tech/.github

## Auto-update org profile table

The workflow **Update org profile repo table** regenerates `profile/README.md` from the GitHub API.

### Triggers

| Trigger | When |
|---------|------|
| **Daily schedule** | Every day 06:00 UTC |
| **Manual** | Actions → Run workflow |
| **repository_dispatch** | After creating a repo (instant) |

### After creating a new repository (instant update)

```bash
gh repo create topping-tech/NEW-REPO --public --description "..." \
  && gh api repos/topping-tech/.github/dispatches \
       -f event_type=update-repo-table
```

Or trigger the workflow directly:

```bash
gh workflow run update-org-readme.yml --repo topping-tech/.github
```

### Extra links (e.g. GitHub Pages)

Edit `scripts/repo-extras.json`:

```json
{
  "playbook": {
    "extraLinks": [
      { "label": "Live dashboard", "url": "https://topping-tech.github.io/playbook/" }
    ]
  }
}
```

### Private repos (important)

GitHub Actions `GITHUB_TOKEN` **cannot list private org repos**, so they would disappear from the table.

Add every private repo to `scripts/pinned-repos.json`:

```json
{
  "it-dev": {
    "description": "Internal development workspace for Topping Tech systems.",
    "private": true,
    "html_url": "https://github.com/topping-tech/it-dev"
  }
}
```

When you create a new **private** repo, add it here before the next workflow run.

The `.github` repo itself is excluded from the table.
