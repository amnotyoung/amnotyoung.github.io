#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(),'any-column-layout-'));
try {
  for (const folder of ['scripts','data','columns/2099-W01']) mkdirSync(join(temp,folder),{recursive:true});
  copyFileSync(resolve(root,'scripts/build-column-layouts.mjs'),join(temp,'scripts/build-column-layouts.mjs'));
  copyFileSync(resolve(root,'index.html'),join(temp,'index.html'));
  const column = {id:'2099-W01',title:'신규 칼럼 레이아웃 검증',description:'새 글에도 읽기 레이아웃과 목차를 자동 적용하는지 확인합니다.',published:'2099-01-04'};
  writeFileSync(join(temp,'data/columns.json'),JSON.stringify([column]));
  const body = '<div class="opening"><p>본문의 조건·수치 42와 <code>**literal**</code> 보존</p></div><section class="column-section" id="section-1"><h2>검증 항목</h2><p>원문 유지</p><div class="column-source-list"><a href="https://example.org/evidence">근거</a></div></section>';
  const structured = '<script type="application/ld+json">{"@type":"Article"}</script>';
  const path = join(temp,'columns/2099-W01/index.html');
  writeFileSync(path,`<!doctype html><html lang="ko"><head><meta name="theme-color" content="#f0ede2" />${structured}<link rel="stylesheet" href="../../hub.css" /></head><body><article class="column-body">${body}</article></body></html>`);
  const run = args => spawnSync(process.execPath,[join(temp,'scripts/build-column-layouts.mjs'),...args],{encoding:'utf8'});
  assert.equal(run([]).status,0,'New legacy-style article should receive the shared design');
  const built = readFileSync(path,'utf8');
  assert.ok(built.includes(body),'Body, code and evidence links must stay intact');
  assert.ok(built.includes(structured),'Structured metadata must survive');
  assert.ok(built.includes('/columns/reader.css?v=any-v1'));
  assert.ok(built.includes('<a href="#section-1">검증 항목</a>'));
  assert.ok(built.includes('aria-controls="main-nav"'));
  assert.equal(run(['--check']).status,0,'Rebuilding must be idempotent');
  writeFileSync(path,built.replace('/columns/reader.css?v=any-v1','/missing-theme.css'));
  assert.notEqual(run(['--check']).status,0,'A missing theme must fail validation');
  writeFileSync(path,built.replace('class="column-body"','class="unknown-body"'));
  assert.notEqual(run([]).status,0,'Unknown content structure must fail, not drop the article');
  writeFileSync(path,built);
  mkdirSync(join(temp,'columns/2099-W02'));
  assert.notEqual(run([]).status,0,'An unregistered article must not bypass branding');
  console.log(JSON.stringify({status:'ok',newArticleAutoLayout:true,bodyPreserved:true,metadataPreserved:true,missingThemeRejected:true,unknownBodyRejected:true}));
} finally {
  rmSync(temp,{recursive:true,force:true});
}
