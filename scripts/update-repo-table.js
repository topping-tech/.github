#!/usr/bin/env node
/**
 * Regenerates the repository table in profile/README.md
 * Run locally: node scripts/update-repo-table.js
 * Requires: GITHUB_TOKEN or gh auth token, ORG (default topping-tech)
 *
 * Note: GITHUB_TOKEN in Actions cannot list private org repos.
 * Private repos must be listed in scripts/pinned-repos.json so they are never dropped.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const ORG = process.env.ORG || "topping-tech";
const README = path.join(__dirname, "..", "profile", "README.md");
const EXTRAS = path.join(__dirname, "repo-extras.json");
const PINNED = path.join(__dirname, "pinned-repos.json");

function loadJson(file) {
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : {};
}

const extras = loadJson(EXTRAS);
const pinned = loadJson(PINNED);

function api(path) {
  return new Promise((resolve, reject) => {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
    if (!token) return reject(new Error("GITHUB_TOKEN required"));
    const req = https.request(
      {
        hostname: "api.github.com",
        path,
        headers: {
          "User-Agent": "topping-tech-org-profile",
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          if (res.statusCode >= 400) reject(new Error(`${res.statusCode}: ${data}`));
          else resolve(JSON.parse(data));
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function fetchAllRepos() {
  const repos = [];
  let page = 1;
  while (true) {
    const batch = await api(`/orgs/${ORG}/repos?per_page=100&page=${page}&sort=full_name`);
    if (!batch.length) break;
    repos.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return repos.filter((r) => r.name !== ".github");
}

function mergeRepos(apiRepos) {
  const byName = new Map(apiRepos.map((r) => [r.name, r]));

  for (const [name, meta] of Object.entries(pinned)) {
    if (!byName.has(name)) {
      byName.set(name, {
        name,
        description: meta.description || "—",
        html_url: meta.html_url || `https://github.com/${ORG}/${name}`,
        private: meta.private !== false,
      });
      console.log(`Pinned (not in API): ${name}`);
    }
  }

  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function buildLink(repo) {
  const base = `[github.com/${ORG}/${repo.name}](${repo.html_url})`;
  const extra = extras[repo.name]?.extraLinks || [];
  const parts = [base, ...extra.map((e) => `[${e.label}](${e.url})`)];
  let link = parts.join(" · ");
  if (repo.private) link += " *(private)*";
  return link;
}

function buildTable(repos) {
  const lines = [
    "| Repository | Description | Link |",
    "|------------|-------------|------|",
    ...repos.map((r) => {
      const desc = (r.description || "—").replace(/\|/g, "\\|");
      return `| **${r.name}** | ${desc} | ${buildLink(r)} |`;
    }),
  ];
  return lines.join("\n");
}

function updateReadme(table) {
  const content = fs.readFileSync(README, "utf8");
  const start = "<!-- REPO_TABLE_START -->";
  const end = "<!-- REPO_TABLE_END -->";
  if (!content.includes(start) || !content.includes(end)) {
    throw new Error("README missing REPO_TABLE markers");
  }
  const updated = content.replace(
    new RegExp(`${start}[\\s\\S]*?${end}`),
    `${start}\n${table}\n${end}`
  );
  if (updated === content) {
    console.log("No changes to README table.");
    return false;
  }
  fs.writeFileSync(README, updated);
  console.log(`Updated table with ${table.split("\n").length - 2} repos.`);
  return true;
}

(async () => {
  const apiRepos = await fetchAllRepos();
  const repos = mergeRepos(apiRepos);
  updateReadme(buildTable(repos));
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
