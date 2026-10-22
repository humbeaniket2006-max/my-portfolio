import { awards } from '../data/awards.js';

function renderAward(award) {
  return `<div class="aw"><div class="aw-yr">${award.year}</div><div class="aw-nm"><a href="${award.href}" target="_blank">${award.name}</a></div><div class="aw-sb">${award.issuer}</div></div>`;
}

export function renderAwards() {
  document.getElementById('awardsGrid').innerHTML = awards.map(renderAward).join('');
}
