export function runPreloader(onDone) {
  const bar = document.getElementById('plbar');
  const pct = document.getElementById('plpct');
  const wipe = document.getElementById('plwipe');
  let value = 0;

  function tick() {
    value = Math.min(value + Math.floor(Math.random() * 5) + 2, 100);
    bar.style.width = value + '%';
    pct.textContent = value + '%';
    if (value < 100) {
      setTimeout(tick, 14 + Math.random() * 20);
      return;
    }
    setTimeout(wipeAway, 320);
  }

  function wipeAway() {
    wipe.style.transition = 'transform .8s cubic-bezier(.76,0,.24,1)';
    wipe.style.transform = 'scaleY(1)';
    setTimeout(finish, 820);
  }

  function finish() {
    document.getElementById('preloader').style.display = 'none';
    document.body.classList.remove('loading');
    document.getElementById('nav').classList.add('vis');
    setTimeout(() => document.getElementById('hL1').classList.add('in'), 100);
    setTimeout(() => document.getElementById('hL2').classList.add('in'), 220);
    setTimeout(() => document.getElementById('hSub').classList.add('in'), 420);
    onDone();
  }

  tick();
}
