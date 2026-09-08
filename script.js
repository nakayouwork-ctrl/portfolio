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
