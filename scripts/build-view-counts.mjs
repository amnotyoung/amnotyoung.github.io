#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const columnsPath = join(repositoryRoot, "data", "columns.json");
const outputPath = join(repositoryRoot, "data", "pageviews.json");
const statsBaseUrl = "https://hits.sh/api/urns";
const siteUrn = "amnotyoung.github.io";
const dryRun = process.argv.includes("--dry-run");
const allowStale = process.argv.includes("--allow-stale");
const requestTimeoutMs = 8_000;
const requestConcurrency = 5;
const publishedCountsUrl = "https://amnotyoung.github.io/data/pageviews.json";

function isTotal(value) {
  return Number.isSafeInteger(value) && value >= 0;
}

function statsUrl(urn) {
  const encodedUrn = urn.split("/").map(encodeURIComponent).join("/");
  return `${statsBaseUrl}/${encodedUrn}`;
}

async function getTotal(urn, deadline) {
  const response = await fetch(statsUrl(urn), {
    signal: AbortSignal.any([deadline, AbortSignal.timeout(requestTimeoutMs)]),
    headers: {
      Accept: "application/json",
      "User-Agent": "amnotyoung.github.io pageview refresh",
    },
  });

  if (response.status === 404) return 0;
  if (!response.ok) {
    throw new Error(`Unable to read ${urn}: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (!Number.isSafeInteger(data.total) || data.total < 0) {
    throw new Error(`Invalid total for ${urn}`);
  }
  return data.total;
}

async function getPublishedCounts(deadline) {
  try {
    const response = await fetch(publishedCountsUrl, {
      cache: "no-store",
      signal: AbortSignal.any([deadline, AbortSignal.timeout(requestTimeoutMs)]),
      headers: {
        Accept: "application/json",
        "User-Agent": "amnotyoung.github.io pageview refresh",
      },
    });
    if (!response.ok) return null;

    const data = await response.json();
    return data?.provider === "hits.sh" && isTotal(data?.site?.total) ? data : null;
  } catch {
    return null;
  }
}

function totalFrom(snapshot, key) {
  const total = key === "site" ? snapshot?.site?.total : snapshot?.columns?.[key]?.total;
  return isTotal(total) ? total : 0;
}

async function mapWithConcurrency(items, limit, task) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await task(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

const columns = JSON.parse(await readFile(columnsPath, "utf8"));
const checkedInCounts = JSON.parse(await readFile(outputPath, "utf8"));
const refreshDeadline = AbortSignal.timeout(12_000);
const publishedCounts = allowStale ? await getPublishedCounts(refreshDeadline) : null;
let fallbackCount = 0;

function fallbackTotal(key) {
  return Math.max(totalFrom(checkedInCounts, key), totalFrom(publishedCounts, key));
}

async function refreshedTotal(urn, key) {
  const fallback = fallbackTotal(key);
  try {
    return Math.max(await getTotal(urn, refreshDeadline), fallback);
  } catch (error) {
    if (!allowStale) throw error;
    fallbackCount += 1;
    return fallback;
  }
}

for (const column of columns) {
  if (!column || !/^\d{4}-W\d{2}$/.test(column.id) || column.url !== `/columns/${column.id}/`) {
    throw new Error(`Invalid column metadata for pageview refresh: ${column?.id ?? "unknown"}`);
  }
}

const targets = [
  { key: "site", urn: siteUrn },
  ...columns.map((column) => ({
    key: column.id,
    urn: `${siteUrn}/columns/${column.id}`,
  })),
];
const refreshedEntries = await mapWithConcurrency(
  targets,
  requestConcurrency,
  async ({ key, urn }) => [key, await refreshedTotal(urn, key)],
);
const refreshedTotals = Object.fromEntries(refreshedEntries);
const columnTotals = Object.fromEntries(
  columns.map((column) => [column.id, { total: refreshedTotals[column.id] }]),
);

const pageviews = {
  provider: "hits.sh",
  generated_at: new Date().toISOString(),
  site: { total: refreshedTotals.site },
  columns: columnTotals,
};

if (!dryRun) {
  await writeFile(outputPath, `${JSON.stringify(pageviews, null, 2)}\n`, "utf8");
}

process.stdout.write(
  `${JSON.stringify({
    status: "ok",
    dry_run: dryRun,
    allow_stale: allowStale,
    fallbacks: fallbackCount,
    site: pageviews.site.total,
    columns: Object.keys(pageviews.columns).length,
  })}\n`,
);
