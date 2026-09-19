(() => {
  // Directory links are served as index.html on GitHub Pages. A file:// preview
  // needs the filename explicitly to navigate to the same document.
  if (window.location.protocol === 'file:') {
    for (const link of document.querySelectorAll('a[href]')) {
      const url = new URL(link.getAttribute('href'), window.location.href);
      if (url.protocol === 'file:' && url.pathname.endsWith('/')) {
        url.pathname += 'index.html';
        link.href = url.href;
      }
    }
  }

  const toggle = document.querySelector('.learning-menu-toggle');
  const nav = document.querySelector('#learning-main-nav');
  const mobile = window.matchMedia('(max-width: 900px)');
  let open = false;

  if (toggle && nav) {
    function syncMenu() {
      const shouldHide = mobile.matches && !open;
      if (shouldHide && nav.contains(document.activeElement)) toggle.focus();
      toggle.hidden = !mobile.matches;
      toggle.setAttribute('aria-expanded', String(mobile.matches && open));
      toggle.querySelector('span').textContent = open ? '−' : '+';
      nav.hidden = shouldHide;
    }
    toggle.addEventListener('click', () => { open = !open; syncMenu(); });
    toggle.closest('.learning-site-header').addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !mobile.matches || !open) return;
      open = false;
      syncMenu();
      toggle.focus();
    });
    mobile.addEventListener('change', () => { open = false; syncMenu(); });
    syncMenu();
  }

  const tocToggle = document.querySelector('#toc-toggle');
  const courseNav = document.querySelector('#course-nav');
  if (tocToggle && courseNav) {
    function closeToc() {
      if (courseNav.contains(document.activeElement)) tocToggle.focus();
      courseNav.classList.remove('open');
      tocToggle.setAttribute('aria-expanded', 'false');
    }
    tocToggle.addEventListener('click', () => {
      const isOpen = courseNav.classList.toggle('open');
      tocToggle.setAttribute('aria-expanded', String(isOpen));
    });
    courseNav.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && courseNav.classList.contains('open')) closeToc();
    });
    window.matchMedia('(max-width: 900px)').addEventListener('change', closeToc);
  }
})();
