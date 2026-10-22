import { projects } from '../data/projects.js';
import { placeholder, flowDiagram } from './project-card.js';

const modal = document.getElementById('projModal');
const visual = document.getElementById('projModalVisual');
const meta = document.getElementById('projModalMeta');
const title = document.getElementById('projModalTitle');
const description = document.getElementById('projModalDesc');
const flow = document.getElementById('projModalFlow');
const list = document.getElementById('projModalList');
const links = document.getElementById('projModalLinks');
const linksSection = document.getElementById('projModalLinksWrap');
const closeButton = document.getElementById('projModalClose');

function modalVisual(project) {
  if (project.demoClip) {
    return `<video src="${project.demoClip}" autoplay muted loop playsinline aria-label="${project.title} demo clip"></video>`;
  }
  if (project.image) {
    return `<img src="${project.image}" alt="${project.title} project preview">`;
  }
  return placeholder(project, projects.indexOf(project));
}

export function openProject(project) {
  visual.innerHTML = modalVisual(project);
  visual.classList.remove('is-empty');
  title.textContent = project.title;
  meta.textContent = project.tags.slice(0, 3).join(' · ');
  description.textContent = project.problem;
  flow.innerHTML = flowDiagram(project);

  list.innerHTML = '';
  [['Problem', project.problem], ['Solution', project.solution], ['Result', project.result]]
    .filter(([, text]) => text)
    .forEach(([label, text]) => {
      const item = document.createElement('li');
      item.textContent = label + ': ' + text;
      list.appendChild(item);
    });

  links.innerHTML = '';
  if (project.link) {
    const anchor = document.createElement('a');
    anchor.href = project.link;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    anchor.textContent = project.linkLabel + ' ↗';
    links.appendChild(anchor);
  }
  linksSection.style.display = project.link ? '' : 'none';

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('proj-modal-lock');
  closeButton.focus({ preventScroll: true });
}

function closeProject() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('proj-modal-lock');
}

export function initProjectModal() {
  closeButton.addEventListener('click', closeProject);
  modal.addEventListener('click', e => {
    if (e.target === modal) closeProject();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeProject();
  });
}
