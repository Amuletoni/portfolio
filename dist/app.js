const main = document.querySelector('main');
const categories = {'level-design': 'Level design', 'game-design': 'Game design'};
let content;

const esc = value => String(value ?? '').replace(/[&<>"']/g, char => (
  {'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]
));
function safeUrl(value) {
  try {
    const url = new URL(value, location.href);
    return ['https:', 'http:'].includes(url.protocol) ? esc(value) : '';
  } catch { return ''; }
}
const arrow = '<span aria-hidden="true">↗</span>';
const image = (src, alt, eager = false) =>
  `<img src="${safeUrl(src)}" alt="${esc(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async">`;
const link = (href, title) => `<a href="${esc(href)}">${esc(title)}</a>`;

function gameRow(game) {
  return `<li><a class="game-row" href="#project/${esc(game.id)}">
    ${game.image ? image(game.image, '') : ''}
    <div class="credit"><span class="meta">${esc(game.studio)}</span>
      <h3>${esc(game.title)}</h3><span class="role">${esc(game.role)}</span></div>
    <p>${esc(game.summary)}</p><span class="row-arrow" aria-hidden="true">→</span>
  </a></li>`;
}

function workshopLink(id, label) {
  const count = content.prototypes.filter(p => p.category === id && p.published).length;
  return `<a class="workshop-link" href="#lab/${id}"><strong>${label}</strong>
    <span>${count ? count + (count === 1 ? ' experiment' : ' experiments') : 'No entries yet'}</span>
    <span aria-hidden="true">→</span></a>`;
}

function home() {
  const p = content.profile;
  const games = content.projects.filter(project => project.context !== 'academic');
  const coursework = content.projects.filter(project => project.context === 'academic');
  main.innerHTML = `<div class="wrap">
    <section id="about" aria-label="Profile" class="profile">
      <div class="profile-cover">
        <img class="cover-art" src="assets/velvet-shell.webp" alt="" fetchpriority="high">
        <div class="cover-type"><p class="section-kicker">Profile <span>/</span> ${esc(p.experience)} years in games</p>
          <h1>${p.title.trim().split(/\s+/).map(word => `<span>${esc(word)}</span>`).join(' ')}</h1></div>
        <a class="cover-caption" href="#project/rainbow-six-siege"><span>Rainbow Six Siege</span>Operation Velvet Shell ${arrow}</a>
      </div>
      <div class="profile-summary"><p>${esc(p.intro)} ${esc(p.bio)}</p>
        <div id="contact" class="contact-links">${link('mailto:' + p.email, p.email)}
        <a href="${safeUrl(p.linkedin)}">LinkedIn ${arrow}</a></div></div>
      <ul class="studio-logos" aria-label="Studios I’ve worked at">
        ${(content.studios || []).map(s => `<li><img src="${safeUrl(s.logo)}" alt="${esc(s.name)}"></li>`).join('')}
      </ul>
    </section>
    <section id="work" class="home-section"><h2>Games &amp; Studios</h2>
      <div class="studio-credits">${(content.studioWork || []).map(job => `<article class="studio-note">
        ${job.label ? `<p class="meta">${esc(job.label)}</p>` : ''}
        <h3>${esc(job.studio)}</h3>
        ${job.role ? `<p class="role">${esc(job.role)} · ${esc(job.project)}</p>` : ''}
        <p>${esc(job.summary)}</p></article>`).join('')}</div>
      <ul class="games">${games.map(gameRow).join('')}</ul>
    </section>
    <section id="lab" class="home-section"><h2>The Workshop</h2>
      <div class="workshop-list">${Object.entries(categories).map(([id, label]) => workshopLink(id, label)).join('')}</div>
      ${coursework.map(game => `<div class="academic"><span class="meta">Academic project</span>
        <h3>${link('#project/' + game.id, game.title)}</h3>
        <p>${esc(game.studio)} · ${esc(game.summary)}</p></div>`).join('')}
    </section>
  </div>`;
}

function lab(kind) {
  const title = categories[kind] || 'All experiments';
  const entries = content.prototypes.filter(p => p.published && (kind === 'all' || p.category === kind));
  document.title = `${title} — The Workshop — Toni Guillem`;
  main.innerHTML = `<div class="wrap inner-page">${link('#lab', '← The Workshop')}
    <h1>${title}</h1>
    <nav class="lab-nav" aria-label="Workshop categories">
      ${Object.entries({all:'All experiments', ...categories}).map(([id, label]) =>
        `<a href="#lab/${id}" ${id === kind ? 'aria-current="page"' : ''}>${label}</a>`).join('')}
    </nav>
    ${entries.length ? entries.map(p => `<article class="academic"><h2>${link('#prototype/' + p.id, p.title)}</h2>
      ${p.image ? image(p.image, p.imageAlt || p.title) : ''}<p>${esc(p.summary)}</p></article>`).join('')
      : '<p>No experiments published here yet.</p>'}
  </div>`;
}
function media(p){let html=''; if(p.video){const u=safeUrl(p.video); if(u) html+=`<section class="media-block"><h2>Watch the prototype</h2><video controls preload="metadata" ${p.image?`poster="${safeUrl(p.image)}"`:''}><source src="${u}">Your browser does not support this video.</video></section>`;}if(p.videoUrl){const u=safeUrl(p.videoUrl);if(u) html+=`<div class="media-actions"><a class="text-link" href="${u}" target="_blank" rel="noopener noreferrer">Watch the video ${arrow}</a></div>`;}if(p.playableUrl){const u=safeUrl(p.playableUrl);if(u)html+=`<section class="media-block"><h2>Play the prototype</h2><div class="play-frame" data-player-url="${u}"><p>${esc(p.controls||'Open the build to see its controls and requirements.')}</p>${p.embed?'<button type="button" data-launch>Launch interactive build ↗</button>':''}<div class="media-actions" style="justify-content:center"><a class="text-link" style="color:inherit;border-color:currentColor" href="${u}" target="_blank" rel="noopener noreferrer">Open in a new tab ${arrow}</a></div></div></section>`;}if(p.download){html+=`<div class="media-actions"><a class="text-link" href="${safeUrl(p.download)}" download>Download build ↓</a></div>`;}return html;}

function detail(p, prototype) {
  document.title = `${p.title} — Toni Guillem`;
  const inWorkshop = prototype || p.context === 'academic';
  const back = prototype ? '#lab/' + p.category : inWorkshop ? '#lab' : '#work';
  const backLink = link(back, inWorkshop ? '← The Workshop' : '← Games & Studios');
  main.innerHTML = `<article class="wrap inner-page">
    ${backLink}
    <header class="detail-head"><div><p class="meta">${esc(p.studio || categories[p.category])}</p>
      <h1>${esc(p.title)}</h1><p class="job-title">${esc(p.role || '')}</p>
      <p>${esc(p.intro || p.summary)}</p></div>
      ${p.image ? image(p.image, p.imageAlt || p.title, true) : ''}</header>
    ${p.facts?.length ? `<dl class="facts">${p.facts.map(([k,v]) =>
      `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    <div class="case-body">${media(p)}
      ${(p.sections || []).map(s => `<section><h2>${esc(s.title)}</h2><p>${esc(s.body)}</p>
        ${s.image ? image(s.image, s.title) : ''}</section>`).join('')}
      ${p.notes ? `<section><h2>Design notes</h2><p>${esc(p.notes)}</p></section>` : ''}
      ${(p.gallery || []).map((src,i) => image(src, p.title + ' — image ' + (i+1))).join('')}
    </div><div class="back-bottom">${backLink}</div></article>`;

  document.querySelector('[data-launch]')?.addEventListener('click', event => {
    const player = event.target.closest('[data-player-url]');
    const frame = document.createElement('iframe');
    frame.title = p.title + ' playable build';
    frame.allow = 'fullscreen; gamepad';
    frame.sandbox = 'allow-scripts allow-same-origin allow-pointer-lock';
    frame.src = player.dataset.playerUrl;
    player.replaceWith(frame);
  });
}

function notFound() {
  main.innerHTML = `<div class="wrap inner-page"><h1>Page not found</h1>${link('#home','Return to profile')}</div>`;
}

function route() {
  const [type, id] = (location.hash.slice(1) || 'home').split('/');
  document.title = 'Toni Guillem — Technical Game Designer';
  let active = '';
  let target = main;
  if (['home','main','about','contact','work','lab'].includes(type) && !id) {
    home();
    active = ['work','lab'].includes(type) ? type : 'about';
    target = document.getElementById(type) || document.getElementById('about');
  } else if (type === 'lab' && (id === 'all' || Object.hasOwn(categories, id))) {
    lab(id);
    active = 'lab';
  } else if (type === 'project' || type === 'prototype') {
    const prototype = type === 'prototype';
    const project = (prototype ? content.prototypes.filter(p => p.published) : content.projects).find(p => p.id === id);
    if (project) {
      detail(project, prototype);
      active = prototype || project.context === 'academic' ? 'lab' : 'work';
    } else notFound();
  } else notFound();

  for (const item of document.querySelectorAll('.site-header nav a')) {
    if (item.hash === '#' + active) item.setAttribute('aria-current', 'location');
    else item.removeAttribute('aria-current');
  }
  if (location.hash) {
    target.tabIndex = -1;
    target.focus({preventScroll:true});
    target.scrollIntoView({block:'start'});
  }
}

document.querySelector('#year').textContent = new Date().getFullYear();
fetch('content.json').then(response => {
  if (!response.ok) throw new Error('Content unavailable');
  return response.json();
}).then(data => {
  content = data;
  route();
  window.addEventListener('hashchange', route);
}).catch(() => {
  main.innerHTML = '<div class="wrap inner-page"><h1>Portfolio unavailable</h1><p>Refresh the page or <a href="mailto:toni.guillem@gmail.com">email Toni</a>.</p></div>';
});
