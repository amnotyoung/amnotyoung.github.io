#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = join(repositoryRoot, "data", "pageviews.json");
const statsBaseUrl = "https://hits.sh/api/urns";
const siteUrn = "amnotyoung.github.io";
const dryRun = process.argv.includes("--dry-run");
const allowStale = process.argv.includes("--allow-stale");
const requestTimeoutMs = 8_000;
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

const checkedInCounts = JSON.parse(await readFile(outputPath, "utf8"));
const refreshDeadline = AbortSignal.timeout(12_000);
const publishedCounts = allowStale ? await getPublishedCounts(refreshDeadline) : null;
let fallbackCount = 0;

async function refreshedSiteTotal() {
  const fallback = Math.max(checkedInCounts.site.total, publishedCounts?.site.total ?? 0);
  try {
    return Math.max(await getTotal(siteUrn, refreshDeadline), fallback);
  } catch (error) {
    if (!allowStale) throw error;
    fallbackCount += 1;
    return fallback;
  }
}

const pageviews = {
  provider: "hits.sh",
  generated_at: new Date().toISOString(),
  site: { total: await refreshedSiteTotal() },
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
  })}\n`,
);
