(() => {
  "use strict";

  const SITE_URN = "amnotyoung.github.io";
  const COUNTS_URL = "/data/pageviews.json";
  const ARTICLE_PATH = /^\/columns\/(\d{4}-W\d{2})\/?$/;
  const numberFormatter = new Intl.NumberFormat("ko-KR");
  const pendingTrackers = new Set();

  function track(urn) {
    const image = new Image(1, 1);
    const release = () => pendingTrackers.delete(image);

    image.alt = "";
    image.referrerPolicy = "no-referrer";
    image.onload = release;
    image.onerror = release;
    pendingTrackers.add(image);
    image.src = `https://hits.sh/${urn}.svg`;
  }

  function recordPageView() {
    if (window.location.hostname !== SITE_URN) return;

    track(SITE_URN);

    const article = window.location.pathname.match(ARTICLE_PATH);
    if (article) {
      track(`${SITE_URN}/columns/${article[1]}`);
    }
  }

  function totalFor(data, key) {
    if (key === "site") return data?.site?.total;
    return data?.columns?.[key]?.total;
  }

  async function renderCounts(elements) {
    try {
      const response = await fetch(COUNTS_URL, {
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      if (!response.ok) throw new Error(`Counter data returned ${response.status}`);

      const data = await response.json();
      for (const element of elements) {
        const total = totalFor(data, element.dataset.viewCount);
        if (!Number.isSafeInteger(total) || total < 0) continue;
        element.textContent = numberFormatter.format(total);
      }
    } catch {
      // Keep the neutral dash: a temporary counter outage must not affect reading.
    }
  }

  recordPageView();

  const countElements = [...document.querySelectorAll("[data-view-count]")];
  if (countElements.length > 0) renderCounts(countElements);
})();
