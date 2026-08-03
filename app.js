const grid = document.querySelector("#course-grid");
const searchInput = document.querySelector("#course-search");
const filterGroup = document.querySelector("#course-filters");
const searchStatus = document.querySelector("#search-status");
const searchReset = document.querySelector("#search-reset");
const emptyState = document.querySelector("#empty-state");
const viewer = document.querySelector("#course-viewer");
const viewerFrame = document.querySelector("#viewer-frame");
const viewerTitle = document.querySelector("#viewer-title");
const viewerType = document.querySelector("#viewer-type");
const viewerExternal = document.querySelector("#viewer-external");

let courses = [];
let activeFilter = "all";
let courseSearchIndexes = new Map();
let isComposing = false;

const filterLabels = {
  all: "전체",
  work: "업무 활용",
  claude: "Claude Code",
  data: "데이터",
  stats: "통계 분석",
};

const searchAliases = [
  ["생성형 인공지능", "생성형 ai"],
  ["인공지능", "ai"],
  ["에이아이", "ai"],
  ["클로드 코드", "claude code"],
  ["클로드", "claude"],
  ["claudecode", "claude code"],
  ["코이카", "koica"],
  ["깃 허브", "github"],
  ["깃허브", "github"],
  ["git hub", "github"],
  ["엠씨피", "mcp"],
  ["파이썬", "python"],
  ["스타타", "stata"],
  ["세계 은행", "world bank"],
  ["세계은행", "world bank"],
  ["머신 러닝", "machine learning"],
  ["머신러닝", "machine learning"],
];

