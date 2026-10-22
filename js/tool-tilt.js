import { prefersReducedMotion } from './helpers.js';

const STIFFNESS = 300;
const DAMPING = 20;

export function initToolTilt() {
  const grid = document.getElementById('sklist');
  const reduce = prefersReducedMotion();
  // x, v and t hold rotateX, rotateY and scale: current value, velocity and target
  const cards = Array.from(grid.querySelectorAll('.tool')).map(el => ({ el, x: [0, 0, 1], v: [0, 0, 0], t: [0, 0, 1] }));
  let raf = 0;
  let last = 0;

  function apply(card) {
    const [rx, ry, s] = card.x;
    card.el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(${s.toFixed(4)},${s.toFixed(4)},1)`;
  }

  function step(now) {
    const dt = Math.min(.032, (now - last) / 1000 || .016);
    last = now;
    let moving = false;
    cards.forEach(card => {
      for (let i = 0; i < 3; i++) {
        const accel = -STIFFNESS * (card.x[i] - card.t[i]) - DAMPING * card.v[i];
        card.v[i] += accel * dt;
        card.x[i] += card.v[i] * dt;
        if (Math.abs(card.v[i]) > .01 || Math.abs(card.x[i] - card.t[i]) > .001) moving = true;
      }
      apply(card);
    });
    raf = moving ? requestAnimationFrame(step) : 0;
  }

  function kick() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(step);
  }

  cards.forEach(card => {
    const el = card.el;
    el.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;
      el.classList.add('active');
      grid.classList.add('has-hover');
      if (!reduce) card.t[2] = 1.05;
      kick();
    });
    el.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || reduce) return;
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width * 2 - 1;
      const ny = (e.clientY - rect.top) / rect.height * 2 - 1;
      card.t[0] = -ny * 9;
      card.t[1] = nx * 9;
      kick();
    });
    el.addEventListener('pointerleave', () => {
      el.classList.remove('active');
      grid.classList.remove('has-hover');
      card.t[0] = 0;
      card.t[1] = 0;
      card.t[2] = 1;
      kick();
    });
    el.addEventListener('focus', () => {
      el.classList.add('active');
      grid.classList.add('has-hover');
    });
    el.addEventListener('blur', () => {
      el.classList.remove('active');
      grid.classList.remove('has-hover');
    });
  });
}
