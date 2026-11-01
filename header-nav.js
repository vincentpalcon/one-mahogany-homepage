(() => {
  'use strict';
  const nav = document.querySelector('#main-nav');
  const header = document.querySelector('#site-header');
  if (!nav || !header) return;
  const desktop = matchMedia('(min-width: 1321px)');
  const links = [...nav.querySelectorAll('a:not(.mobile-nav-cta)')];
  const active = nav.querySelector('[aria-current="page"]') || links[0];
  const pill = document.createElement('span');
  pill.className = 'nav-follow-pill';
  pill.setAttribute('aria-hidden', 'true');
  nav.prepend(pill);
  let hovered = null;
  let frame = null;
  const target = () => hovered || (links.includes(document.activeElement) ? document.activeElement : active);
  function place() {
    frame = null;
    nav.classList.toggle('has-follow-pill', desktop.matches);
    if (!desktop.matches) {
      links.forEach(link => link.classList.remove('is-pill-target'));
      nav.classList.remove('pill-ready');
      return;
    }
    const link = target();
    pill.style.width = `${link.offsetWidth}px`;
    pill.style.height = `${link.offsetHeight}px`;
    pill.style.left = `${link.offsetLeft}px`;
    pill.style.top = `${link.offsetTop}px`;
    links.forEach(item => item.classList.toggle('is-pill-target', item === link));
    // Position the first frame without sweeping across the whole navigation.
    if (!nav.classList.contains('pill-ready')) requestAnimationFrame(() => nav.classList.add('pill-ready'));
  }
  function schedule() {
    if (frame === null) frame = requestAnimationFrame(place);
  }
  links.forEach(link => {
    link.addEventListener('pointerenter', event => { if (event.pointerType !== 'touch') { hovered = link; schedule(); } });
    link.addEventListener('focus', schedule);
  });
  nav.addEventListener('pointerleave', () => { hovered = null; schedule(); });
  nav.addEventListener('focusout', () => requestAnimationFrame(schedule));
  desktop.addEventListener('change', () => { hovered = null; schedule(); });
  window.addEventListener('resize', schedule, { passive: true });
  // Header padding and gap animate when it becomes sticky; follow their changing geometry.
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(schedule);
    observer.observe(nav);
    links.forEach(link => observer.observe(link));
  }
  if ('MutationObserver' in window) new MutationObserver(schedule).observe(header, { attributes: true, attributeFilter: ['class'] });
  if (document.fonts) document.fonts.ready.then(schedule);
  place();
})();

// Shared responsive navigation and scroll controls for every page.
(() => {
  'use strict';
  const header = document.querySelector('#site-header');
  const nav = document.querySelector('#main-nav');
  const toggle = document.querySelector('.menu-toggle');
  if (!header || !nav || !toggle) return;
  const desktop = matchMedia('(min-width: 1321px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const navHome = nav.parentElement;
  const drawer = document.createElement('dialog');
  drawer.id = 'mobile-menu';
  drawer.className = 'mobile-menu';
  drawer.setAttribute('aria-label', 'Site navigation');
  drawer.innerHTML = '<div class="mobile-menu-heading"><button class="mobile-menu-close" type="button" aria-label="Close navigation"><svg aria-hidden="true"><use href="#i-close"/></svg></button></div>';
  document.body.append(drawer);
  let closeTimer = null;
  function notify() { document.dispatchEvent(new Event('site-menu-change')); }
  function finishClose(restoreFocus = true) {
    clearTimeout(closeTimer);
    closeTimer = null;
    drawer.classList.remove('is-closing');
    if (drawer.open) drawer.close();
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Open navigation';
    if (restoreFocus && !desktop.matches) toggle.focus({ preventScroll: true });
    notify();
  }
  function closeDrawer(restoreFocus = true) {
    if (!drawer.open || drawer.classList.contains('is-closing')) return;
    toggle.setAttribute('aria-expanded', 'false');
    if (reducedMotion.matches) { finishClose(restoreFocus); return; }
    drawer.classList.add('is-closing');
    closeTimer = setTimeout(() => finishClose(restoreFocus), 240);
  }
  function openDrawer() {
    if (desktop.matches || drawer.open) return;
    clearTimeout(closeTimer);
    drawer.classList.remove('is-closing');
    nav.classList.add('is-open');
    document.body.classList.add('menu-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.querySelector('.sr-only').textContent = 'Close navigation';
    drawer.showModal();
    drawer.querySelector('.mobile-menu-close').focus({ preventScroll: true });
    notify();
  }
  function placeNavigation() {
    finishClose(false);
    if (desktop.matches) navHome.insertBefore(nav, navHome.querySelector('.header-cta'));
    else drawer.append(nav);
  }
  toggle.addEventListener('click', () => drawer.open ? closeDrawer() : openDrawer());
  drawer.querySelector('.mobile-menu-close').addEventListener('click', () => closeDrawer());
  drawer.addEventListener('cancel', event => { event.preventDefault(); closeDrawer(); });
  drawer.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !drawer.open) return;
    const stops = [...drawer.querySelectorAll('button,a[href]')];
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  drawer.addEventListener('click', event => {
    if (event.target === drawer && event.clientX < drawer.getBoundingClientRect().left) closeDrawer();
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeDrawer(false)));
  desktop.addEventListener('change', placeNavigation);
  placeNavigation();

  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'back-to-top';
  back.setAttribute('aria-label', 'Back to top');
  back.innerHTML = '<svg class="back-to-top-ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="back-to-top-track" cx="24" cy="24" r="21"/><circle class="back-to-top-progress" cx="24" cy="24" r="21" pathLength="100"/></svg><svg class="back-to-top-arrow" aria-hidden="true"><use href="#i-chevron-up"/></svg>';
  document.body.append(back);
  const ring = back.querySelector('.back-to-top-progress');
  let scrollFrame = null;
  function updateBack() {
    scrollFrame = null;
    const visible = window.scrollY >= 160;
    back.classList.toggle('is-visible', visible);
    back.tabIndex = visible ? 0 : -1;
    back.setAttribute('aria-hidden', String(!visible));
    back.inert = !visible;
    const distance = document.documentElement.scrollHeight - innerHeight;
    ring.style.strokeDashoffset = String(100 * (1 - Math.min(window.scrollY / Math.max(distance, 1), 1)));
  }
  function scheduleBack() { if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateBack); }
  window.addEventListener('scroll', scheduleBack, { passive: true });
  window.addEventListener('resize', scheduleBack, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(scheduleBack).observe(document.body);
  back.addEventListener('click', () => {
    header.querySelector('.brand').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  });
  updateBack();
})();
