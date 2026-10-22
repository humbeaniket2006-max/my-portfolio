import { capabilities, tooling } from '../data/marquee.js';

function renderTrack(words) {
  const run = words.map(word => `<span class="marq-item">${word}</span><span class="marq-item a">·</span>`).join('');
  return run + run;
}

export function renderMarquees() {
  document.getElementById('marqCapabilities').innerHTML = renderTrack(capabilities);
  document.getElementById('marqTooling').innerHTML = renderTrack(tooling);
}
