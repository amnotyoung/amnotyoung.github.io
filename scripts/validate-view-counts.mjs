#!/usr/bin/env node

import { existsSync, lstatSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const counterScriptPath = resolve(repositoryRoot, "views.js");

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

function listHtmlFiles(directory = repositoryRoot) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...listHtmlFiles(path));
    if (entry.isFile() && entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

function hasCounterScript(html, pagePath) {
  const scripts = html.matchAll(/<script\b([^>]*)><\/script>/g);
  for (const [, attributes] of scripts) {
    if (!/\bdefer\b/.test(attributes)) continue;
    const src = attributes.match(/\bsrc="([^"]+)"/)?.[1];
    if (!src) continue;
    const path = src.startsWith("/")
      ? resolve(repositoryRoot, `.${src}`)
      : resolve(dirname(pagePath), src);
    if (path === counterScriptPath) return true;
  }
  return false;
}

const pageviews = JSON.parse(readText("data/pageviews.json"));

for (const path of listHtmlFiles()) {
  const relativePath = relative(repositoryRoot, path).replaceAll("\\", "/");
  // The explicitly marked design sandbox does not track preview visits.
  if (relativePath.startsWith("design-preview/")) {
    if (!readText(relativePath).includes('<meta name="robots" content="noindex, nofollow">')) {
      fail(`Design preview must be marked noindex: ${relativePath}`);
    }
    continue;
  }
  if (!hasCounterScript(readText(relativePath), path)) {
    fail(`View counter script is absent from: ${relativePath}`);
  }
}

if (!readText("index.html").includes('data-view-count="site"')) {
  fail("Site visit count is absent from the home page.");
}

if (pageviews.provider !== "hits.sh" || !Number.isSafeInteger(pageviews.site?.total) || pageviews.site.total < 0) {
  fail("Invalid site pageview metadata.");
}

process.stdout.write(`${JSON.stringify({ status: "ok", html: listHtmlFiles().length })}\n`);
