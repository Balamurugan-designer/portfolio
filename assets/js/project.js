(async () => {
  const root = document.getElementById('project');
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  const slug = new URLSearchParams(location.search).get('p');

  const playerHTML = (p) => {
    if (p.video && p.video.id) {
      return `
        <div class="player" data-type="${p.video.type}" data-id="${p.video.id}">
          <img src="${p.poster}" alt="${p.title}">
          <button class="player__play" aria-label="Play video">Play</button>
        </div>`;
    }
    return p.poster ? `<div class="player"><img src="${p.poster}" alt="${p.title}"></div>` : '';
  };

  if (!slug) {
    root.innerHTML = '<p class="loading">No project specified. <a href="index.html#work">Back to work</a></p>';
    return;
  }

  let projects = [];
  try {
    const res = await fetch('data/projects.json');
    if (!res.ok) throw new Error(res.status);
    projects = await res.json();
  } catch (err) {
    root.innerHTML = '<p class="loading">Could not load project data.</p>';
    return;
  }

  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) {
    root.innerHTML = '<p class="loading">Project not found. <a href="index.html#work">Back to work</a></p>';
    return;
  }

  const p = projects[i];
  const next = projects[(i + 1) % projects.length];

  document.title = `${p.title} — Balamurugan P`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', p.summary || '');

  root.innerHTML = `
    <a class="project__back" href="index.html#work">← All work</a>

    <div class="project__head">
      <div>
        <h1 class="project__title">${p.title}</h1>
        <p class="project__summary">${p.summary || ''}</p>
      </div>
      <dl class="meta">
        <dt>Year</dt><dd>${p.year || '—'}</dd>
        <dt>Client</dt><dd>${p.client || '—'}</dd>
        <dt>Role</dt><dd>${p.role || '—'}</dd>
        <dt>Tools</dt><dd>${p.tools || '—'}</dd>
      </dl>
    </div>

    ${playerHTML(p)}

    <div class="project__body">
      ${(p.body || []).map((t) => `<p>${t}</p>`).join('')}
    </div>

    ${(p.gallery && p.gallery.length) ? `
      <div class="gallery">
        ${p.gallery.map((src) => `<figure><img src="${src}" alt="" loading="lazy" decoding="async"></figure>`).join('')}
      </div>` : ''}

    ${(p.credits && p.credits.length) ? `
      <div class="credits">
        <h3>Credits</h3>
        <ul>
          ${p.credits.map((c) => `<li>${c.role} — <span>${c.name}</span></li>`).join('')}
        </ul>
      </div>` : ''}

    <a class="next" href="project.html?p=${encodeURIComponent(next.slug)}">
      <small>Next project</small>
      <strong>${next.title} →</strong>
    </a>
  `;

  const player = root.querySelector('.player[data-id]');
  if (player) {
    player.querySelector('.player__play').addEventListener('click', () => {
      const { type, id } = player.dataset;
      const src = type === 'youtube'
        ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
        : `https://player.vimeo.com/video/${id}?autoplay=1`;
      player.innerHTML = `<iframe src="${src}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${p.title}"></iframe>`;
    });
  }
})();