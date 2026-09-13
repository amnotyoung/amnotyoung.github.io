#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const routes = ['/', '/courses/', '/development-cooperation/', '/columns/', '/open-source/'];
for (const route of routes) {
  const html = readFileSync(resolve(root, `.${route}index.html`), 'utf8');
  for (const required of ['/home.css?v=any-v3','/home.js?v=any-v3','/assets/any/any-logo-mono-reference.jpg','aria-controls="main-nav"','href="/"','content="#ffffff"']) {
    if (!html.includes(required)) throw new Error(`Missing shared branding on ${route}: ${required}`);
  }
  for (const navRoute of routes.slice(1)) {
    if (!html.includes(`href="${navRoute}"`)) throw new Error(`Missing navigation on ${route}: ${navRoute}`);
  }
  if (route !== '/' && !html.includes(`href="${route}" aria-current="page"`)) throw new Error(`Missing current navigation state: ${route}`);
  if (/href="[^"\n]*(?:hub\.css|styles\.css|columns\.css)/.test(html)) throw new Error(`Legacy theme still loaded: ${route}`);
  if (html.includes('name="robots" content="noindex')) throw new Error(`Public page excluded from indexing: ${route}`);
  const resources = [...html.matchAll(/<article class="resource"[^>]*>([\s\S]*?)<\/article>/g)];
  if (!resources.length) throw new Error(`No static resources: ${route}`);
  for (const [,resource] of resources) {
    const urls = [...resource.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
    if (urls.length !== new Set(urls).size) throw new Error(`Duplicate destination within a resource on ${route}`);
  }
}
console.log(JSON.stringify({status:'ok', brandedPages:routes.length}));
