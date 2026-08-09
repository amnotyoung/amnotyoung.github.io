#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const metadataPath = join(repositoryRoot, "data", "columns.json");

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function readText(relativePath) {
  const path = join(repositoryRoot, relativePath);
  if (!existsSync(path) || lstatSync(path).isSymbolicLink()) {
    fail(`Missing or unsafe file: ${relativePath}`);
  }
  return readFileSync(path, "utf8");
}

let columns;
try {
  columns = JSON.parse(readText("data/columns.json"));
} catch {
  fail("Column metadata is not valid JSON.");
}

if (!Array.isArray(columns) || columns.length === 0) {
  fail("Column metadata must contain at least one issue.");
}

const archive = readText("columns/index.html");
const home = readText("index.html");
const sitemap = readText("sitemap.xml");
const ids = new Set();

for (const [index, column] of columns.entries()) {
  if (
    !column ||
    !/^\d{4}-W\d{2}$/.test(column.id) ||
    !Number.isInteger(column.issue) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(column.published) ||
    typeof column.title !== "string" ||
    column.title.trim().length < 10 ||
    typeof column.description !== "string" ||
    column.description.trim().length < 20 ||
    column.url !== `/columns/${column.id}/`
  ) {
    fail(`Invalid column metadata at index ${index}.`);
  }
  if (ids.has(column.id)) fail(`Duplicate column id: ${column.id}`);
  ids.add(column.id);

  const article = readText(`columns/${column.id}/index.html`);
  const canonical = `https://amnotyoung.github.io${column.url}`;
  if (!article.includes(`<link rel="canonical" href="${canonical}"`)) {
    fail(`Column canonical URL mismatch: ${column.id}`);
  }
  if (!article.includes(column.title) || !article.includes(column.published.replaceAll("-", "."))) {
    fail(`Column title or date mismatch: ${column.id}`);
  }
  if (!archive.includes(`href="${column.url}"`)) {
    fail(`Column is absent from archive: ${column.id}`);
  }
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
    fail(`Column is absent from sitemap: ${column.id}`);
  }
}

if (!home.includes('href="/columns/"') || !sitemap.includes("<loc>https://amnotyoung.github.io/columns/</loc>")) {
  fail("Column archive is not linked from the home page and sitemap.");
}

process.stdout.write(`${JSON.stringify({ status: "ok", columns: columns.length, latest: columns[0].id })}\n`);
