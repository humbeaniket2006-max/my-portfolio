import { links } from '../data/links.js';

export function renderContact() {
  const socials = links.socials.map(s => `<a href="${s.href}" target="_blank">${s.label}</a>`).join('');
  document.getElementById('contactLinks').innerHTML =
    `<a href="mailto:${links.email}" class="ct-email">${links.email}</a>` +
    `<div class="ct-socials">${socials}</div>` +
    `<a href="${links.resume}" target="_blank" class="ct-cv-btn">Download Resume ↓</a>`;
}
