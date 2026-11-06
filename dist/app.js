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
const slug = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const pad = number => String(number).padStart(2, '0');
// Text is escaped first; only [label](https://…) links are turned back into anchors.
const inline = text => esc(text).replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
  (_, label, url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`);
// A section body can be one string (blank lines split paragraphs) or a list of paragraphs.
const paragraphs = body => (Array.isArray(body) ? body : String(body ?? '').split(/\n{2,}/))
  .map(text => String(text).trim()).filter(Boolean).map(text => `<p>${inline(text)}</p>`).join('');

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
  const workshop = content.workshop || {};
  const blurb = workshop.categories?.[id]?.blurb;
  return `<a class="workshop-link" href="#lab/${id}">
    <span class="workshop-text"><strong>${label}</strong>${blurb ? `<span>${esc(blurb)}</span>` : ''}</span>
    <span class="status-pill${count ? ' is-live' : ''}">${count
      ? count + (count === 1 ? ' experiment' : ' experiments')
      : esc(workshop.badge || 'Coming soon')}</span>
    <span class="row-arrow" aria-hidden="true">→</span></a>`;
}

function home() {
  const p = content.profile;
  main.innerHTML = `<div class="wrap">
    <section id="about" aria-label="Profile" class="profile">
      <div class="profile-cover">
        <img class="cover-art" src="assets/velvet-shell.webp" alt="" fetchpriority="high">
        <div class="cover-type"><p class="section-kicker">Portfolio <span>/</span> ${esc(p.experience)} years in games</p>
          <h1>${p.title.trim().split(/\s+/).map(word => `<span>${esc(word)}</span>`).join(' ')}</h1></div>
        <a class="cover-caption" href="#project/rainbow-six-siege"><span>Rainbow Six Siege</span>Operation Velvet Shell ${arrow}</a>
      </div>
      <div class="profile-summary"><p>${esc(p.intro)} ${esc(p.bio)}</p>
        <div id="contact" class="contact-links">${link('mailto:' + p.email, p.email)}
        <a href="${safeUrl(p.linkedin)}">LinkedIn ${arrow}</a></div></div>
      <ul class="studio-logos" aria-label="Studios I’ve worked at">
        ${(content.studios || []).map(s => `<li><a href="${safeUrl(s.url)}"><img src="${safeUrl(s.logo)}" alt="${esc(s.name)}"></a></li>`).join('')}
      </ul>
    </section>
    <section id="work" class="home-section"><h2>Games &amp; Studios</h2>
      <ul class="games">${content.projects.map(gameRow).join('')}</ul>
      <div class="studio-credits">${(content.studioWork || []).map(job => `<article class="studio-note">
        ${job.label ? `<p class="meta">${esc(job.label)}</p>` : ''}
        <h3>${esc(job.studio)}</h3>
        ${job.role ? `<p class="role">${esc(job.role)} · ${esc(job.project)}</p>` : ''}
        <p>${esc(job.summary)}</p></article>`).join('')}</div>
    </section>
    <section id="lab" class="home-section"><h2>The Workshop</h2>
      <p class="workshop-intro">${esc(content.workshop?.intro || 'My spare-time projects in level design and game design.')}</p>
      <div class="workshop-list">${Object.entries(categories).map(([id, label]) => workshopLink(id, label)).join('')}</div>
    </section>
  </div>`;
}

// Shown on a Workshop page while it has no published experiments.
function labEmpty(kind) {
  const workshop = content.workshop || {};
  const info = (kind === 'all' ? workshop.all : workshop.categories?.[kind]) || {};
  const fallbackTitle = kind === 'all' ? 'Experiments are coming soon' : `${categories[kind]} experiments are coming soon`;
  const related = (info.related || []).filter(item => safeUrl(item.href));
  return `<section class="wip" aria-labelledby="wip-title">
    <p class="status-pill">${esc(workshop.banner || 'Work in progress')}</p>
    <h2 id="wip-title">${esc(info.title || fallbackTitle)}</h2>
    <p>${esc(info.message || 'Nothing is ready to show yet, so check back soon.')}</p>
    ${related.length ? `<ul class="wip-related" aria-label="Related work">${related.map(item =>
      `<li><a href="${safeUrl(item.href)}">${esc(item.label)} <span aria-hidden="true">→</span></a></li>`).join('')}</ul>` : ''}
  </section>`;
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
      : labEmpty(kind)}
  </div>`;
}
function media(p){let html=''; if(p.video){const u=safeUrl(p.video); if(u) html+=`<section class="media-block"><h2>Watch the prototype</h2><video controls preload="metadata" ${p.image?`poster="${safeUrl(p.image)}"`:''}><source src="${u}">Your browser does not support this video.</video></section>`;}if(p.videoUrl){const u=safeUrl(p.videoUrl);if(u) html+=`<div class="media-actions"><a class="text-link" href="${u}" target="_blank" rel="noopener noreferrer">Watch the video ${arrow}</a></div>`;}if(p.playableUrl){const u=safeUrl(p.playableUrl);if(u)html+=`<section class="media-block"><h2>Play the prototype</h2><div class="play-frame" data-player-url="${u}"><p>${esc(p.controls||'Open the build to see its controls and requirements.')}</p>${p.embed?'<button type="button" data-launch>Launch interactive build ↗</button>':''}<div class="media-actions" style="justify-content:center"><a class="text-link" style="color:inherit;border-color:currentColor" href="${u}" target="_blank" rel="noopener noreferrer">Open in a new tab ${arrow}</a></div></div></section>`;}if(p.download){html+=`<div class="media-actions"><a class="text-link" href="${safeUrl(p.download)}" download>Download build ↓</a></div>`;}return html;}

