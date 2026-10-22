function revealOnce(elements, options, onReveal) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      onReveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, options);
  elements.forEach(el => observer.observe(el));
}

function initClipReveals(sectionId, stagger, threshold) {
  const section = document.getElementById(sectionId);
  const clips = section.querySelectorAll('.ci');
  revealOnce([section], { threshold }, () => {
    clips.forEach((clip, i) => setTimeout(() => clip.classList.add('in'), i * stagger));
  });
}

function initFadeReveals() {
  const selectors = ['.rfade', '.sec-reveal', '.sec-reveal-left', '.sec-reveal-right'];
  const options = { threshold: .06, rootMargin: '0px 0px -40px 0px' };
  selectors.forEach(selector => {
    revealOnce(document.querySelectorAll(selector), options, el => el.classList.add('in'));
  });
}

function initTextMotion() {
  const selectors = [
    '.sec-tag', '.about-big', '.about-txt', '.jrn-h2', '.jrn-note', '.jitem',
    '.sk-h2', '.aw-h2', '.aw', '.ct-tag', '.ct-title', '.ct-right'
  ];
  const headlines = '.about-big, .jrn-h2, .sk-h2, .aw-h2, .ct-title';
  const items = Array.from(document.querySelectorAll(selectors.join(',')));

  items.forEach((el, i) => {
    el.classList.add('text-motion');
    if (el.matches(headlines)) el.classList.add('motion-headline');
    el.style.setProperty('--tm-delay', (i % 7) * 55 + 'ms');
  });
  document.querySelectorAll('.jitem, .aw').forEach(el => el.classList.add('text-group-motion'));

  revealOnce(items, { threshold: .08, rootMargin: '0px 0px -35px 0px' }, el => el.classList.add('in'));
}

export function initReveals() {
  initClipReveals('about', 90, .1);
  initClipReveals('contact', 100, .15);
  initFadeReveals();
  initTextMotion();
}
