import { lerp } from './helpers.js';

export function initHeroParallax() {
  const hero = document.getElementById('hero');
  const video = document.getElementById('hImg');
  const tags = document.getElementById('hLayer1');
  const title = document.getElementById('hLayer2');
  const bottom = document.getElementById('hLayer3');

  let heroWidth = hero.offsetWidth;
  let heroHeight = hero.offsetHeight;
  let targetX = 0, targetY = 0;
  const tagsPos = [0, 0], titlePos = [0, 0], bottomPos = [0, 0], videoPos = [0, 0];

  window.addEventListener('resize', () => {
    heroWidth = hero.offsetWidth;
    heroHeight = hero.offsetHeight;
  });

  document.addEventListener('mousemove', e => {
    if (window.scrollY > heroHeight) return;
    targetX = (e.clientX / heroWidth - 0.5) * 2;
    targetY = (e.clientY / heroHeight - 0.5) * 2;
  });

  hero.addEventListener('mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  function ease(pos, x, y, ease) {
    pos[0] = lerp(pos[0], x, ease);
    pos[1] = lerp(pos[1], y, ease);
  }

  function frame() {
    if (window.scrollY <= heroHeight) {
      ease(tagsPos, targetX * 8, targetY * 5, .055);
      ease(titlePos, targetX * 18, targetY * 12, .065);
      ease(bottomPos, targetX * 10, targetY * 7, .06);
      ease(videoPos, targetX * -12, targetY * -8, .05);
      tags.style.transform = `translate(${tagsPos[0]}px,${tagsPos[1]}px)`;
      title.style.transform = `translate(${titlePos[0]}px,${titlePos[1]}px)`;
      bottom.style.transform = `translate(${bottomPos[0]}px,${bottomPos[1]}px)`;
      video.style.transform = `scale(1.06) translate(${videoPos[0]}px,${videoPos[1]}px)`;
    }
    requestAnimationFrame(frame);
  }

  frame();
}
