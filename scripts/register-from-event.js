#!/usr/bin/env node
/**
 * Auto-register org repos from GitHub repository events (created / renamed / deleted).
 * Keeps scripts/pinned-repos.json in sync so private repos are never dropped.
 */
const fs = require("fs");
const path = require("path");

const ORG = process.env.ORG || "topping-tech";
const PINNED = path.join(__dirname, "pinned-repos.json");
const EVENT_PATH = process.env.GITHUB_EVENT_PATH;

if (!EVENT_PATH || !fs.existsSync(EVENT_PATH)) {
  console.log("No event payload — skip register.");
  process.exit(0);
}

const event = JSON.parse(fs.readFileSync(EVENT_PATH, "utf8"));
const action = event.action;
const pinned = fs.existsSync(PINNED) ? JSON.parse(fs.readFileSync(PINNED, "utf8")) : {};

function save() {
  fs.writeFileSync(PINNED, JSON.stringify(pinned, null, 2) + "\n");
}

if (action === "created" && event.repository) {
  const r = event.repository;
  if (r.name === ".github") process.exit(0);
  pinned[r.name] = {
    description: r.description || "—",
    private: r.private,
    html_url: r.html_url || `https://github.com/${ORG}/${r.name}`,
  };
  save();
  console.log(`Registered new repo: ${r.name} (private=${r.private})`);
  process.exit(0);
}

if (action === "renamed" && event.repository && event.changes?.repository?.name) {
  const oldName = event.changes.repository.name.from;
  const newName = event.repository.name;
  if (pinned[oldName]) {
    pinned[newName] = { ...pinned[oldName], html_url: event.repository.html_url };
    delete pinned[oldName];
    save();
    console.log(`Renamed pinned repo: ${oldName} → ${newName}`);
  }
  process.exit(0);
}

if (action === "deleted" && event.repository) {
  const name = event.repository.name;
  if (pinned[name]) {
    delete pinned[name];
    save();
    console.log(`Removed deleted repo from pinned: ${name}`);
  }
  process.exit(0);
}

console.log(`No register action for event: ${action}`);
