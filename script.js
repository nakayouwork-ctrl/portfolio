/* All content and navigation remain available without JavaScript. */
(() => {
  const links = [...document.querySelectorAll('.site-header nav a')];
  const sections = links.map(link => document.querySelector(link.hash)).filter(Boolean);
  if (!('IntersectionObserver' in window) || !sections.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -60% 0px' });
  sections.forEach(section => observer.observe(section));
})();

(() => {
  const video = document.querySelector('[data-nexoria-video]');
  const toggle = document.querySelector('[data-video-toggle]');
  if (!video || !toggle) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const updateToggle = () => {
    const action = video.paused ? 'PLAY' : 'PAUSE';
    toggle.textContent = action;
    toggle.setAttribute('aria-label', action === 'PLAY' ? '動画を再生' : '動画を一時停止');
  };
  const applyMotionPreference = () => {
    if (reducedMotion.matches) {
      video.pause();
      updateToggle();
      return;
    }
    video.play().catch(updateToggle);
  };

  toggle.addEventListener('click', () => {
    if (video.paused) video.play().catch(updateToggle);
    else video.pause();
  });
  video.addEventListener('play', updateToggle);
  video.addEventListener('pause', updateToggle);
  reducedMotion.addEventListener('change', applyMotionPreference);
  applyMotionPreference();
})();

(() => {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) return;

  const slides = [...slider.querySelectorAll('[data-hero-slide]')];
  const copies = [...slider.querySelectorAll('[data-slider-copy]')];
  const dots = [...slider.querySelectorAll('[data-slider-dot]')];
  const previous = slider.querySelector('[data-slider-prev]');
  const next = slider.querySelector('[data-slider-next]');
  const current = slider.querySelector('[data-slider-current]');
  const announcer = slider.querySelector('[data-slider-announcer]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const autoplayDelay = 4000;
  let activeIndex = 0;
  let autoplayTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let mouseIsOver = false;

  const normaliseIndex = index => (index + slides.length) % slides.length;

  const showSlide = (index, announce = false) => {
    activeIndex = normaliseIndex(index);
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
    });
    copies.forEach((copy, copyIndex) => {
      const isActive = copyIndex === activeIndex;
      copy.classList.toggle('is-active', isActive);
      copy.setAttribute('aria-hidden', String(!isActive));
    });
    dots.forEach((dot, dotIndex) => {
      if (dotIndex === activeIndex) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    current.textContent = String(activeIndex + 1).padStart(2, '0');
    if (announce) {
      const description = copies[activeIndex]?.innerText.replace(/\s+/g, ' ') || slides[activeIndex].querySelector('img')?.alt || '';
      announcer.textContent = `${activeIndex + 1}枚目 / ${slides.length}枚中。${description}`;
    }
  };

  const stopAutoplay = () => {
    window.clearTimeout(autoplayTimer);
    autoplayTimer = null;
  };

  const startAutoplay = (ignoreFocus = false) => {
    stopAutoplay();
    if (reducedMotion.matches || document.hidden || mouseIsOver || (!ignoreFocus && slider.contains(document.activeElement))) return;
    autoplayTimer = window.setTimeout(() => {
      showSlide(activeIndex + 1);
      startAutoplay(ignoreFocus);
    }, autoplayDelay);
  };

  const useSlide = index => {
    showSlide(index, true);
    startAutoplay(true);
  };

  previous.addEventListener('click', () => useSlide(activeIndex - 1));
  next.addEventListener('click', () => useSlide(activeIndex + 1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => useSlide(index)));

  slider.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'ArrowLeft') useSlide(activeIndex - 1);
    if (event.key === 'ArrowRight') useSlide(activeIndex + 1);
    if (event.key === 'Home') useSlide(0);
    if (event.key === 'End') useSlide(slides.length - 1);
  });

  slider.addEventListener('touchstart', event => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }, { passive: true });

  slider.addEventListener('touchend', event => {
    const touch = event.changedTouches[0];
    const distanceX = touch.clientX - touchStartX;
    const distanceY = touch.clientY - touchStartY;
    if (Math.abs(distanceX) < 45 || Math.abs(distanceX) <= Math.abs(distanceY)) return;
    useSlide(distanceX > 0 ? activeIndex - 1 : activeIndex + 1);
  }, { passive: true });

  slider.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'mouse') return;
    mouseIsOver = true;
    stopAutoplay();
  });
  slider.addEventListener('pointerleave', event => {
    if (event.pointerType !== 'mouse') return;
    mouseIsOver = false;
    startAutoplay(true);
  });
  slider.addEventListener('focusin', stopAutoplay);
  slider.addEventListener('focusout', () => window.setTimeout(startAutoplay, 0));
  document.addEventListener('visibilitychange', startAutoplay);
  reducedMotion.addEventListener('change', startAutoplay);

  showSlide(0);
  startAutoplay();
})();
