// assets/js/app.js

// Helpers
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* Year */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* Header style on scroll */
const header = $('#siteHeader');
function onScrollHeader() {
  if (!header) return;
  header.classList.toggle('is-scrolled', window.scrollY > 6);
}
onScrollHeader();
window.addEventListener('scroll', onScrollHeader, { passive: true });

/* Mobile nav toggle */
const navToggle = $('#navToggle');
const primaryNav = $('#primaryNav');

function setNavOpen(open) {
  if (!navToggle || !primaryNav) return;
  primaryNav.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
}

if (navToggle && primaryNav) {
  navToggle.addEventListener('click', () => {
    setNavOpen(!primaryNav.classList.contains('is-open'));
  });

  // Close menu when clicking a link
  primaryNav.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (a) setNavOpen(false);
  });

  // Close on Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setNavOpen(false);
  });
}

/* Reveal animation on scroll (IntersectionObserver) */
const revealEls = $$('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.12 });

  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* Stagger animation for service cards */
const cards = $$('.nav-card');
cards.forEach((card, i) => {
  setTimeout(() => card.classList.add('show'), 120 + i * 90);
});

/* Marquee: duplicate track + dynamic duration */
const track = $('#track');
function setMarqueeDuration() {
  if (!track) return;
  const w = track.scrollWidth;
  const seconds = Math.max(18, Math.min(40, w / 180));
  track.style.animationDuration = seconds + 's';
}

if (track) {
  // Clone once for seamless loop
  track.appendChild(track.cloneNode(true));
  setMarqueeDuration();

  let mqT = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(mqT);
    mqT = window.setTimeout(setMarqueeDuration, 120);
  });
}

/* Back to top button */
const toTop = $('#toTop');
function onScrollToTop() {
  if (!toTop) return;
  toTop.classList.toggle('show', window.scrollY > 600);
}
onScrollToTop();
window.addEventListener('scroll', onScrollToTop, { passive: true });

if (toTop) {
  toTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* Toast */
const toast = $('#toast');
let toastTimer = null;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
}

/* Animated counters (KPI) */
function animateNumber(el, to, duration = 900) {
  const start = performance.now();
  const from = 0;
  const isFloat = String(to).includes('.');
  const decimals = isFloat ? (String(to).split('.')[1]?.length || 1) : 0;

  function tick(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    const value = from + (to - from) * eased;
    el.textContent = isFloat ? value.toFixed(decimals) : Math.round(value).toString();
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const kpiEls = $$('[data-kpi]');
if ('IntersectionObserver' in window && kpiEls.length) {
  const ioKpi = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.done === '1') return;
      el.dataset.done = '1';
      const to = Number(el.getAttribute('data-kpi'));
      animateNumber(el, to, 950);
    });
  }, { threshold: 0.35 });

  kpiEls.forEach((el) => ioKpi.observe(el));
} else {
  kpiEls.forEach((el) => animateNumber(el, Number(el.getAttribute('data-kpi')), 950));
}

/* Small counter in hero stat (+60%) */
const countEl = $('[data-count]');
if (countEl) {
  const to = Number(countEl.getAttribute('data-count'));
  animateNumber(countEl, to, 900);
}

/* Projects filter */
const chips = $$('.chip');
const projectCards = $$('.project-card');

function setFilter(filter) {
  chips.forEach((c) => {
    const active = c.dataset.filter === filter;
    c.classList.toggle('active', active);
    c.setAttribute('aria-selected', active ? 'true' : 'false');
  });

  projectCards.forEach((card) => {
    const type = card.dataset.type;
    const show = filter === 'all' || filter === type;
    card.style.display = show ? '' : 'none';
  });
}

chips.forEach((chip) => {
  chip.addEventListener('click', () => setFilter(chip.dataset.filter));
});

/* Quick quote form (front validation + fake submit) */
const form = $('#quickQuoteForm');

function setError(name, msg) {
  const err = $(`.error[data-for="${name}"]`);
  if (err) err.textContent = msg || '';
}

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
}

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const need = String(data.get('need') || '').trim();

    let ok = true;

    setError('name', '');
    setError('email', '');
    setError('need', '');

    if (name.length < 2) { setError('name', 'Veuillez indiquer votre nom.'); ok = false; }
    if (!isEmail(email)) { setError('email', 'Veuillez entrer un e‑mail valide.'); ok = false; }
    if (!need) { setError('need', 'Veuillez sélectionner un type de projet.'); ok = false; }

    if (!ok) {
      showToast('Merci de corriger le formulaire.');
      return;
    }

    // Ici vous brancherez votre PHP (envoi mail / DB).
    // Démo : on simule un succès.
    form.querySelectorAll('button, input, select, textarea').forEach((el) => el.disabled = true);

    window.setTimeout(() => {
      showToast('Demande envoyée. Nous vous contactons sous 24–48h.');
      form.reset();
      form.querySelectorAll('button, input, select, textarea').forEach((el) => el.disabled = false);
    }, 650);
  });
}