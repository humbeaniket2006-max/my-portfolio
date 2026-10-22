import { tools } from '../data/tools.js';
import { projects } from '../data/projects.js';
import { openProject } from './project-modal.js';

function renderTool(tool) {
  const body = `<span class="tool-glow"></span><svg viewBox="0 0 24 24" width="56" height="56" fill="currentColor" aria-hidden="true">${tool.icon}</svg><span class="tool-name">${tool.name}</span><span class="tool-tag">${tool.tag}</span>`;
  if (!tool.project) return `<div class="tool">${body}</div>`;
  return `<a class="tool" href="#proj-wrapper" data-proj="${tool.project}" aria-label="${tool.name}, used in ${tool.usedIn}">${body}</a>`;
}

export function renderSkills() {
  const grid = document.getElementById('sklist');
  grid.innerHTML = tools.map(renderTool).join('');
  grid.querySelectorAll('[data-proj]').forEach(link => {
    link.addEventListener('click', e => {
      const project = projects.find(p => p.title === link.dataset.proj);
      if (!project) return;
      e.preventDefault();
      openProject(project);
    });
  });
}
