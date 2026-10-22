import { renderMarquees } from './marquee.js';
import { renderJourney } from './journey.js';
import { renderSkills } from './skills.js';
import { renderAwards } from './awards.js';
import { renderContact } from './contact.js';
import { initProjectModal } from './project-modal.js';
import { initProjectVortex } from './project-vortex.js';
import { addProjectSchema } from './project-schema.js';
import { initToolTilt } from './tool-tilt.js';
import { initMobileNav, initNavScrollState } from './nav.js';
import { runPreloader } from './preloader.js';
import { initHeroParallax } from './hero-parallax.js';
import { initReveals } from './reveals.js';
import { initAboutStats } from './about-stats.js';

renderMarquees();
renderJourney();
renderSkills();
renderAwards();
renderContact();

initProjectModal();
initProjectVortex();
addProjectSchema();
initToolTilt();
initMobileNav();

runPreloader(() => {
  initNavScrollState();
  initHeroParallax();
  initReveals();
  initAboutStats();
  document.getElementById('footer-year').textContent = '© ' + new Date().getFullYear() + ' Aniket Humbe';
});
