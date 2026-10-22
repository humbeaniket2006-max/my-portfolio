import { prefersReducedMotion } from './helpers.js';

export function initAboutStats() {
  const svg = document.getElementById('abtSvg');
  const lastLabel = document.getElementById('abtL3');
  const cursor = document.getElementById('abtCursor');

  function placeCursor() {
    const end = +lastLabel.getAttribute('x') + lastLabel.getComputedTextLength() + 2;
    cursor.setAttribute('x', end.toFixed(1));
  }

  placeCursor();
  document.fonts.ready.then(placeCursor);
  if (prefersReducedMotion()) return;

  const numbers = svg.querySelectorAll('.abt-n');
  svg.classList.add('abt-ready');
  numbers.forEach(n => { n.textContent = '0'; });

  function countUp() {
    const start = performance.now() + 1500;
    const duration = 1300;
    function step(now) {
      const t = Math.min(Math.max((now - start) / duration, 0), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      numbers.forEach(n => { n.textContent = Math.round(+n.dataset.to * eased); });
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    observer.disconnect();
    placeCursor();
    svg.classList.add('abt-go');
    countUp();
  }, { threshold: .35 });
  observer.observe(svg);
}
