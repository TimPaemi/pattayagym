/* === Pattaya Gym Directory — UI logic === */
(function () {
  const gyms = window.GYMS || [];
  const cats = window.CATEGORIES || [];

  let activeCategory = "all";
  let query = "";

  const $ = (id) => document.getElementById(id);
  const grid = $("gym-grid");
  const chips = $("category-chips");
  const search = $("search");
  const searchClear = $("search-clear");
  const empty = $("empty-state");
  const resultCount = $("result-count");

  // Stats
  $("stat-total").textContent = gyms.length;
  $("stat-categories").textContent = cats.length;
  $("year").textContent = new Date().getFullYear();

  // Build category chips with counts
  const buildChips = () => {
    const counts = gyms.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {});
    const all = `<button class="chip ${activeCategory === "all" ? "active" : ""}" data-cat="all">All <span class="count">${gyms.length}</span></button>`;
    const rest = cats
      .map((c) => {
        const n = counts[c.key] || 0;
        const active = activeCategory === c.key ? "active" : "";
        return `<button class="chip ${active}" data-cat="${c.key}"><span>${c.emoji}</span> ${c.label} <span class="count">${n}</span></button>`;
      })
      .join("");
    chips.innerHTML = all + rest;

    chips.querySelectorAll(".chip").forEach((el) => {
      el.addEventListener("click", () => {
        activeCategory = el.dataset.cat;
        buildChips();
        render();
      });
    });
  };

  const escapeHtml = (s) =>
    String(s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const catLabel = (key) => {
    const c = cats.find((x) => x.key === key);
    return c ? `${c.emoji} ${c.label}` : key;
  };

  const renderCard = (g) => {
    const tags = (g.tags || []).map((t) => `<span class="card-tag">${escapeHtml(t)}</span>`).join("");
    const actions = [];
    // Every venue in data.js now has a generated /gyms/<id>/ page (build.js handles all entries)
    actions.push(`<a class="primary" href="/gyms/${g.id}/">View Details</a>`);
    if (g.mapsUrl) actions.push(`<a href="${g.mapsUrl}" target="_blank" rel="noopener">Map</a>`);
    if (g.website) actions.push(`<a href="${g.website}" target="_blank" rel="noopener">Website</a>`);
    if (g.phone) actions.push(`<a href="tel:${g.phone.replace(/\s/g, "")}">Call</a>`);
    const titleHtml = `<a href="/gyms/${g.id}/" style="color:inherit;text-decoration:none;">${escapeHtml(g.name)}</a>`;
    return `
      <article class="card">
        <span class="card-cat">${catLabel(g.category)}</span>
        <h3>${titleHtml}</h3>
        <div class="card-meta">
          ${g.area ? `<span>📍 ${escapeHtml(g.area)}</span>` : ""}
          ${g.priceRange ? `<span>💰 ${escapeHtml(g.priceRange)}</span>` : ""}
          ${g.hours ? `<span>🕐 ${escapeHtml(g.hours)}</span>` : ""}
        </div>
        <p class="card-desc">${escapeHtml(g.description || "")}</p>
        ${tags ? `<div class="card-tags">${tags}</div>` : ""}
        ${actions.length ? `<div class="card-actions">${actions.join("")}</div>` : ""}
      </article>
    `;
  };

  const matches = (g) => {
    if (activeCategory !== "all" && g.category !== activeCategory) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    const haystack = [
      g.name, g.area, g.address, g.description,
      catLabel(g.category), (g.tags || []).join(" ")
    ].join(" ").toLowerCase();
    return haystack.includes(q);
  };

  const render = () => {
    const filtered = gyms.filter(matches);
    grid.innerHTML = filtered.map(renderCard).join("");
    resultCount.textContent = filtered.length;
    empty.hidden = filtered.length > 0;
  };

  search.addEventListener("input", (e) => {
    query = e.target.value.trim();
    searchClear.classList.toggle("visible", query.length > 0);
    render();
  });

  searchClear.addEventListener("click", () => {
    search.value = "";
    query = "";
    searchClear.classList.remove("visible");
    render();
    search.focus();
  });

  // init
  buildChips();
  render();
})();
