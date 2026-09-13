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
function updateResults() {
  const words = input.value.trim().toLocaleLowerCase('ko').split(/\s+/).filter(Boolean);
  let count = 0;
  cards.forEach(card => {
    const matches = (activeFilter === 'all' || card.dataset.type === activeFilter)
      && words.every(word => card.dataset.search.includes(word));
    card.hidden = !matches;
    if (matches) count++;
  });
  status.textContent = words.length ? `검색 결과 ${count}개` : `${count}개의 자료`;
  emptyState.hidden = count !== 0;
}
filters.forEach(button => button.addEventListener('click', () => {
  activeFilter = button.dataset.filter;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  updateResults();
}));
input.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(updateResults, 180); });
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
