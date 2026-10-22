import { projects } from '../data/projects.js';
import { projectCard } from './project-card.js';
import { openProject } from './project-modal.js';

const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

// Cards follow a spiral that funnels into one front-facing card. Phones, reduced
// motion and browsers without WebGL get a plain swipe strip of the same cards.
export function initProjectVortex() {
  const stage = document.getElementById('helixStage');
  const helix = document.getElementById('helix');
  const wrap = document.getElementById('projectsCarousel');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const narrow = window.matchMedia('(max-width:760px)');
  let items = projects.slice();
  let cards = [];
  let useGL = false;
  let gl = null;
  let glLoading = false;

  function canWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  function setLayout(glMode) {
    stage.classList.toggle('gl', glMode);
    stage.classList.toggle('flat', !glMode);
    helix.classList.toggle('gl-list', glMode);
    helix.classList.toggle('flat', !glMode);
  }

  function bindCards() {
    cards.forEach((el, i) => {
      const card = el.firstElementChild;
      const project = items[i];
      card.addEventListener('click', () => openProject(project));
      card.addEventListener('keydown', e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        openProject(project);
      });
      card.addEventListener('focusin', () => {
        if (gl) gl.focusCard(i);
      });
    });
  }

  function build() {
    useGL = !reduce.matches && !narrow.matches && canWebGL();
    helix.innerHTML = items.map(p => '<div class="hx">' + projectCard(p, projects.indexOf(p)) + '</div>').join('');
    cards = Array.from(helix.children);
    setLayout(useGL);
    bindCards();
    if (gl) {
      gl.destroy();
      gl = null;
    }
    if (useGL) startGL();
  }

  function loadThree(onLoad) {
    if (window.THREE) return onLoad();
    if (glLoading) return;
    glLoading = true;
    const script = document.createElement('script');
    script.src = THREE_URL;
    script.onload = onLoad;
    script.onerror = () => {
      useGL = false;
      setLayout(false);
    };
    document.head.appendChild(script);
  }

  function startGL() {
    loadThree(() => {
      if (useGL && !gl) gl = makeGL();
    });
  }

  function makeGL() {
    const T = window.THREE;
    const N = items.length;
    const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    const canvas = renderer.domElement;
    canvas.className = 'gl-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    stage.appendChild(canvas);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(36, 1, .1, 100);

    const caption = document.createElement('div');
    caption.className = 'gl-caption';
    caption.setAttribute('aria-hidden', 'true');
    caption.innerHTML = '<h3></h3><p></p><span>Click to open</span>';
    stage.appendChild(caption);

    // the stage is sticky, so page scroll drives the spiral through this runway
    const setRunway = () => { wrap.style.height = Math.round(window.innerHeight * (1 + (N - 1) * .2)) + 'px'; };
    setRunway();

    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = 256;
    maskCanvas.height = 192;
    const g = maskCanvas.getContext('2d');
    g.fillStyle = '#000';
    g.fillRect(0, 0, 256, 192);
    g.fillStyle = '#fff';
    g.beginPath();
    const radius = 14;
    g.moveTo(radius, 0);
    g.arcTo(256, 0, 256, 192, radius);
    g.arcTo(256, 192, 0, 192, radius);
    g.arcTo(0, 192, 0, 0, radius);
    g.arcTo(0, 0, 256, 0, radius);
    g.closePath();
    g.fill();
    const mask = new T.CanvasTexture(maskCanvas);

    const CW = 2.55, CH = 1.91;
    const geometry = new T.PlaneGeometry(CW, CH, 40, 1);
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i) / (CW / 2);
      positions.setZ(i, .3 * x * x);
    }
    geometry.computeVertexNormals();

    const loader = new T.TextureLoader();
    const meshes = items.map(project => {
      const material = new T.MeshBasicMaterial({ color: 0x0a0a0a, alphaMap: mask, transparent: true, side: T.DoubleSide });
      if (project.image) {
        loader.load(project.image, texture => {
          texture.encoding = T.sRGBEncoding;
          texture.anisotropy = 4;
          material.map = texture;
          material.color.setScalar(1);
          material.needsUpdate = true;
        });
      }
      const mesh = new T.Mesh(geometry, material);
      scene.add(mesh);
      return mesh;
    });

    let pos = 0, drag = 0, vel = 0;
    let dragging = false, down = 0, lastX = 0, moved = 0;
    let mx = 0, my = 0, cmx = 0, cmy = 0;
    let front = -1, raf = 0, last = performance.now(), visible = true;
    const V = new T.Vector3(), Qa = new T.Quaternion(), Qb = new T.Quaternion(), QT = new T.Quaternion();
    const Eul = new T.Euler(), AY = new T.Vector3(0, 1, 0);

    // a twisted ribbon around an axis tilted toward the upper right; scrolling carries cards up along it
    const P = { lo: -5, R: 2.2, DT: .8, DH: 1.25, TZ: -.7, TX: .16, DIM: .62 };
    const wrapIndex = u => ((u - P.lo) % N + N) % N + P.lo;

    function layout() {
      QT.setFromEuler(Eul.set(P.TX, 0, P.TZ, 'XYZ'));
      for (let i = 0; i < N; i++) {
        const u = wrapIndex(i + pos), theta = u * P.DT, mesh = meshes[i];
        V.set(P.R * Math.sin(theta), u * P.DH, P.R * (Math.cos(theta) - 1)).applyQuaternion(QT);
        mesh.position.copy(V);
        Qa.setFromAxisAngle(AY, theta);
        Qb.setFromEuler(Eul.set(P.TX * .5, 0, P.TZ * .2, 'XYZ'));
        mesh.quaternion.copy(Qb).multiply(Qa);
        const facing = Math.cos(theta), edge = Math.max(0, Math.abs(u) - 4.5);
        const brightness = Math.max(.12, (1 - P.DIM) + P.DIM * Math.max(0, facing) - .12 * edge);
        if (mesh.material.map) mesh.material.color.setScalar(Math.min(1, brightness));
        mesh.renderOrder = Math.round(V.z * 100);
        mesh.visible = Math.abs(u) < 10.5;
      }
      const current = (((-Math.round(pos)) % N) + N) % N;
      if (current !== front) {
        front = current;
        const project = items[current];
        caption.children[0].textContent = project.title.split(',')[0];
        caption.children[1].textContent = project.outcome || '';
      }
    }

    function resize() {
      const w = stage.clientWidth, h = stage.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.set(0, 0, Math.max(8.2, 8.2 * (1.5 / (w / h))));
      camera.updateProjectionMatrix();
    }

    function scrollPosition() {
      const rect = wrap.getBoundingClientRect();
      const run = Math.max(1, rect.height - window.innerHeight);
      return Math.max(0, Math.min(1, -rect.top / run)) * (N - 1);
    }

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - last) / 1000 || .016);
      last = now;
      if (!visible || document.hidden) return;
      if (!dragging) {
        drag += vel * dt;
        vel *= Math.pow(.04, dt);
      }
      const goal = scrollPosition() + drag;
      pos += (goal - pos) * Math.min(1, dt * 7);
      cmx += (mx - cmx) * Math.min(1, dt * 3);
      cmy += (my - cmy) * Math.min(1, dt * 3);
      camera.position.x = cmx * .4;
      camera.position.y = -cmy * .28;
      camera.lookAt(0, 0, 0);
      layout();
      renderer.render(scene, camera);
    }

    const raycaster = new T.Raycaster();
    const ndc = new T.Vector2();

    function pick(e) {
      const rect = canvas.getBoundingClientRect();
      ndc.set((e.clientX - rect.left) / rect.width * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(meshes.filter(m => m.visible), false)[0];
      return hit ? meshes.indexOf(hit.object) : -1;
    }

    function onDown(e) {
      if (e.button > 0) return;
      dragging = true;
      moved = 0;
      down = lastX = e.clientX;
      vel = 0;
      stage.classList.add('drag');
      stage.setPointerCapture(e.pointerId);
    }

    function onMove(e) {
      const rect = stage.getBoundingClientRect();
      mx = (e.clientX - rect.left) / rect.width * 2 - 1;
      my = (e.clientY - rect.top) / rect.height * 2 - 1;
      if (dragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        moved = Math.max(moved, Math.abs(e.clientX - down));
        const step = -dx / 300;
        drag += step;
        vel = step * 30 * .5 + vel * .5;
      } else if (e.pointerType === 'mouse') {
        stage.style.cursor = pick(e) >= 0 ? 'pointer' : 'grab';
      }
    }

    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      stage.classList.remove('drag');
      if (moved >= 6) return;
      const index = pick(e);
      if (index >= 0) openProject(items[index]);
    }

    function onKey(e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      e.preventDefault();
      drag += e.key === 'ArrowRight' ? 1 : -1;
    }

    function onResize() {
      setRunway();
      resize();
    }

    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerup', onUp);
    stage.addEventListener('pointercancel', onUp);
    stage.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, { rootMargin: '200px' });
    observer.observe(wrap);
    resize();
    raf = requestAnimationFrame(frame);

    return {
      focusCard(i) {
        const want = -i + N * Math.round((pos + i) / N);
        drag += want - pos;
      },
      destroy() {
        cancelAnimationFrame(raf);
        observer.disconnect();
        window.removeEventListener('resize', onResize);
        stage.removeEventListener('pointerdown', onDown);
        stage.removeEventListener('pointermove', onMove);
        stage.removeEventListener('pointerup', onUp);
        stage.removeEventListener('pointercancel', onUp);
        stage.removeEventListener('keydown', onKey);
        meshes.forEach(m => {
          if (m.material.map) m.material.map.dispose();
          m.material.dispose();
        });
        geometry.dispose();
        mask.dispose();
        renderer.dispose();
        canvas.remove();
        caption.remove();
        wrap.style.height = '';
      }
    };
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    const group = button.dataset.filter;
    const count = group === 'All' ? projects.length : projects.filter(p => p.group === group).length;
    button.insertAdjacentHTML('beforeend', ' <span class="fcount">' + count + '</span>');
    button.addEventListener('click', () => {
      filterButtons.forEach(other => other.setAttribute('aria-pressed', other === button ? 'true' : 'false'));
      items = group === 'All' ? projects.slice() : projects.filter(p => p.group === group);
      build();
    });
  });

  [reduce, narrow].forEach(query => query.addEventListener('change', build));
  build();
}