/* Case-study layouts. A project picks one with "layout" in content.json:
   (none)   sections stacked one after another
   dossier  contents index plus numbered entries, for projects with many contributions
   pillars  a lead section followed by the remaining sections side by side */
// Links to videos, for example [{"label": "Lion Rework analysis", "url": "https://…"}]. They open in a new tab.
function videoList(videos, label = true) {
  const items = (videos || []).filter(video => video && video.label && safeUrl(video.url));
  if (!items.length) return '';
  return `<div class="watch">${label ? '<p class="watch-label">Watch</p>' : ''}
    <ul class="watch-links" aria-label="Videos">${items.map(video =>
      `<li><a href="${safeUrl(video.url)}" target="_blank" rel="noopener noreferrer"><span class="play" aria-hidden="true">▶</span>${esc(video.label)} ${arrow}</a></li>`).join('')}</ul></div>`;
}

function sectionsDefault(p) {
  return (p.sections || []).map(s => {
    const text = paragraphs(s.body);
    return `<section><h2>${esc(s.title)}</h2>${text}${videoList(s.videos, Boolean(text))}
      ${s.image ? image(s.image, s.imageAlt || s.title) : ''}</section>`;
  }).join('');
}

// Tags are plain text or {label, url}; a tag with a URL becomes a link.
function tagList(tags, labelId) {
  if (!tags?.length) return '';
  return `<ul class="tags"${labelId ? ` aria-labelledby="${labelId}"` : ''}>${tags.map(tag => {
    const label = typeof tag === 'string' ? tag : tag.label;
    const url = typeof tag === 'string' ? '' : safeUrl(tag.url);
    return `<li>${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>` : esc(label)}</li>`;
  }).join('')}</ul>`;
}

function dossierEntry({s, n, key}) {
  const meta = [s.kind, s.year].filter(Boolean).map(esc).join(' <span class="sep" aria-hidden="true">/</span> ');
  return `<article class="dossier-entry${s.image ? ' has-figure' : ''}" id="entry-${key}" tabindex="-1" aria-labelledby="entry-${key}-title">
    <p class="entry-kicker"><span class="entry-no">${n}</span>${meta ? ` <span>${meta}</span>` : ''}</p>
    <h3 id="entry-${key}-title">${esc(s.title)}</h3>
    <div class="entry-text">${paragraphs(s.body)}
      ${s.steps?.length ? `<ul class="entry-steps">${s.steps.map(step => `<li>${inline(step)}</li>`).join('')}</ul>` : ''}
      ${s.tagsLabel ? `<p class="tags-label" id="entry-${key}-tags">${inline(s.tagsLabel)}</p>` : ''}${tagList(s.tags, s.tagsLabel ? `entry-${key}-tags` : '')}
      ${videoList(s.videos)}</div>
    ${s.image ? `<figure class="entry-figure">${image(s.image, s.imageAlt || s.title)}</figure>` : ''}
  </article>`;
}

function dossier(p) {
  const items = (p.sections || []).map((s, i) => ({s, n: pad(i + 1), key: slug(s.id || s.title) || String(i + 1)}));
  const groups = [];
  for (const item of items) {
    const name = item.s.group || '';
    const last = groups[groups.length - 1];
    if (last && last.name === name) last.items.push(item);
    else groups.push({name, items: [item]});
  }
  const rail = `<nav class="dossier-rail" id="contents" tabindex="-1" aria-label="${esc(p.title)} contributions">
    <p class="rail-title">${items.length} contributions</p>
    ${groups.map(g => `<div class="rail-group">${g.name ? `<p class="rail-heading">${esc(g.name)}</p>` : ''}
      <ul${g.name ? ` aria-label="${esc(g.name)}"` : ''}>${g.items.map(({s, n, key}) => `<li><a href="#project/${esc(p.id)}/${key}" data-jump="entry-${key}">
        <span class="rail-no">${n}</span><span class="rail-name">${esc(s.title)}</span>
        ${s.year ? `<span class="rail-year">${esc(s.year)}</span>` : ''}</a></li>`).join('')}</ul></div>`).join('')}
  </nav>`;
  const body = groups.map(g => {
    const entries = g.items.map(dossierEntry).join('');
    const compact = g.items.every(({s}) => s.size === 'compact');
    return `<section class="dossier-group">${g.name ? `<h2>${esc(g.name)}</h2>` : ''}
      ${compact ? `<div class="entry-cards">${entries}</div>` : entries}
      <a class="to-contents" href="#project/${esc(p.id)}" data-jump="contents">Back to contents <span aria-hidden="true">↑</span></a></section>`;
  }).join('');
  return `<div class="dossier">${rail}<div class="dossier-main">${body}</div></div>`;
}

function pillars(p) {
  const [lead, ...rest] = p.sections || [];
  return `${lead ? `<section class="pillar-lead"><h2>${esc(lead.title)}</h2>${paragraphs(lead.body)}</section>` : ''}
    ${rest.length ? `<div class="pillars">${rest.map((s, i) => `<section class="pillar">
      <p class="entry-kicker"><span class="entry-no">${pad(i + 1)}</span></p>
      <h2>${esc(s.title)}</h2>${paragraphs(s.body)}</section>`).join('')}</div>` : ''}`;
}

const layouts = {default: sectionsDefault, dossier, pillars};

function detail(p, prototype) {
  document.title = `${p.title} — Toni Guillem`;
  const back = prototype ? '#lab/' + p.category : '#work';
  const backLink = link(back, prototype ? '← The Workshop' : '← Games & Studios');
  const cover = p.coverImage || p.image;
  const layout = Object.hasOwn(layouts, p.layout) ? p.layout : 'default';
  main.innerHTML = `<article class="wrap inner-page">
    ${backLink}
    <header class="detail-head"><div><p class="meta">${esc(p.studio || categories[p.category])}</p>
      <h1>${esc(p.title)}</h1><p class="job-title">${esc(p.role || '')}</p>
      <p>${esc(p.intro || p.summary)}</p></div>
      ${cover ? image(cover, p.coverAlt || p.imageAlt || p.title, true) : ''}</header>
    ${p.facts?.length ? `<dl class="facts">${p.facts.map(([k,v]) =>
      `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>` : ''}
    <div class="case-body${layout === 'default' ? '' : ' case-wide'} case-${layout}">${media(p)}
      ${layouts[layout](p)}
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
  document.title = 'Page not found — Toni Guillem';
  main.innerHTML =`<div class="wrap inner-page"><h1>Page not found</h1>${link('#home','Return to profile')}</div>`;
}

function route() {
  // #project/<id>/<entry> opens a project and scrolls to one of its entries.
  const [type, id, entry] = (location.hash.slice(1) || 'home').split('/');
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
      active = prototype ? 'lab' : 'work';
      if (entry) target = document.getElementById('entry-' + entry) || main;
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

// Index links inside a case study jump to an entry without rebuilding the page.
main.addEventListener('click', event => {
  const jump = event.target.closest('a[data-jump]');
  if (!jump || event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const entry = document.getElementById(jump.dataset.jump);
  if (!entry) return;
  event.preventDefault();
  history.replaceState(null, '', jump.getAttribute('href'));
  entry.focus({preventScroll:true});
  entry.scrollIntoView({block:'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
});

// The skip link must not route: on an inner page "#main" would swap in the home page.
document.querySelector('.skip').addEventListener('click', event => {
  event.preventDefault();
  main.focus({preventScroll:true});
  main.scrollIntoView({block:'start'});
});

// A page that fails to render must not take the rest of the site down with it.
function safeRoute() {
  try { route(); } catch (error) {
    console.error(error);
    main.innerHTML = '<div class="wrap inner-page"><h1>Something went wrong</h1><p>This page could not be displayed. <a href="#home">Return to profile</a></p></div>';
  }
}

document.querySelector('#year').textContent = new Date().getFullYear();
fetch('content.json').then(response => {
  if (!response.ok) throw new Error('Content unavailable');
  return response.json();
}).then(data => {
  content = data;
  window.addEventListener('hashchange', safeRoute);
  safeRoute();
}).catch(() => {
  main.innerHTML = '<div class="wrap inner-page"><h1>Portfolio unavailable</h1><p>Refresh the page or <a href="mailto:toni.guillem@gmail.com">email Toni</a>.</p></div>';
});
