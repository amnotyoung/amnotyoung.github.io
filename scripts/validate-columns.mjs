#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const metadataPath = join(repositoryRoot, "data", "columns.json");
const KOREAN_WEEK_ORDINALS = ["첫째", "둘째", "셋째", "넷째", "다섯째"];
const THREADS_PROFILE_URL = "https://www.threads.com/@amnotyoung.k";
const THREADS_PROFILE_LABEL = "Threads · @amnotyoung.k";
const COLUMNS_OG_URL = "https://amnotyoung.github.io/assets/any/columns-og.png";
const COLUMNS_OG_ALT = "주간 칼럼 · amnotyoung";

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

function periodLabelForDate(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  const ordinal = KOREAN_WEEK_ORDINALS[Math.floor((day - 1) / 7)];
  return ordinal ? `${match[1]}년 ${month}월 ${ordinal} 주` : null;
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

function hasColumnSocialImage(html, imageUrl = COLUMNS_OG_URL, imageAlt = COLUMNS_OG_ALT) {
  return (
    html.includes(`<meta property="og:image" content="${imageUrl}" />`) &&
    html.includes('<meta property="og:image:width" content="1200" />') &&
    html.includes('<meta property="og:image:height" content="630" />') &&
    html.includes(`<meta property="og:image:alt" content="${imageAlt}" />`) &&
    html.includes('<meta name="twitter:card" content="summary_large_image" />') &&
    html.includes(`<meta name="twitter:image" content="${imageUrl}" />`)
  );
}

if (
  !archive.includes(`href="${THREADS_PROFILE_URL}"`) ||
  !archive.includes(">Threads")
) {
  fail("Threads profile is absent from the column archive footer.");
}
if (!hasColumnSocialImage(archive, "https://amnotyoung.github.io/assets/any/columns-og.png", "주간 칼럼 · amnotyoung")) {
  fail("Column archive social image metadata is invalid.");
}

for (const [index, column] of columns.entries()) {
  if (
    !column ||
    !/^\d{4}-W\d{2}$/.test(column.id) ||
    !Number.isInteger(column.issue) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(column.published) ||
    typeof column.period_label !== "string" ||
    !/^\d{4}년 \d{1,2}월 (?:첫째|둘째|셋째|넷째|다섯째) 주$/.test(column.period_label) ||
    column.period_label !== periodLabelForDate(column.published) ||
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
  if (
    !article.includes(`href="${THREADS_PROFILE_URL}"`) ||
    !article.includes(THREADS_PROFILE_LABEL)
  ) {
    fail(`Threads profile is absent from the article footer: ${column.id}`);
  }
  if (!article.includes(`<link rel="canonical" href="${canonical}"`)) {
    fail(`Column canonical URL mismatch: ${column.id}`);
  }
  if (!hasColumnSocialImage(article)) {
    fail(`Column social image metadata is invalid: ${column.id}`);
  }
  if (
    !article.includes(column.title) ||
    !article.includes(`<time datetime="${column.published}">${column.published.replaceAll("-", ".")}</time>`)
  ) {
    fail(`Column title or period mismatch: ${column.id}`);
  }
  if (!archive.includes(`href="${column.url}"`)) {
    fail(`Column is absent from archive: ${column.id}`);
  }
  const archiveCard = archive.match(
    new RegExp(`<article class="resource" data-resource-id="column:${column.id}"[^>]*>([\\s\\S]*?)</article>`),
  )?.[1];
  if (
    !archiveCard ||
    !archiveCard.includes(`<time datetime="${column.published}">${column.published.replaceAll("-", ".")}</time>`) ||
    !archiveCard.includes(column.title)
  ) {
    fail(`Column title or publication date is absent from archive: ${column.id}`);
  }
  if (
    archiveCard.includes(`ISSUE ${column.issue}`) ||
    archiveCard.includes(`WEEK ${column.issue}`) ||
    article.includes(`ISSUE ${column.issue}`) ||
    article.includes(`WEEK ${column.issue}`)
  ) {
    fail(`Reader-facing ISO issue numbering is still present: ${column.id}`);
  }
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) {
    fail(`Column is absent from sitemap: ${column.id}`);
  }
}

const homeColumns = [...home.matchAll(/data-resource-id="column:([^"]+)"/g)].map(match => match[1]);
if (JSON.stringify(homeColumns) !== JSON.stringify(columns.map(column => column.id))) {
  fail("Homepage column entries or order do not match the column catalog.");
}
for (const column of columns) {
  if (!home.includes(`href="${column.url}"`)) fail(`Homepage column link is absent: ${column.id}`);
}

if (!home.includes('href="/columns/"') || !sitemap.includes("<loc>https://amnotyoung.github.io/columns/</loc>")) {
  fail("Column archive is not linked from the home page and sitemap.");
}

process.stdout.write(`${JSON.stringify({ status: "ok", columns: columns.length, latest: columns[0].id })}\n`);
