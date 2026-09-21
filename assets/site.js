(function () {
  'use strict';

  // ---- Mobile menu ----
  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('site-nav');
  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () { setMenu(!nav.classList.contains('is-open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // ---- Footer year ----
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // ---- Active nav link on scroll ----
  var links = [].slice.call(document.querySelectorAll('.nav-links a'));
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          map[en.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // ---- Hero slider ----
  var hero = document.querySelector('.hero');
  var slides = [].slice.call(hero.querySelectorAll('.slide'));
  var dotsWrap = hero.querySelector('.dots');
  var INTERVAL = 7000;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var index = 0, timer = null, paused = false;

  hero.style.setProperty('--interval', INTERVAL + 'ms');

  var dots = slides.map(function (_, i) {
    var b = document.createElement('button');
    b.className = 'dot-btn';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    b.innerHTML = '<span></span>';
    b.addEventListener('click', function () { go(i, true); });
    dotsWrap.appendChild(b);
    return b;
  });

  function render() {
    slides.forEach(function (s, i) {
      var on = i === index;
      s.classList.toggle('is-active', on);
      s.setAttribute('aria-hidden', on ? 'false' : 'true');
      [].forEach.call(s.querySelectorAll('a,button'), function (el) { el.tabIndex = on ? 0 : -1; });
      if (on) {
        var img = s.querySelector('img');
        if (img && img.loading === 'lazy') img.loading = 'eager';
      }
    });
    dots.forEach(function (d, i) {
      d.classList.toggle('is-active', i === index);
      d.setAttribute('aria-selected', String(i === index));
    });
  }

  function schedule() {
    clearTimeout(timer);
    hero.classList.remove('is-playing');
    if (reduce || paused) return;
    // restart the progress animation
    void hero.offsetWidth;
    hero.classList.add('is-playing');
    timer = setTimeout(function () { go(index + 1); }, INTERVAL);
  }

  function go(i, user) {
    index = (i + slides.length) % slides.length;
    render();
    // preload the next slide's image
    var next = slides[(index + 1) % slides.length].querySelector('img');
    if (next) next.loading = 'eager';
    if (user) paused = false;
    schedule();
  }

  hero.querySelectorAll('.arrow').forEach(function (a) {
    a.addEventListener('click', function () { go(index + Number(a.dataset.dir), true); });
  });

  function pause() { paused = true; hero.classList.add('is-paused'); clearTimeout(timer); }
  function resume() { paused = false; hero.classList.remove('is-paused'); schedule(); }
  hero.addEventListener('mouseenter', pause);
  hero.addEventListener('mouseleave', resume);
  hero.addEventListener('focusin', pause);
  hero.addEventListener('focusout', resume);
  document.addEventListener('visibilitychange', function () { document.hidden ? pause() : resume(); });

  // Swipe
  var sx = null, sy = null;
  hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  hero.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) go(index + (dx < 0 ? 1 : -1), true);
    sx = sy = null;
  }, { passive: true });

  // Keyboard arrows when the slider has focus
  hero.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') go(index + 1, true);
    if (e.key === 'ArrowLeft') go(index - 1, true);
  });

  render();
  schedule();
})();
