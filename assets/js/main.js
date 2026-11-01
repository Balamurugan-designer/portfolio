(async () => {
  /* year */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* nav scroll state */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px' });

  function observeReveals() {
    document.querySelectorAll('.reveal:not(.is-in)').forEach((el) => io.observe(el));
  }
  observeReveals();

  /* image error fallback */
  document.addEventListener('error', (e) => {
    const el = e.target;
    if (el.tagName === 'IMG') {
      el.style.opacity = '0';
      el.parentElement?.classList.add('is-empty');
    }
  }, true);

  /* home: project grid */
  const grid = document.getElementById('grid');
  const filtersEl = document.getElementById('filters');
  if (!grid) return;

  let projects = [];

  const render = (items) => {
    grid.innerHTML = items.map((p, i) => `
      <a class="card ${p.wide ? 'card--wide' : ''} reveal"
         href="project.html?p=${encodeURIComponent(p.slug)}"
         style="transition-delay:${Math.min(i * 60, 300)}ms">
        <div class="card__media">
          <img src="${p.thumb}" alt="${p.title}" loading="lazy" decoding="async">
        </div>
        <span class="card__arrow" aria-hidden="true">↗</span>
        <div class="card__body">
          <span class="card__title">${p.title}</span>
          <span class="card__meta">${p.category} · ${p.year}</span>
        </div>
      </a>
    `).join('');
    observeReveals();
  };

  try {
    const res = await fetch('data/projects.json');
    if (!res.ok) throw new Error(res.status);
    projects = (await res.json()).filter((p) => p.featured !== false);

    render(projects);

    const cats = ['All', ...new Set(projects.map((p) => p.category))];
    filtersEl.innerHTML = cats.map((c, i) =>
      `<button data-filter="${c}" class="${i === 0 ? 'is-active' : ''}">${c}</button>`
    ).join('');

    filtersEl.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      filtersEl.querySelectorAll('button').forEach((b) => b.classList.toggle('is-active', b === btn));
      const f = btn.dataset.filter;
      render(f === 'All' ? projects : projects.filter((p) => p.category === f));
    });
  } catch (err) {
    grid.innerHTML = '<p class="loading">Could not load projects. Check data/projects.json.</p>';
    console.error(err);
  }
})();