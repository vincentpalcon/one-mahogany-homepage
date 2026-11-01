(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = $('#site-header');
  const nav = $('#main-nav');
  const menu = $('.menu-toggle');
  const updateHeader = () => {
    const sticky = header.classList.contains('scrolled');
    // Separate entry/exit points prevent flicker near the top of the page.
    header.classList.toggle('scrolled', window.scrollY > (sticky ? 16 : 48));
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const heroMediaVersion = '20261102a-9c14ea3efc62';
  const heroMediaUrl = path => `${path}?v=${heroMediaVersion}`;
  const hero = $('#home');
  const heroVideos = [$('#hero-video'), $('#hero-video-next')];
  const playButton = $('#video-play');
  const heroSlides = [
    { name: 'Community', file: 'community', lines: ['Stronger businesses.', 'Brighter communities.'], copy: "Behind every business is a person who built it. We help put the right support around what you've built." },
    { name: 'Support', file: 'support', lines: ['You built the business.', "We'll help you carry it."], copy: 'The right people, business systems, and processes—working together to take unnecessary work off your plate.' },
    { name: 'Success', file: 'success', lines: ['The right support.', 'A stronger tomorrow.'], copy: 'Bring the moving parts together, so you can focus on moving your business forward.' },
    { name: 'Freedom', file: 'freedom', lines: ['More time for', 'what matters most.'], copy: "Less time chasing the everyday. More room for the decisions—and the life—that need you." },
    { name: 'Family', file: 'family', lines: ['A business that works.', 'A life with room for more.'], copy: 'For your business. Your people. And the moments that make all the hard work worthwhile.' }
  ];
  let heroIndex = 0;
  let activeHeroSlot = 0;
  let heroVisible = true;
  let heroPaused = reducedMotion.matches || Boolean(navigator.connection?.saveData);
  let playAttempt = 0;
  let heroFocusHold = false;
  let heroFrame = null;
  let heroCopyChange = 0;
  let heroTransitionRunning = false;
  let pendingHeroManual = false;
  let requestedHeroIndex = 0;
  // Slowing the seven-second clips slightly leaves time to read each message.
  const heroPlaybackRate = 0.85;
  const heroFadeMs = 900;
  const heroFadeMedia = heroFadeMs / 1000 * heroPlaybackRate;
  const heroProgressRing = $('#hero-ring-value');
  const activeHeroVideo = () => heroVideos[activeHeroSlot];
  const canPlayHero = () => !heroPaused && !heroFocusHold && heroVisible && !document.hidden && !$('dialog[open]');
  const heroVariant = () => matchMedia('(max-width: 760px)').matches ? 'mobile' : 'desktop';

  function loadHeroVideo(element, index) {
    const slide = heroSlides[index];
    const variant = heroVariant();
    if (element.dataset.slide === String(index) && element.dataset.variant === variant && element.hasAttribute('src')) return;
    element.pause();
    element.poster = heroMediaUrl(`assets/images/hero/${slide.file}.webp`);
    element.dataset.slide = String(index);
    element.dataset.variant = variant;
    element.preload = 'auto';
    element.defaultPlaybackRate = heroPlaybackRate;
    element.playbackRate = heroPlaybackRate;
    element.src = heroMediaUrl(`assets/video/hero/${slide.file}-${variant}.mp4`);
    element.muted = true;
    element.load();
  }
  function syncHeroControl() {
    playButton.setAttribute('aria-label', heroPaused ? 'Play hero carousel' : 'Pause hero carousel');
    playButton.setAttribute('aria-pressed', String(!heroPaused));
    $('use', playButton).setAttribute('href', heroPaused ? '#i-play' : '#i-pause');
  }
  function renderHeroProgress() {
    const element = activeHeroVideo();
    let progress = 0;
    if (element.duration && element.currentTime) progress = Math.min(element.currentTime / (element.duration - heroFadeMedia), 1);
    heroProgressRing.style.strokeDashoffset = String(100 * (1 - progress));
  }
  // Start the next chapter before this clip ends, so neither picture freezes during the crossfade.
  function heroTick() {
    heroFrame = null;
    if (!canPlayHero()) return;
    const element = activeHeroVideo();
    const following = heroVideos[1 - activeHeroSlot];
    const nextIndex = (heroIndex + 1) % heroSlides.length;
    renderHeroProgress();
    if (!hero.dataset.pending && element.duration && element.duration - element.currentTime <= heroFadeMedia && following.dataset.slide === String(nextIndex) && following.readyState >= 3) showHeroSlide(nextIndex);
    if (heroFrame === null && canPlayHero()) heroFrame = requestAnimationFrame(heroTick);
  }
  const heroCopyParts = () => [$('#hero-chapter'), ...$$('.hero-line'), $('#hero-description')];
  function enterHeroCopy(elements) {
    elements.forEach((element, index) => {
      element.animate([{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], {
        duration: 440, delay: index * 40, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards'
      }).id = 'hero-copy-motion';
    });
  }
  function writeHeroCopy(slide) {
    $$('.hero-line').forEach((line, index) => { line.textContent = slide.lines[index]; });
    $('#hero-description').textContent = slide.copy;
    $('#hero-chapter').textContent = slide.name.toUpperCase();
  }
  // The old message leaves first, so two messages never share the screen.
  async function changeHeroCopy(slide, instant = false) {
    const change = ++heroCopyChange;
    const elements = heroCopyParts();
    const starting = elements.map(element => getComputedStyle(element).opacity);
    elements.forEach(element => element.getAnimations().filter(animation => animation.id === 'hero-copy-motion').forEach(animation => animation.cancel()));
    if (instant || reducedMotion.matches) { writeHeroCopy(slide); return; }
    const exits = elements.map((element, index) => {
      const exit = element.animate([{ opacity: starting[index] }, { opacity: 0, transform: 'translateY(-6px)' }], { duration: 160, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'both' });
      exit.id = 'hero-copy-motion';
      return exit;
    });
    await Promise.allSettled(exits.map(exit => exit.finished));
    if (change !== heroCopyChange) return;
    writeHeroCopy(slide);
    exits.forEach(exit => exit.cancel());
    enterHeroCopy(elements);
  }
  function prepareFollowingHero() {
    if (hero.dataset.pending || navigator.connection?.saveData || reducedMotion.matches || !canPlayHero()) return;
    if (heroVideos[1 - activeHeroSlot].classList.contains('is-leaving')) return;
    loadHeroVideo(heroVideos[1 - activeHeroSlot], (heroIndex + 1) % heroSlides.length);
  }
  async function playHeroVideo() {
    if (!canPlayHero()) return;
    const element = activeHeroVideo();
    const attempt = ++playAttempt;
    loadHeroVideo(element, heroIndex);
    try {
      await element.play();
      if (attempt !== playAttempt || element !== activeHeroVideo() || !canPlayHero()) {
        if ((element !== activeHeroVideo() && !element.classList.contains('is-leaving')) || !canPlayHero()) element.pause();
        return;
      }
      prepareFollowingHero();
    } catch (error) {
      if (attempt === playAttempt && element === activeHeroVideo() && error.name !== 'AbortError') {
        heroPaused = true;
        syncHeroControl();
      }
    }
  }
  function updateHeroLifecycle() {
    heroVideos.forEach(element => {
      if ((element !== activeHeroVideo() && !element.classList.contains('is-leaving') && !element.classList.contains('is-preparing')) || !canPlayHero()) element.pause();
    });
    if (canPlayHero()) {
      playHeroVideo();
      if (heroFrame === null) heroFrame = requestAnimationFrame(heroTick);
    } else {
      ++playAttempt;
      if (heroFrame !== null) cancelAnimationFrame(heroFrame);
      heroFrame = null;
    }
    syncHeroControl();
    renderHeroProgress();
  }
  function finishHeroFade() {
    heroVideos.forEach(element => {
      if (!element.classList.contains('is-leaving')) return;
      element.classList.remove('is-leaving');
      element.pause();
    });
    prepareFollowingHero();
  }
  // loadeddata can fire before a seek finishes. Keep the visible layer intact until
  // the replacement has a decoded frame at the beginning of its own clip.
  async function waitForHeroFrame(element) {
    const ready = await new Promise(resolve => {
      let timeout;
      const done = () => {
        const usable = element.readyState >= 2 && !element.seeking;
        if (!usable && !element.error) return;
        cleanup();
        resolve(usable);
      };
      const cleanup = () => {
        clearTimeout(timeout);
        ['loadeddata', 'seeked', 'canplay', 'error'].forEach(type => element.removeEventListener(type, done));
      };
      ['loadeddata', 'seeked', 'canplay', 'error'].forEach(type => element.addEventListener(type, done));
      timeout = setTimeout(() => { cleanup(); resolve(false); }, 5000);
      done();
    });
    if (!ready) return false;
    if (canPlayHero()) {
      try { await element.play(); } catch { return false; }
      if (element.requestVideoFrameCallback) {
        await new Promise(resolve => {
          let callback;
          const timeout = setTimeout(() => { element.cancelVideoFrameCallback(callback); resolve(); }, 250);
          callback = element.requestVideoFrameCallback(() => { clearTimeout(timeout); resolve(); });
        });
      }
    }
    return true;
  }
  async function transitionHeroSlide(index, manual) {
    const outgoing = activeHeroVideo();
    const incoming = heroVideos[1 - activeHeroSlot];
    incoming.classList.add('is-preparing');
    incoming.poster = heroMediaUrl(`assets/images/hero/${heroSlides[index].file}.webp`);
    if (!reducedMotion.matches && !navigator.connection?.saveData) {
      loadHeroVideo(incoming, index);
      try { incoming.currentTime = 0; } catch { /* Keep the poster until metadata is ready. */ }
      const ready = await waitForHeroFrame(incoming);
      if (!ready) {
        incoming.pause();
        incoming.classList.remove('is-preparing');
        return false;
      }
    } else {
      incoming.pause();
      incoming.removeAttribute('src');
      delete incoming.dataset.slide;
      incoming.load();
    }
    // A newer click can replace a request that is still loading, without flashing it onscreen.
    if (index !== requestedHeroIndex) {
      incoming.pause();
      incoming.classList.remove('is-preparing');
      return;
    }
    ++playAttempt;
    activeHeroSlot = 1 - activeHeroSlot;
    heroIndex = index;
    hero.dataset.chapter = heroSlides[index].file;
    outgoing.classList.remove('is-active');
    outgoing.classList.add('is-leaving');
    // Commit the hidden preparation state before enabling the dissolve. This also
    // resets the recycled layer when another navigation click is already queued.
    void incoming.offsetWidth;
    incoming.classList.remove('is-preparing');
    incoming.classList.add('is-active');
    $('#hero-current').textContent = String(index + 1).padStart(2, '0');
    changeHeroCopy(heroSlides[index]);
    if (manual) $('#hero-status').textContent = `Slide ${index + 1} of ${heroSlides.length}: ${heroSlides[index].name}. ${heroSlides[index].lines.join(' ')}`;
    updateHeroLifecycle();
    // Never reuse either layer while it is still contributing to the visible crossfade.
    await new Promise(resolve => setTimeout(resolve, reducedMotion.matches ? 0 : heroFadeMs));
    finishHeroFade();
    return true;
  }
  async function showHeroSlide(index, manual = false) {
    requestedHeroIndex = (index + heroSlides.length) % heroSlides.length;
    pendingHeroManual ||= manual;
    if (heroTransitionRunning) return;
    heroTransitionRunning = true;
    hero.dataset.pending = 'true';
    try {
      while (requestedHeroIndex !== heroIndex) {
        const target = requestedHeroIndex;
        const announce = pendingHeroManual;
        pendingHeroManual = false;
        const completed = await transitionHeroSlide(target, announce);
        if (completed === false && target === requestedHeroIndex) {
          requestedHeroIndex = heroIndex;
          $('#hero-status').textContent = 'This video could not load. Please try another slide.';
          break;
        }
      }
    } finally {
      pendingHeroManual = false;
      heroTransitionRunning = false;
      delete hero.dataset.pending;
      prepareFollowingHero();
    }
  }
  $('#hero-prev').addEventListener('click', event => showHeroSlide(requestedHeroIndex - 1, true));
  $('#hero-next').addEventListener('click', event => showHeroSlide(requestedHeroIndex + 1, true));
  playButton.addEventListener('click', () => {
    heroPaused = !heroPaused;
    updateHeroLifecycle();
  });
  heroVideos.forEach(element => {
    element.addEventListener('ended', () => {
      if (element === activeHeroVideo() && canPlayHero() && !hero.dataset.pending) showHeroSlide(heroIndex + 1);
    });
    element.addEventListener('playing', () => {
      if (element.classList.contains('is-leaving')) return;
      if (element.classList.contains('is-preparing') && canPlayHero()) return;
      if (element !== activeHeroVideo() || !canPlayHero()) { element.pause(); return; }
    });
    element.addEventListener('error', () => {
      if (element === activeHeroVideo()) { heroPaused = true; syncHeroControl(); }
    });
  });
  $('.hero-navigation').addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? heroSlides.length - 1 : requestedHeroIndex + (event.key === 'ArrowRight' ? 1 : -1);
    heroPaused = true;
    showHeroSlide(next, true);
    updateHeroLifecycle();
  });
  // Hold automatic movement while a keyboard user is inside the hero, then carry on when they leave.
  hero.addEventListener('focusin', event => {
    if (event.target !== playButton && event.target.matches(':focus-visible')) {
      heroFocusHold = true; updateHeroLifecycle();
    }
  });
  hero.addEventListener('focusout', event => {
    if (!hero.contains(event.relatedTarget) || event.relatedTarget === playButton) {
      heroFocusHold = false; updateHeroLifecycle();
    }
  });
  let heroTouch = null;
  hero.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'touch' || event.target.closest('a,button')) return;
    heroTouch = { x: event.clientX, y: event.clientY };
  }, { passive: true });
  hero.addEventListener('pointerup', event => {
    if (!heroTouch) return;
    const dx = event.clientX - heroTouch.x;
    const dy = event.clientY - heroTouch.y;
    heroTouch = null;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) showHeroSlide(requestedHeroIndex + (dx < 0 ? 1 : -1), true);
  }, { passive: true });
  hero.addEventListener('pointercancel', () => { heroTouch = null; });
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
    heroVisible = entries[0].isIntersecting;
    updateHeroLifecycle();
  }, { threshold: 0.08 }).observe(hero);
  hero.dataset.chapter = 'community';
  if (!reducedMotion.matches) enterHeroCopy([...heroCopyParts(), $('.hero-cta-row')]);
  syncHeroControl();
  updateHeroLifecycle();

  const selectedTopic = "I'm Not Sure";

  const capabilityTabs = $$('.capability-tabs [role="tab"]');
  function selectCapability(tab, focus = false) {
    capabilityTabs.forEach(item => {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      panel.hidden = !selected;
      if (selected) panel.classList.add('is-revealed');
    });
    if (focus) tab.focus();
  }
  capabilityTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCapability(tab));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? capabilityTabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + capabilityTabs.length) % capabilityTabs.length;
      selectCapability(capabilityTabs[next], true);
    });
  });
  function capabilityForHash(hash) {
    const tab = capabilityTabs.find(item => '#' + item.getAttribute('aria-controls') === hash);
    if (tab) selectCapability(tab);
  }
  $$('a[href="#voice-services"],a[href="#nonvoice-services"]').forEach(link => link.addEventListener('click', () => capabilityForHash(link.hash)));
  window.addEventListener('hashchange', () => capabilityForHash(location.hash));
  capabilityForHash(location.hash);

  const pillars = $$('.pillar');
  const stackedPillars = window.matchMedia('(max-width: 960px)');
  function openPillar(pillar) {
    pillars.forEach(item => {
      const open = stackedPillars.matches || item === pillar;
      item.classList.toggle('is-open', open);
      $('.pillar-toggle', item).setAttribute('aria-expanded', String(open));
    });
  }
  pillars.forEach(pillar => {
    pillar.addEventListener('mouseenter', () => openPillar(pillar));
    $('.pillar-toggle', pillar).addEventListener('click', () => openPillar(pillar));
    $('.pillar-toggle', pillar).addEventListener('focus', () => openPillar(pillar));
  });
  stackedPillars.addEventListener('change', () => openPillar(pillars[0]));
  openPillar(pillars[0]);
  let dialogOpener = null;
  function openDialog(dialog, opener = document.activeElement) {
    const activeDialog = $('dialog[open]');
    if (activeDialog) activeDialog.close();
    dialogOpener = opener;
    dialog.showModal();
    dialog.scrollTop = 0;
    document.body.classList.add('modal-open');
    updateHeroLifecycle();
    refreshCarousel();
  }
  function openContact(topic, opener = document.activeElement) {
    const select = $('#help-topic');
    select.value = [...select.options].some(option => option.value === topic) ? topic : selectedTopic;
    openDialog($('#contact-dialog'), opener);
  }
  $$('[data-dialog]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    openDialog(document.getElementById(link.dataset.dialog), link);
  }));
  $$('[data-contact]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    openContact(link.dataset.contact || selectedTopic, link);
  }));
  $$('.site-dialog').forEach(dialog => {
    $('[data-close]', dialog).addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if ($('dialog[open]')) return;
      document.body.classList.remove('modal-open');
      // Dialogs opened from another dialog return to the visible page.
      const opener = dialogOpener;
      if (opener && opener.getClientRects().length && !opener.closest('dialog:not([open])')) opener.focus({ preventScroll: true });
      else if (menu.getClientRects().length) menu.focus({ preventScroll: true });
      else $('.belief-conversion [data-contact]').focus({ preventScroll: true });
      updateHeroLifecycle();
      refreshCarousel();
    });
  });
  $('#contact-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const body = [
      'Hello One Mahogany Global,', '',
      `I'd like to talk about: ${data.get('topic')}`, '',
      data.get('message') || "I'd like help understanding where to start.", '',
      `Name: ${data.get('name')}`, `Business: ${data.get('business') || 'Not provided'}`,
      `Email: ${data.get('email')}`, `Phone: ${data.get('phone') || 'Not provided'}`
    ].join('\n');
    const subject = `Let's talk — ${data.get('topic')}`;
    $('#email-draft').href = `mailto:info@onemahogany.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    form.hidden = true;
    $('#message-ready').hidden = false;
    $('#email-draft').focus();
  });
  $('#edit-message').addEventListener('click', () => {
    $('#message-ready').hidden = true;
    $('#contact-form').hidden = false;
    $('#help-topic').focus();
  });

  // Clone one visual cycle so horizontal movement can wrap without a jump.
  const track = $('#industry-track');
  const originalCards = [...track.children];
  originalCards.forEach((card, index) => {
    card.classList.toggle('is-wide', index % 3 === 1);
    const clone = card.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    $('img', clone).alt = '';
    track.appendChild(clone);
  });
  let carouselPaused = reducedMotion.matches;
  let controlsHovered = false;
  let carouselFocused = false;
  let carouselVisible = !('IntersectionObserver' in window);
  let pointerActive = false;
  let resumeAt = 0;
  let previousTime = 0;
  let frameId = null;
  let cycleWidth = 0;
  let carouselPosition = 0;
  const pauseCarousel = $('#industry-pause');
  const carouselControls = pauseCarousel.closest('.carousel-controls');
  const updateCycleWidth = () => { cycleWidth = track.children[originalCards.length].offsetLeft - track.children[0].offsetLeft; };
  const syncCarouselButton = () => {
    pauseCarousel.setAttribute('aria-label', carouselPaused ? 'Play business carousel' : 'Pause business carousel');
    pauseCarousel.setAttribute('aria-pressed', String(carouselPaused));
    $('use', pauseCarousel).setAttribute('href', carouselPaused ? '#i-play' : '#i-pause');
  };
  const canAnimate = () => !carouselPaused && !controlsHovered && !carouselFocused && !pointerActive && carouselVisible && !document.hidden && !$('dialog[open]');
  function animateCarousel(time) {
    frameId = null;
    if (!canAnimate()) { previousTime = 0; return; }
    if (previousTime && time > resumeAt && cycleWidth) {
      // scrollLeft rounds small steps away, so the exact position is kept here.
      if (Math.abs(track.scrollLeft - carouselPosition) > 2) carouselPosition = track.scrollLeft;
      carouselPosition += Math.min(time - previousTime, 50) * cycleWidth / 50000;
      if (carouselPosition >= cycleWidth) carouselPosition -= cycleWidth;
      track.scrollLeft = carouselPosition;
    }
    previousTime = time;
    frameId = requestAnimationFrame(animateCarousel);
  }
  function refreshCarousel() {
    if (canAnimate() && frameId === null) frameId = requestAnimationFrame(animateCarousel);
    if (!canAnimate() && frameId !== null) { cancelAnimationFrame(frameId); frameId = null; previousTime = 0; }
  }
  pauseCarousel.addEventListener('click', () => { carouselPaused = !carouselPaused; syncCarouselButton(); refreshCarousel(); });
  // Photos keep moving on hover; hold the carousel while its controls are in use.
  carouselControls.addEventListener('mouseenter', () => { controlsHovered = true; refreshCarousel(); });
  carouselControls.addEventListener('mouseleave', () => { controlsHovered = false; refreshCarousel(); });
  track.addEventListener('focusin', event => { carouselFocused = event.target.matches(':focus-visible'); refreshCarousel(); });
  track.addEventListener('focusout', () => { carouselFocused = false; refreshCarousel(); });
  track.addEventListener('pointerdown', () => { carouselFocused = false; pointerActive = true; refreshCarousel(); }, { passive: true });
  const pointerEnd = () => {
    if (!pointerActive) return;
    pointerActive = false; carouselPosition = track.scrollLeft; refreshCarousel();
  };
  window.addEventListener('pointerup', pointerEnd, { passive: true });
  window.addEventListener('pointercancel', pointerEnd, { passive: true });
  track.addEventListener('wheel', event => {
    // Vertical page scrolling must not stall the photo ribbon.
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) resumeAt = performance.now() + 200;
  }, { passive: true });
  function moveCarousel(direction) {
    updateCycleWidth();
    if (direction < 0 && track.scrollLeft < 10) track.scrollLeft = cycleWidth;
    if (direction > 0 && track.scrollLeft >= cycleWidth) track.scrollLeft -= cycleWidth;
    // Navigate to real card edges: the editorial cards deliberately have mixed widths.
    const position = track.scrollLeft;
    const stops = [...originalCards, track.children[originalCards.length]].map(card => card.offsetLeft - originalCards[0].offsetLeft);
    const destination = direction > 0
      ? stops.find(stop => stop > position + 3) ?? cycleWidth
      : [...stops].reverse().find(stop => stop < position - 3) ?? 0;
    track.scrollTo({ left: destination, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
    resumeAt = performance.now() + 600;
  }
  $('#industry-prev').addEventListener('click', () => moveCarousel(-1));
  $('#industry-next').addEventListener('click', () => moveCarousel(1));
  track.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); moveCarousel(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  if ('ResizeObserver' in window) new ResizeObserver(updateCycleWidth).observe(track);
  updateCycleWidth();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { carouselVisible = entries[0].isIntersecting; refreshCarousel(); }, { rootMargin: '50px' }).observe(track);
  }
  reducedMotion.addEventListener('change', event => {
    carouselPaused = event.matches;
    syncCarouselButton(); refreshCarousel();
    if (event.matches) heroPaused = true;
    updateHeroLifecycle();
  });
  document.addEventListener('site-menu-change', () => { updateHeroLifecycle(); refreshCarousel(); });
  document.addEventListener('visibilitychange', () => {
    updateHeroLifecycle();
    refreshCarousel();
  });
  syncCarouselButton();
  // Animate the process once on entry; leave all content visible without JavaScript.
  const processJourney = $('.process-journey');
  if (processJourney && 'IntersectionObserver' in window && !reducedMotion.matches) {
    const processObserver = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      processJourney.classList.add('is-in-view');
      processObserver.disconnect();
    }, { threshold: 0.15 });
    processObserver.observe(processJourney);
  }
  const revealElements = [];
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    $$('.intro-statement, .intro-foot, .intro-editorial, .section-intro, .pillars, .process-photo, .proof-layout, .belief-copy, .belief-conversion').forEach(element => {
      element.classList.add('will-reveal'); revealElements.push(element); revealObserver.observe(element);
    });
    $$('.pressure-stories, .capability-panels, .outcome-grid, .process-steps').forEach(group => {
      [...group.children].filter(element => element.matches('article,li,button,figure')).forEach((element, index) => {
        element.classList.add('will-reveal');
        element.style.setProperty('--reveal-delay', `${Math.min(index, 3) * 60}ms`);
        revealElements.push(element); revealObserver.observe(element);
      });
    });
    reducedMotion.addEventListener('change', event => {
      if (event.matches) revealElements.forEach(element => { element.classList.add('is-revealed'); revealObserver.unobserve(element); });
    });
  }
  // Scroll-linked movement only: nothing here moves unless the visitor is scrolling.
  const resultStrip = $('#result-strip');
  const resultRun = $('.result-run');
  if (!reducedMotion.matches) {
    const repeat = resultRun.cloneNode(true);
    repeat.setAttribute('aria-hidden', 'true');
    resultStrip.append(repeat, repeat.cloneNode(true));
    resultStrip.classList.add('is-moving');
    let scrollFrame = null;
    const updateScrollMotion = () => {
      scrollFrame = null;
      const band = resultStrip.getBoundingClientRect();
      if (band.bottom > 0 && band.top < innerHeight && !reducedMotion.matches) {
        resultStrip.style.setProperty('--shift', `${-((innerHeight - band.top) * 0.35 % resultRun.offsetWidth)}px`);
      }
    };
    const requestScrollMotion = () => { if (scrollFrame === null) scrollFrame = requestAnimationFrame(updateScrollMotion); };
    window.addEventListener('scroll', requestScrollMotion, { passive: true });
    window.addEventListener('resize', requestScrollMotion, { passive: true });
    updateScrollMotion();
  }
  $('#copyright-year').textContent = String(new Date().getFullYear());
})();
