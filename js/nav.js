export function initMobileNav() {
  const menu = document.getElementById('nav-mobile');
  const toggle = document.getElementById('nav-toggle');

  function setOpen(open) {
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setOpen(false)));
}

export function initNavScrollState() {
  const nav = document.getElementById('nav');
  const progress = document.getElementById('scroll-prog');

  function update() {
    nav.classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.75);
    const max = document.body.scrollHeight - window.innerHeight;
    progress.style.width = (max > 0 ? window.scrollY / max * 100 : 0) + '%';
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
}
