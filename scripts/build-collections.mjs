#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const { summaries } = read('data/home.json');
const { projects, repositories } = read('data/collections.json');
const courses = read('data/courses.json');
const columns = read('data/columns.json');
const courseMeta = course => {
  const stat = ['weeks', 'chapters', 'modules', 'slides'].map(unit => course.stats?.find(stat => stat.label === unit)).find(Boolean);
  return stat ? `${stat.value}${{weeks:'주 과정',chapters:'개 장',modules:'개 모듈',slides:'개 슬라이드'}[stat.label]}` : course.type;
};
const catalogs = {
  courses: courses.map(course => ({...course, type:'course', meta:courseMeta(course), secondary:[{url:course.repository,label:'소스'}]})),
  columns: columns.map(column => ({...column, type:'column', meta:column.published.replaceAll('-', '.')})),
  'development-cooperation': projects.map(project => ({...project,type:'project'})),
  'open-source': repositories.map(repository => ({...repository,type:'repository'})),
};
function link(url, text) {
  if (!/^(\/[^/]|https:\/\/)/.test(url)) throw new Error(`Invalid resource URL: ${url}`);
  return `<a href="${escape(url)}">${escape(text)} <span aria-hidden="true">↗</span></a>`;
}
for (const [slug, records] of Object.entries(catalogs)) {
  const ids = new Set();
  const html = records.map(record => {
    const id = `${record.type}:${record.id}`;
    if (ids.has(id) || !record.title || !record.description || !record.meta) throw new Error(`Invalid resource: ${id}`);
    ids.add(id);
    const description = summaries[record.id] ?? record.description;
    const search = [record.title,description,record.description,record.audience ?? '',record.meta,...(record.tags ?? []),...(record.keywords ?? [])].join(' ').toLocaleLowerCase('ko');
    const meta = record.type === 'column'
      ? `<time datetime="${record.published}">${record.meta}</time><span>조회 <b data-view-count="${record.id}">—</b></span>`
      : `<span>${escape(record.meta)}</span>`;
    const note = record.note ? `\n          <p class="resource-note">${escape(record.note)}</p>` : '';
    const secondary = record.secondary?.length ? `\n          <div class="resource-secondary">${record.secondary.map(item => link(item.url,item.label)).join(' ')}</div>` : '';
    return `        <article class="resource" data-resource-id="${escape(id)}" data-type="${record.type}" data-filters="${escape((record.filters ?? []).join(' '))}" data-search="${escape(search)}">
          <div class="resource-meta">${meta}</div>
          <h2>${link(record.url,record.title)}</h2>
          <p>${escape(description)}</p>${note}${secondary}
        </article>`;
  }).join('\n');
  const path = resolve(root, slug, 'index.html');
  const before = readFileSync(path, 'utf8');
  const start = '        <!-- COLLECTION-RESOURCES:START -->';
  const end = '        <!-- COLLECTION-RESOURCES:END -->';
  if (before.split(start).length !== 2 || before.split(end).length !== 2 || before.indexOf(start) > before.indexOf(end)) throw new Error(`Invalid catalog markers: ${slug}`);
  const after = before.slice(0,before.indexOf(start)) + start + '\n' + html + '\n' + end + before.slice(before.indexOf(end)+end.length);
  if (process.argv.includes('--check')) {
    if (before !== after) throw new Error(`Stale ${slug} catalog. Run node scripts/build-collections.mjs.`);
  } else if (before !== after) writeFileSync(path,after);
  console.log(JSON.stringify({status:'ok',page:slug,resources:records.length}));
}
