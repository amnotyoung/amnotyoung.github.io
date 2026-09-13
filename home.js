const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
const mobile = window.matchMedia('(max-width: 900px)');
let menuOpen = false;
function syncMenu() {
  const focusedLinkWillHide = mobile.matches && !menuOpen && nav.contains(document.activeElement);
  menuToggle.hidden = !mobile.matches;
  nav.hidden = mobile.matches && !menuOpen;
  menuToggle.setAttribute('aria-expanded', String(mobile.matches && menuOpen));
  menuToggle.querySelector('span').textContent = menuOpen ? '−' : '+';
  if (focusedLinkWillHide) menuToggle.focus();
}
menuToggle.addEventListener('click', () => { menuOpen = !menuOpen; syncMenu(); });
document.querySelector('.site-header').addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobile.matches && menuOpen) {
    menuOpen = false;
    syncMenu();
    menuToggle.focus();
  }
});
mobile.addEventListener('change', () => { menuOpen = false; syncMenu(); });
syncMenu();

const input = document.querySelector('#resource-search');
const cards = [...document.querySelectorAll('.resource')];
const filters = [...document.querySelectorAll('[data-filter]')];
const status = document.querySelector('.result-status');
const emptyState = document.querySelector('.empty-state');
let activeFilter = 'all';
let searchTimer;
let isComposing = false;
const aliases = [['생성형 인공지능','생성형 ai'],['인공지능','ai'],['에이아이','ai'],['클로드 코드','claude code'],['클로드','claude'],['claudecode','claude code'],['코이카','koica'],['깃 허브','github'],['깃허브','github'],['git hub','github'],['엠씨피','mcp'],['파이썬','python'],['스타타','stata'],['세계 은행','world bank'],['세계은행','world bank'],['머신 러닝','machine learning'],['머신러닝','machine learning']];
function normalize(value) {
  let text = value.normalize('NFKC').toLocaleLowerCase('ko');
  aliases.forEach(([alias,word]) => { text = text.replaceAll(alias,word); });
  return text.replace(/[^\p{L}\p{N}]+/gu,' ').trim().replace(/\s+/g,' ');
}
function updateResults() {
  const words = normalize(input.value).split(/\s+/).filter(Boolean);
  let count = 0;
  cards.forEach(card => {
    const search = normalize(card.dataset.search);
    const matches = (activeFilter === 'all' || card.dataset.type === activeFilter || (card.dataset.filters ?? '').split(' ').includes(activeFilter))
      && words.every(word => search.includes(word) || search.replaceAll(' ','').includes(word));
    card.hidden = !matches;
    if (matches) count++;
  });
  status.textContent = words.length ? `검색 결과 ${count}개` : `${count}개의 ${status.dataset.unit ?? '자료'}`;
  emptyState.hidden = count !== 0;
}
filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  updateResults();
}));
input.addEventListener('compositionstart', () => { isComposing = true; clearTimeout(searchTimer); });
input.addEventListener('compositionend', () => { isComposing = false; updateResults(); });
input.addEventListener('input', () => { clearTimeout(searchTimer); if (!isComposing) searchTimer = setTimeout(updateResults, 180); });
document.querySelector('.search').addEventListener('submit', event => {
  event.preventDefault(); clearTimeout(searchTimer); updateResults();
});
document.querySelector('#reset-search').addEventListener('click', () => {
  clearTimeout(searchTimer);
  input.value = ''; activeFilter = 'all';
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter.dataset.filter === 'all')));
  updateResults(); input.focus();
});
document.querySelector('.library-tools').hidden = false;
updateResults();
