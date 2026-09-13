#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const courses = read('data/courses.json');
const columns = read('data/columns.json');
const { summaries, tools } = read('data/home.json');
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const courseMeta = course => {
  const stat = ['weeks', 'chapters', 'modules', 'slides'].map(unit => course.stats?.find(stat => stat.label === unit)).find(Boolean);
  const units = {weeks:'주 과정', chapters:'개 장', modules:'개 모듈', slides:'개 슬라이드'};
  return stat ? `${stat.value}${units[stat.label]}` : course.type;
};
const records = [
  ...courses.map(course => ({...course, type:'course', label:'교육', meta:courseMeta(course)})),
  ...columns.map(column => ({...column, type:'column', label:'칼럼', meta:column.published.replaceAll('-', '.')})),
  ...tools.map(tool => ({...tool, type:'tool', label:'공개 도구', meta:'GitHub'})),
];
const ids = new Set();
const html = records.map(record => {
  const id = `${record.type}:${record.id}`;
  if (ids.has(id)) throw new Error(`Duplicate resource: ${id}`);
  ids.add(id);
  if (!record.title || !record.description || !record.meta || !/^(\/[^/]|https:\/\/)/.test(record.url)) {
    throw new Error(`Invalid resource: ${id}`);
  }
  const description = summaries[record.id] ?? record.description;
  const searchable = [record.title, description, record.description, record.label, record.meta, ...(record.tags ?? []), ...(record.keywords ?? [])].join(' ').toLocaleLowerCase('ko');
  return `        <article class="resource" data-resource-id="${escape(id)}" data-type="${record.type}" data-search="${escape(searchable)}">
          <div class="resource-meta"><span>${record.label}</span><span>${escape(record.meta)}</span></div>
          <h3><a href="${escape(record.url)}">${escape(record.title)} <span aria-hidden="true">↗</span></a></h3>
          <p>${escape(description)}</p>
        </article>`;
}).join('\n');
const path = resolve(root, 'index.html');
const before = readFileSync(path, 'utf8');
const start = '        <!-- HOME-RESOURCES:START -->';
const end = '        <!-- HOME-RESOURCES:END -->';
if (before.split(start).length !== 2 || before.split(end).length !== 2 || before.indexOf(start) > before.indexOf(end)) {
  throw new Error('Missing or duplicate homepage resource markers');
}
const after = before.slice(0, before.indexOf(start)) + start + '\n' + html + '\n' + end + before.slice(before.indexOf(end) + end.length);
if (process.argv.includes('--check')) {
  if (after !== before) throw new Error('Homepage catalog is stale. Run node scripts/build-home.mjs.');
} else if (after !== before) {
  writeFileSync(path, after);
}
console.log(JSON.stringify({status:'ok', resources:records.length, courses:courses.length, columns:columns.length}));
