import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = name => JSON.parse(readFileSync(resolve(root, 'data', name), 'utf8'));
const origin = 'https://amnotyoung.github.io';

function repositoryOf(link) {
  const url = new URL(link, origin);
  const [owner, name] = url.pathname.split('/').filter(Boolean);
  if (url.hostname === 'github.com' && owner && name) return owner + '/' + name.replace(/\.git$/i, '');
  if (url.hostname.endsWith('.github.io') && owner && (url.origin !== origin || !existsSync(resolve(root, owner)))) {
    return url.hostname.slice(0, -'.github.io'.length) + '/' + owner;
  }
  return null;
}

async function isPublic(repo) {
  const endpoint = 'https://api.github.com/repos/' + repo.split('/').map(encodeURIComponent).join('/');
  const headers = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
  const response = await fetch(endpoint, { headers, signal: AbortSignal.timeout(20000) });
  if ([404, 410, 451].includes(response.status)) return false;
  if (!response.ok) throw new Error('GitHub repository lookup failed: HTTP ' + response.status);
  const metadata = await response.json();
  if (typeof metadata.private !== 'boolean' || !['public', 'private', 'internal'].includes(metadata.visibility)) {
    throw new Error('Invalid GitHub visibility response');
  }
  return metadata.visibility === 'public' && !metadata.private;
}

export async function publicCatalog(courses, collections, lookup = isPublic) {
  const states = new Map();
  async function visible(record) {
    const links = [record.repository, record.url, ...(record.secondary ?? []).map(item => item.url)].filter(Boolean);
    const repos = links.map(repositoryOf).filter(Boolean);
    if (record.repository && !repositoryOf(record.repository)) throw new Error('Invalid repository for ' + record.id);
    for (const repo of repos) {
      const key = repo.toLowerCase();
      if (!states.has(key)) states.set(key, await lookup(key));
      if (!states.get(key)) return false;
    }
    return true;
  }
  async function filter(records) {
    const result = [];
    for (const record of records) {
      if (await visible(record)) result.push(record);
    }
    return result;
  }
  return {
    courses: await filter(courses),
    projects: await filter(collections.projects),
    repositories: await filter(collections.repositories),
  };
}

export function writeCatalog(site, courses, catalog, home) {
  const write = (name, data) => writeFileSync(resolve(site, 'data', name), JSON.stringify(data, null, 2) + '\n');
  const { projects, repositories } = catalog;
  write('courses.json', catalog.courses);
  write('collections.json', { projects, repositories });
  const ids = new Set([...catalog.courses, ...projects, ...repositories].map(record => record.id));
  write('home.json', { ...home, summaries: Object.fromEntries(Object.entries(home.summaries).filter(([id]) => ids.has(id))) });

  // The preview keeps its original selection and wording, but follows the same visibility rules.
  const previewIds = new Set([
    ...catalog.courses.map(course => 'course:' + course.id),
    ...repositories.map(repo => 'tool:' + repo.id),
  ]);
  const previewPath = resolve(site, 'design-preview/index.html');
  const preview = readFileSync(resolve(root, 'design-preview/index.html'), 'utf8');
  writeFileSync(previewPath, preview.replace(/ *<article class="resource"[^>]*>[\s\S]*?<\/article>\n/g, card =>
    previewIds.has(card.match(/data-resource-id="([^"]+)"/)?.[1]) ? card : ''));

  const courseIds = new Set(catalog.courses.map(course => course.id));
  const hiddenRoutes = courses.filter(course => !courseIds.has(course.id)).map(course => {
    const path = new URL(course.url, origin).pathname;
    return path.match(/^\/courses\/[^/]+\//)?.[0] ?? path;
  });
  const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
  writeFileSync(resolve(site, 'sitemap.xml'), sitemap.replace(/ *<url>[\s\S]*?<\/url>\n/g, entry => {
    const path = new URL(entry.match(/<loc>([^<]+)<\/loc>/)[1]).pathname;
    return hiddenRoutes.some(route => path === route || (route.endsWith('/') && path.startsWith(route))) ? '' : entry;
  }));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const site = resolve(process.argv[2] ?? root);
  if (site === root) throw new Error('Pass a separate Pages staging directory.');
  const courses = read('courses.json');
  const catalog = await publicCatalog(courses, read('collections.json'));
  writeCatalog(site, courses, catalog, read('home.json'));
  console.log('Public catalog:', catalog.courses.length, 'courses,', catalog.projects.length, 'projects,', catalog.repositories.length, 'repositories');
}
