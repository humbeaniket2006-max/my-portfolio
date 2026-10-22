import { experience, education, leadership } from '../data/journey.js';

function renderItem(item) {
  const certificate = item.certificate
    ? `<a href="${item.certificate.href}" target="_blank" class="jcert-link">${item.certificate.label}</a>`
    : '';
  return `<div class="jitem"><div class="jdate">${item.dates}</div><div class="jtitle">${item.title}</div><div class="jsub">${item.summary}</div>${certificate}</div>`;
}

export function renderJourney() {
  const columns = { experience, education, leadership };
  Object.entries(columns).forEach(([name, items]) => {
    document.querySelector(`[data-journey="${name}"]`).insertAdjacentHTML('beforeend', items.map(renderItem).join(''));
  });
}
