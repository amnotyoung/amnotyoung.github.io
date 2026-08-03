const grid = document.querySelector("#course-grid");
const searchInput = document.querySelector("#course-search");
const filterGroup = document.querySelector("#course-filters");
const emptyState = document.querySelector("#empty-state");
const viewer = document.querySelector("#course-viewer");
const viewerFrame = document.querySelector("#viewer-frame");
const viewerTitle = document.querySelector("#viewer-title");
const viewerType = document.querySelector("#viewer-type");
const viewerExternal = document.querySelector("#viewer-external");

let courses = [];
let activeFilter = "all";

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
  const query = searchInput.value.trim().toLocaleLowerCase("ko-KR");
  const visible = courses.filter((course) => {
    const matchesFilter = activeFilter === "all" || course.filters.includes(activeFilter);
    const haystack = [course.title, course.description, course.audience, ...course.tags]
      .join(" ")
      .toLocaleLowerCase("ko-KR");
    return matchesFilter && (!query || haystack.includes(query));
  });

  grid.innerHTML = visible.map(courseCard).join("");
  emptyState.hidden = visible.length !== 0;
  grid.hidden = visible.length === 0;
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

searchInput.addEventListener("input", renderCourses);

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
    const response = await fetch("data/courses.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    courses = await response.json();
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
    console.error("Course catalog load failed", error);
  }
}

loadCourses();
