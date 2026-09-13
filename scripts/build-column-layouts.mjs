#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const columns = JSON.parse(readFileSync(resolve(root,'data/columns.json'),'utf8'));
const registered = new Set(columns.map(column => column.id));
for (const entry of readdirSync(resolve(root,'columns'),{withFileTypes:true})) {
  if (entry.isDirectory() && /^\d{4}-W\d{2}$/.test(entry.name) && !registered.has(entry.name)) {
    throw new Error(`Register ${entry.name} in data/columns.json before publishing.`);
  }
}
const home = readFileSync(resolve(root,'index.html'),'utf8');
const siteHeader = home.match(/  <header class="site-header[\s\S]*?<\/header>/)?.[0].replace('href="/columns/"','href="/columns/" aria-current="page"');
if (!siteHeader) throw new Error('Shared site header is missing');
const escape = value => String(value).replace(/[&<>"']/g,char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const tidyBody = body => body
  .replace(/\s*<p class="column-section-number">[\s\S]*?<\/p>/g,'')
  .trim();

for (const column of columns) {
  const path = resolve(root,`columns/${column.id}/index.html`);
  const before = readFileSync(path,'utf8');
  const oldBody = before.match(/<article class="column-body">([\s\S]*?)<\/article>/)?.[1];
  if (!oldBody) throw new Error(`Article body is missing: ${column.id}`);
  const body = tidyBody(oldBody);
  // Reuse the original head so canonical URLs, dates, descriptions and other metadata survive.
  let head = before.match(/^[\s\S]*?<\/head>/)?.[0];
  if (!head) throw new Error(`Document head is missing: ${column.id}`);
  head = head.replace(/<meta name="theme-color" content="[^"]*"\s*\/>/,'<meta name="theme-color" content="#ffffff" />')
    .replaceAll('https://amnotyoung.github.io/assets/columns-og.png','https://amnotyoung.github.io/assets/any/columns-og-v2.png')
    .replaceAll('https://amnotyoung.github.io/assets/any/columns-og.png','https://amnotyoung.github.io/assets/any/columns-og-v2.png')
    .replaceAll('amnotyoung 주간 칼럼 — 뉴스보다 오래 남는 질문을 읽습니다','주간 칼럼 · amnotyoung')
    .replace(/\s*<link rel="stylesheet"[^>]*>/g,'')
    .replace(/\s*<link rel="preload"[^>]*>/g,'')
    .replace(/\s*<script[^>]*\bsrc="([^"]+)"[^>]*>[\s\S]*?<\/script>/g,(tag,src) => /(?:^|\/)(?:views|home|reader)\.js(?:\?|$)/.test(src) ? '' : tag)
    .replace(/\s*<\/head>/,`
    <link rel="preload" href="/assets/any/PretendardVariable.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="stylesheet" href="/home.css?v=any-v4" />
    <link rel="stylesheet" href="/columns/reader.css?v=any-v1" />
    <script defer src="/home.js?v=any-v4"></script>
    <script defer src="/columns/reader.js?v=any-v1"></script>
    <script defer src="/views.js"></script>
  </head>`);
  const toc = [...body.matchAll(/<section\b[^>]*\bid="([^"]+)"[^>]*>\s*<h2>([\s\S]*?)<\/h2>/g)].map(([,id,title]) => {
    if (!/^[a-zA-Z][\w-]*$/.test(id)) throw new Error(`Invalid section anchor: ${column.id}/${id}`);
    return `<li><a href="#${id}">${title}</a></li>`;
  }).join('\n');
  if (!toc) throw new Error(`No article sections found: ${column.id}`);
  const after = `${head}
  <body class="reader-page">
    <a class="skip-link" href="#article">본문 바로가기</a>
${siteHeader}
    <main id="article">
      <header class="reader-header wrap">
        <div class="reader-heading">
          <h1>${escape(column.title)}</h1>
          <div class="reader-meta"><time datetime="${column.published}">${column.published.replaceAll('-','.')}</time><span>조회 <b data-view-count="${column.id}">—</b></span></div>
          <p class="reader-dek">${escape(column.description)}</p>
        </div>
      </header>
      <div class="reader-layout wrap">
        <details class="reader-toc"><summary>목차</summary><nav aria-label="글의 순서"><ol>${toc}</ol></nav></details>
        <article class="column-body">
${body}
        </article>
      </div>
      <div class="reader-return wrap"><a href="/columns/">← 칼럼 목록</a></div>
    </main>
    <footer class="site-footer wrap"><div class="footer-links"><a href="https://github.com/amnotyoung">GitHub <span aria-hidden="true">↗</span></a><a href="https://www.threads.com/@amnotyoung.k" rel="me" aria-label="Threads · @amnotyoung.k">Threads <span aria-hidden="true">↗</span></a></div></footer>
  </body>
</html>
`;
  if (process.argv.includes('--check')) {
    if (before !== after) throw new Error(`Stale column layout: ${column.id}. Run node scripts/build-column-layouts.mjs.`);
  } else if (before !== after) writeFileSync(path,after);
}
console.log(JSON.stringify({status:'ok',columnLayouts:columns.length}));
