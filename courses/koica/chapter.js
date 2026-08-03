(() => {
  const chapters = window.KOICA_CHAPTERS || [];
  const chapterId = document.body.dataset.chapter;
  const chapter = chapters.find((item) => item.id === chapterId);
  const root = document.querySelector("#lesson-root");

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const chapterHref = (item) => `../${item.id}/`;

  function renderTable(table) {
    if (!table) return "";
    return `
      <div class="content-table-wrap">
        <table class="content-table">
          <thead><tr>${table.headers.map((cell) => `<th>${escapeHtml(cell)}</th>`).join("")}</tr></thead>
          <tbody>${table.rows
            .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
            .join("")}</tbody>
        </table>
      </div>`;
  }

  function renderCards(cards) {
    if (!cards?.length) return "";
    return `<div class="concept-grid">${cards
      .map(
        (card, index) => `
          <article class="concept-card">
            <span>${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.text)}</p>
          </article>`,
      )
      .join("")}</div>`;
  }

  function renderSteps(steps) {
    if (!steps?.length) return "";
    return `<ol class="flow-steps">${steps
      .map(
        (step, index) => `
          <li>
            <span>${String(index + 1).padStart(2, "0")}</span>
            <div><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></div>
          </li>`,
      )
      .join("")}</ol>`;
  }

  function renderExample(example) {
    if (!example) return "";
    return `
      <figure class="worked-example">
        <figcaption><span>EXAMPLE</span><strong>${escapeHtml(example.title)}</strong><p>${escapeHtml(example.description)}</p></figcaption>
        <pre><code>${escapeHtml(example.code)}</code></pre>
      </figure>`;
  }

  function renderCallout(callout) {
    if (!callout) return "";
    return `<aside class="lesson-callout"><strong>${escapeHtml(callout.label)}</strong><p>${escapeHtml(callout.text)}</p></aside>`;
  }

  function renderSection(section, index) {
    return `
      <section class="content-section" id="section-${index + 1}">
        <div class="content-section-heading">
          <p>${escapeHtml(section.eyebrow)}</p>
          <h2>${escapeHtml(section.title)}</h2>
        </div>
        <div class="prose">${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
        ${renderTable(section.table)}
        ${renderCards(section.cards)}
        ${renderSteps(section.steps)}
        ${renderExample(section.example)}
        ${renderCallout(section.callout)}
      </section>`;
  }

  function renderPractice(practice) {
    return `
      <section class="practice-section" id="practice">
        <div class="practice-heading">
          <p>PRACTICE</p>
          <h2>${escapeHtml(practice.title)}</h2>
          <span>${escapeHtml(practice.description)}</span>
        </div>
        <div class="practice-columns">
          <ol class="practice-steps">${practice.steps
            .map((step, index) => `<li><span>${index + 1}</span><p>${escapeHtml(step)}</p></li>`)
            .join("")}</ol>
          <div class="checklist">
            <h3>완료 전 확인</h3>
            ${practice.checklist
              .map(
                (item, index) => `
                  <label>
                    <input type="checkbox" data-check="${index}" />
                    <span>${escapeHtml(item)}</span>
                  </label>`,
              )
              .join("")}
          </div>
        </div>
      </section>`;
  }

  function renderResources(resources) {
    return `
      <section class="resource-block" id="resources">
        <div class="resource-block-heading"><p>CONTINUE</p><h2>원본과 실습자료</h2></div>
        <div class="lesson-resources">${resources
          .map(
            (resource) => `
              <a href="${escapeHtml(resource.url)}" target="_blank" rel="noreferrer">
                <span><strong>${escapeHtml(resource.title)}</strong><small>${escapeHtml(resource.text)}</small></span>
                <b aria-hidden="true">↗</b>
              </a>`,
          )
          .join("")}</div>
      </section>`;
  }

  function renderCourseNavigation() {
    return `
      <nav class="lesson-course-nav" id="course-nav" aria-label="전체 장">
        <div class="course-nav-top"><span>KOICA AI·DATA</span><strong>9개 장</strong></div>
        <ol>${chapters
          .map(
            (item) => `
              <li class="${item.id === chapter.id ? "current" : ""}">
                <a href="${chapterHref(item)}" ${item.id === chapter.id ? 'aria-current="page"' : ""}>
                  <span>${item.number}</span>
                  <div><small>${escapeHtml(item.label)}</small><strong>${escapeHtml(item.title)}</strong></div>
                </a>
              </li>`,
          )
          .join("")}</ol>
        <div class="course-progress">
          <div><span>읽은 장</span><strong id="completed-count">0 / ${chapters.length}</strong></div>
          <div class="course-progress-track"><i id="course-progress-fill"></i></div>
        </div>
      </nav>`;
  }

  function renderPager() {
    const index = chapters.indexOf(chapter);
    const previous = chapters[index - 1];
    const next = chapters[index + 1];
    return `
      <nav class="chapter-pager" aria-label="이전 및 다음 장">
        ${
          previous
            ? `<a class="pager-prev" href="${chapterHref(previous)}"><span>← 이전 장</span><strong>${previous.number}. ${escapeHtml(previous.title)}</strong></a>`
            : `<a class="pager-prev" href="../../"><span>← 과정 소개</span><strong>전체 목차 보기</strong></a>`
        }
        ${
          next
            ? `<a class="pager-next" href="${chapterHref(next)}"><span>다음 장 →</span><strong>${next.number}. ${escapeHtml(next.title)}</strong></a>`
            : `<a class="pager-next" href="../../../../"><span>과정 완료 →</span><strong>전체 강의로 돌아가기</strong></a>`
        }
      </nav>`;
  }

  function completionKeys() {
    try {
      return JSON.parse(localStorage.getItem("koica-course-completed") || "[]");
    } catch {
      return [];
    }
  }

  function updateCompletionUi() {
    const completed = completionKeys();
    const done = completed.includes(chapter.id);
    const button = document.querySelector("#complete-chapter");
    button?.classList.toggle("completed", done);
    button?.setAttribute("aria-pressed", String(done));
    if (button) button.innerHTML = done ? "읽음 완료 <span>✓</span>" : "이 장을 읽음으로 표시 <span>○</span>";
    const count = document.querySelector("#completed-count");
    const fill = document.querySelector("#course-progress-fill");
    if (count) count.textContent = `${completed.length} / ${chapters.length}`;
    if (fill) fill.style.width = `${(completed.length / chapters.length) * 100}%`;
  }

  if (!chapter || !root) {
    if (root) root.innerHTML = '<p class="lesson-error">요청한 장을 찾지 못했습니다. <a href="../../">과정 목차로 돌아가기</a></p>';
    return;
  }

  document.title = `${chapter.number}. ${chapter.title} · KOICA AI·데이터 활용`;
  document.querySelector('meta[name="description"]')?.setAttribute("content", chapter.summary);

  root.innerHTML = `
    <div class="reading-progress" aria-hidden="true"><span id="reading-progress-fill"></span></div>
    <header class="lesson-header">
      <a class="archive-link" href="../../../../" target="_top">amnotyoung / learning archive</a>
      <div class="lesson-header-actions">
        <a href="../../">과정 소개</a>
        <a href="https://amnotyoung.github.io/koica-oos-ai-training/#${chapter.slideStart}" target="_blank" rel="noreferrer">슬라이드 ↗</a>
        <button id="toc-toggle" type="button" aria-expanded="false" aria-controls="course-nav">목차</button>
      </div>
    </header>
    <div class="lesson-shell">
      ${renderCourseNavigation()}
      <main class="lesson-article">
        <section class="lesson-hero">
          <div class="lesson-meta"><span>CHAPTER ${chapter.number} / 09</span><span>${escapeHtml(chapter.duration)}</span></div>
          <p class="lesson-label">${escapeHtml(chapter.label)}</p>
          <h1>${escapeHtml(chapter.title)}</h1>
          <p class="lesson-summary">${escapeHtml(chapter.summary)}</p>
          <div class="lesson-goals">
            <strong>이 장을 마치면</strong>
            <ul>${chapter.goals.map((goal) => `<li>${escapeHtml(goal)}</li>`).join("")}</ul>
          </div>
        </section>
        <div class="lesson-body">${chapter.sections.map(renderSection).join("")}</div>
        ${renderPractice(chapter.practice)}
        ${renderResources(chapter.resources)}
        <button class="complete-button" id="complete-chapter" type="button" aria-pressed="false"></button>
        ${renderPager()}
      </main>
    </div>`;

  const tocToggle = document.querySelector("#toc-toggle");
  const courseNav = document.querySelector("#course-nav");
  tocToggle?.addEventListener("click", () => {
    const open = courseNav.classList.toggle("open");
    tocToggle.setAttribute("aria-expanded", String(open));
  });

  document.querySelector("#complete-chapter")?.addEventListener("click", () => {
    const completed = completionKeys();
    const next = completed.includes(chapter.id)
      ? completed.filter((item) => item !== chapter.id)
      : [...completed, chapter.id];
    localStorage.setItem("koica-course-completed", JSON.stringify(next));
    updateCompletionUi();
  });

  window.addEventListener(
    "scroll",
    () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
      const fill = document.querySelector("#reading-progress-fill");
      if (fill) fill.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
    },
    { passive: true },
  );

  updateCompletionUi();
})();
