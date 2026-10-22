import { esc } from './helpers.js';

const groupGlyph = { 'Data and Infrastructure': '↗', 'Growth and Automation': '+', 'Product and Interfaces': '◌' };

export function placeholder(project, index) {
  const glyph = groupGlyph[project.group];
  const number = String(index + 1).padStart(2, '0');
  return `<svg viewBox="0 0 640 400" role="img" aria-label="Designed placeholder cover for ${esc(project.title)}" xmlns="http://www.w3.org/2000/svg"><rect width="640" height="400" fill="#f5f2eb"/><path d="M0 310H640V400H0Z" fill="#edeae2"/><path d="M42 52H210M42 52V112M598 348H430M598 348V288" stroke="#1a7a3c" stroke-width="3" fill="none"/><text x="34" y="345" fill="#a09890" opacity=".3" font-family="Playfair Display,serif" font-size="210" font-style="italic">${number}</text><text x="320" y="222" text-anchor="middle" fill="#1a7a3c" opacity=".22" font-family="Playfair Display,serif" font-size="180" font-weight="900">${glyph}</text><text x="42" y="84" fill="#1a7a3c" font-family="DM Mono,monospace" font-size="15" letter-spacing="3">${esc(project.group.toUpperCase())}</text></svg>`;
}

export function flowDiagram(project) {
  const [a, b, c, d] = project.diagram;
  return `<div class="modal-flow" role="img" aria-label="How ${esc(project.title)} works: ${esc(a)}, ${esc(b)}, ${esc(c)}, then ${esc(d)}"><svg viewBox="0 0 640 155" xmlns="http://www.w3.org/2000/svg"><path class="wire" d="M110 72H210M280 72H380M450 72H550"/><rect class="node" x="35" y="48" width="75" height="48" rx="5"/><rect class="node" x="210" y="48" width="70" height="48" rx="5"/><rect class="node" x="380" y="48" width="70" height="48" rx="5"/><rect class="node-hot" x="550" y="48" width="55" height="48" rx="5"/><text x="72" y="122" text-anchor="middle">${esc(a)}</text><text x="245" y="122" text-anchor="middle">${esc(b)}</text><text x="415" y="122" text-anchor="middle">${esc(c)}</text><text x="577" y="122" text-anchor="middle">${esc(d)}</text></svg></div>`;
}

function visual(project, index) {
  return project.image
    ? `<img src="${esc(project.image)}" alt="${esc(project.title)} project preview">`
    : placeholder(project, index);
}

export function projectCard(project, index) {
  const firstSentence = project.solution.match(/^.*?[.!?](?=\s|$)/);
  const summary = project.outcome || (firstSentence ? firstSentence[0] : project.solution);
  const tags = project.tags.map(tag => `<span class="ptag">${esc(tag)}</span>`).join('');
  return `<article class="system-card" data-project-index="${index}" tabindex="0" role="button" aria-label="Open details for ${esc(project.title)}"><div class="project-thumb">${visual(project, index)}</div><div class="card-copy"><span class="card-index">${esc(project.group)}</span><h3>${esc(project.title)}</h3><p class="card-summary">${esc(summary)}</p><div class="card-tags">${tags}</div><span class="card-open">View system ↗</span></div></article>`;
}
