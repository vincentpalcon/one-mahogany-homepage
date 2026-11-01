(() => {
  'use strict';
  const header = document.querySelector('#site-header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  const updateHeader = () => {
    const sticky = header.classList.contains('scrolled');
    // Separate entry/exit points prevent flicker near the top of the page.
    header.classList.toggle('scrolled', window.scrollY > (sticky ? 16 : 48));
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  const filters = [...document.querySelectorAll('[data-resource-filter]')];
  const resources = [...document.querySelectorAll('[data-resource-topic]')];
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    resources.forEach(item => { item.hidden = button.dataset.resourceFilter !== 'all' && item.dataset.resourceTopic !== button.dataset.resourceFilter; });
    const count = resources.filter(item => !item.hidden).length;
    document.querySelector('#resource-status').textContent = `${count} practical guide${count === 1 ? '' : 's'}`;
  }));

  const form = document.querySelector('#conversation-form');
  if (form) {
    const ready = document.querySelector('#conversation-ready');
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      const body = ['Hello One Mahogany Global,', '', "Here's what's happening in my business:", values.get('message'), '', 'What I would like to see change:', values.get('change') || 'I would like to discuss this.', '', `Name: ${values.get('name')}`, `Business: ${values.get('business') || 'Not provided'}`, `Email: ${values.get('email')}`, `Phone: ${values.get('phone') || 'Not provided'}`, `Website: ${values.get('website') || 'Not provided'}`].join('\n');
      document.querySelector('#conversation-draft').href = `mailto:info@onemahogany.com?subject=${encodeURIComponent("Let's talk about my business")}&body=${encodeURIComponent(body)}`;
      form.hidden = true;
      ready.hidden = false;
      document.querySelector('#conversation-ready-title').focus();
    });
    document.querySelector('#conversation-edit').addEventListener('click', () => {
      ready.hidden = true;
      form.hidden = false;
      document.querySelector('#your-situation').focus();
    });
  }
  document.querySelectorAll('[data-record-open]').forEach(button => {
    const dialog = document.getElementById(button.dataset.recordOpen);
    if (!dialog) return;
    button.addEventListener('click', () => {
      dialog.showModal();
      dialog.scrollTop = 0;
      document.body.classList.add('record-preview-open');
    });
    dialog.querySelector('[data-record-close]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      document.body.classList.remove('record-preview-open');
      button.focus({ preventScroll: true });
    });
  });

  // Playback belongs to the visitor; pause a film when it leaves the viewport.
  const chapterVideos = [...document.querySelectorAll('.brand-film video')];
  chapterVideos.forEach(video => video.addEventListener('play', () => {
    chapterVideos.forEach(other => { if (other !== video) other.pause(); });
  }));
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (!entry.isIntersecting) entry.target.pause(); });
    });
    chapterVideos.forEach(video => videoObserver.observe(video));
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) chapterVideos.forEach(video => video.pause());
  });
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !motionPreference.matches) {
    const chapterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('chapter-arrive');
        chapterObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.story-split, .photo-mosaic figure, .insight-card, .method-steps>li, .resource-card, .operating-rhythm, .brand-film-layout, .evidence-layout, .outcome-path, .heartland-feature').forEach((element, index) => {
      element.style.setProperty('--chapter-delay', `${index % 3 * 70}ms`);
      chapterObserver.observe(element);
    });
    motionPreference.addEventListener('change', event => { if (event.matches) chapterObserver.disconnect(); });
  }
  document.querySelector('#copyright-year').textContent = String(new Date().getFullYear());
})();