function normalizeSearchText(value) {
  let normalized = String(value ?? "").normalize("NFKC").toLocaleLowerCase("ko-KR");
  searchAliases.forEach(([alias, canonical]) => {
    normalized = normalized.replaceAll(alias, canonical);
  });
  return normalized
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildCourseSearchIndex(course) {
  const searchableFields = [
    course.title,
    course.description,
    course.audience,
    course.tags,
    course.keywords || [],
  ];
  const spaced = normalizeSearchText(searchableFields.flat(Infinity).join(" "));
  return { spaced, compact: spaced.replaceAll(" ", "") };
}

function matchesCourseSearch(course, rawQuery) {
  const query = normalizeSearchText(rawQuery);
  if (!query) return true;

  const index = courseSearchIndexes.get(course.id) || buildCourseSearchIndex(course);
  const compactQuery = query.replaceAll(" ", "");
  if (index.spaced.includes(query) || index.compact.includes(compactQuery)) return true;

  return query
    .split(" ")
    .every((term) => index.spaced.includes(term) || index.compact.includes(term));
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

function courseCard(course) {
  const tags = course.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  const stats = course.stats
    .map(
      (stat) =>
        `<span><strong>${escapeHtml(stat.value)}</strong>${escapeHtml(stat.label)}</span>`,
    )
    .join("");

  return `
    <article class="course-card" data-number="${escapeHtml(course.number)}" data-accent="${escapeHtml(course.accent)}">
      <div class="course-top">
        <span class="course-type">${escapeHtml(course.type)}</span>
        <span class="course-year">${escapeHtml(course.year)}</span>
      </div>
      <h3>${escapeHtml(course.title)}</h3>
      <p class="course-description">${escapeHtml(course.description)}</p>
      <div class="course-tags" aria-label="주요 주제">${tags}</div>
      <div class="course-bottom">
        <div class="course-stats">${stats}</div>
        <div class="course-actions">
          <a href="${escapeHtml(course.repository)}" target="_blank" rel="noreferrer">저장소 <span aria-hidden="true">↗</span></a>
          <button class="open-course" type="button" data-course-id="${escapeHtml(course.id)}">강의 보기 <span aria-hidden="true">→</span></button>
        </div>
      </div>
    </article>`;
}

function renderCourses() {
  const rawQuery = searchInput.value.trim();
  const visible = courses.filter((course) => {
    const matchesFilter = activeFilter === "all" || course.filters.includes(activeFilter);
    return matchesFilter && matchesCourseSearch(course, rawQuery);
  });

  grid.innerHTML = visible.map(courseCard).join("");
  emptyState.hidden = visible.length !== 0;
  grid.hidden = visible.length === 0;

  const hasConditions = Boolean(rawQuery) || activeFilter !== "all";
  const filterContext = activeFilter === "all" ? "" : ` · ${filterLabels[activeFilter]} 필터`;
  searchStatus.textContent = hasConditions
    ? `${visible.length}개 결과 · 전체 ${courses.length}개${filterContext}`
    : `전체 ${courses.length}개 강의`;
  searchReset.hidden = !hasConditions;

  if (visible.length === 0) {
    const emptyContext = rawQuery
      ? `‘${rawQuery.slice(0, 40)}’${filterContext}`
      : `${filterLabels[activeFilter]} 필터`;
    emptyState.textContent = `${emptyContext}에서 찾지 못했습니다. 검색어나 필터를 초기화해 보세요.`;
  }
}

function resetSearchControls({ focus = false } = {}) {
  searchInput.value = "";
  activeFilter = "all";
  filterGroup.querySelectorAll("[data-filter]").forEach((item) => {
    const active = item.dataset.filter === "all";
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  renderCourses();
  if (focus) searchInput.focus();
}

function openCourse(course) {
  viewerTitle.textContent = course.title;
  viewerType.textContent = course.type.toUpperCase();
  viewerExternal.href = course.url;
  viewerFrame.src = course.url;
  viewer.showModal();
  document.body.style.overflow = "hidden";
}

function closeViewer() {
  viewer.close();
  viewerFrame.src = "about:blank";
  document.body.style.overflow = "";
}

grid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-course-id]");
  if (!button) return;
  const course = courses.find((item) => item.id === button.dataset.courseId);
  if (course) openCourse(course);
});

searchInput.addEventListener("compositionstart", () => {
  isComposing = true;
});
searchInput.addEventListener("compositionend", () => {
  isComposing = false;
  renderCourses();
});
searchInput.addEventListener("input", () => {
  if (!isComposing) renderCourses();
});
searchInput.addEventListener("keydown", (event) => {
  if (isComposing || event.isComposing) return;
  if (event.key !== "Escape" || (!searchInput.value && activeFilter === "all")) return;
  event.preventDefault();
  resetSearchControls();
});
searchReset.addEventListener("click", () => resetSearchControls({ focus: true }));

filterGroup.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  activeFilter = button.dataset.filter;
  filterGroup.querySelectorAll("[data-filter]").forEach((item) => {
    const active = item === button;
    item.classList.toggle("active", active);
    item.setAttribute("aria-pressed", String(active));
  });
  renderCourses();
});

document.querySelector("#viewer-close").addEventListener("click", closeViewer);
viewer.addEventListener("click", (event) => {
  if (event.target === viewer) closeViewer();
});
viewer.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeViewer();
});

async function loadCourses() {
  try {
    const response = await fetch("../data/courses.json?v=search-v2");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    courses = await response.json();
    courseSearchIndexes = new Map(
      courses.map((course) => [course.id, buildCourseSearchIndex(course)]),
    );
    renderCourses();

    const totals = courses.reduce(
      (acc, course) => ({
        modules: acc.modules + course.modules,
        slides: acc.slides + course.slides,
      }),
      { modules: 0, slides: 0 },
    );
    document.querySelector("#course-count").textContent = String(courses.length).padStart(2, "0");
    document.querySelector("#module-count").textContent = String(totals.modules).padStart(2, "0");
    document.querySelector("#slide-count").textContent = String(totals.slides);
  } catch (error) {
    grid.innerHTML = `<div class="loading-card">강의 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</div>`;
    searchStatus.textContent = "강의 목록을 불러오지 못했습니다.";
    searchInput.disabled = true;
    filterGroup.querySelectorAll("button").forEach((button) => {
      button.disabled = true;
    });
    searchReset.hidden = true;
    console.error("Course catalog load failed", error);
  }
}

loadCourses();
