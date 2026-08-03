const searchForm = document.querySelector("#course-search");
const searchInput = document.querySelector("#module-search");
const clearButton = document.querySelector("#search-clear");
const searchStatus = document.querySelector("#search-status");
const emptyState = document.querySelector("#search-empty");
const chapters = [...document.querySelectorAll(".chapter")];
const navigationItems = [...document.querySelectorAll(".course-nav [data-module]")];

const normalize = (value) =>
  String(value)
    .normalize("NFKC")
    .toLocaleLowerCase("ko-KR")
    .replace(/\s+/g, " ")
    .trim();

const searchableText = new Map(
  chapters.map((chapter) => [
    chapter.id,
    normalize(`${chapter.dataset.keywords || ""} ${chapter.textContent}`),
  ]),
);

function renderSearch() {
  const query = normalize(searchInput.value);
  let visibleCount = 0;

  chapters.forEach((chapter) => {
    const visible = !query || searchableText.get(chapter.id).includes(query);
    chapter.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  navigationItems.forEach((item) => {
    const chapter = document.querySelector(`#${item.dataset.module}`);
    item.hidden = chapter?.hidden ?? true;
  });

  clearButton.hidden = !query;
  emptyState.hidden = visibleCount !== 0;
  searchStatus.textContent = query ? `${visibleCount}개 모듈 찾음` : `${chapters.length}개 모듈`;
}

searchForm.addEventListener("submit", (event) => event.preventDefault());
searchInput.addEventListener("input", renderSearch);
clearButton.addEventListener("click", () => {
  searchInput.value = "";
  renderSearch();
  searchInput.focus();
});

renderSearch();
