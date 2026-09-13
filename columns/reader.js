const toc = document.querySelector('.reader-toc');
const wideReading = window.matchMedia('(min-width: 901px)');
function setTocLayout() { toc.open = wideReading.matches; }
setTocLayout();
wideReading.addEventListener('change', setTocLayout);
