import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicCatalog, writeCatalog } from './filter-public-catalog.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const resource = { title: 'Fixture', description: 'Catalog fixture', meta: 'Test' };
const courses = [{ ...resource, id: 'course-fixture', type: 'Lesson', url: '/courses/koica/', repository: 'https://github.com/example/course' }];
const collections = {
  projects: [{ ...resource, id: 'map', url: '/oda-map-lab/', repository: 'https://github.com/example/map' }],
  repositories: [
    { ...resource, id: 'game', url: 'https://example.org/game', secondary: [{ label: '소스', url: 'https://github.com/example/game' }] },
    { ...resource, id: 'oda-intelligence-plugin', url: 'https://github.com/example/tool' },
  ],
};
const home = { summaries: { 'course-fixture': 'Teaching material' } };
const site = mkdtempSync(join(tmpdir(), 'public-catalog-'));
try {
  for (const name of ['data','scripts','index.html','courses','open-source','development-cooperation','design-preview','sitemap.xml']) {
    cpSync(join(root, name), join(site, name), { recursive: true });
  }
  writeFileSync(join(site, 'data/course-updates.json'), JSON.stringify({ 'course-fixture': '2026-01-01' }));
  for (const visible of [false, true]) {
    const catalog = await publicCatalog(courses, collections, () => visible);
    writeCatalog(site, courses, catalog, home);
    for (const script of ['build-home', 'build-collections', 'validate-branding']) {
      execFileSync(process.execPath, [join(site, 'scripts', script + '.mjs')]);
    }
    for (const [file, marker] of [
      ['index.html', 'tool:game'], ['index.html', 'course:course-fixture'],
      ['courses/index.html', 'course:course-fixture'], ['open-source/index.html', 'repository:game'],
      ['development-cooperation/index.html', 'project:map'], ['design-preview/index.html', 'tool:oda-intelligence-plugin'],
      ['data/collections.json', 'example/game'], ['data/home.json', 'course-fixture'],
      ['data/courses.json', 'course-fixture'], ['sitemap.xml', '/courses/koica/'],
    ]) assert.equal(readFileSync(join(site, file), 'utf8').includes(marker), visible, file + ': ' + marker);
  }
  const empty = await publicCatalog(courses, collections, () => false);
  assert.deepEqual(empty, { courses: [], repositories: [], projects: [] });
  writeCatalog(site, courses, empty, home);
  for (const script of ['build-home', 'build-collections', 'validate-branding']) {
    execFileSync(process.execPath, [join(site, 'scripts', script + '.mjs')]);
  }
  const sample = { projects: [], repositories: [{ id: 'fixture', url: 'https://github.com/example/fixture' }] };
  for (const [status, metadata, count] of [
    [200, { visibility: 'public', private: false }, 1],
    [200, { visibility: 'private', private: true }, 0],
    [200, { visibility: 'internal', private: true }, 0],
    [404, {}, 0],
  ]) {
    globalThis.fetch = async () => Response.json(metadata, { status });
    assert.equal((await publicCatalog([], sample)).repositories.length, count);
  }
  for (const status of [403, 429, 503]) {
    globalThis.fetch = async () => Response.json({}, { status });
    await assert.rejects(publicCatalog([], sample), new RegExp('HTTP ' + status));
  }
} finally {
  rmSync(site, { recursive: true, force: true });
}
console.log('Public catalog hide, restore, empty and failed lookup checks passed.');
