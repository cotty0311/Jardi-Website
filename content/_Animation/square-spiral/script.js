(() => {
  const root = document.querySelector('.jardi-demo');
  if (!root) return;
  const $ = id => root.querySelector('#' + id);
  const map = $('map'), avatar = $('avatar'), marks = $('footprints');
  const CENTER = { x: .5, y: .5 }; // normalized map coordinates
  const STEP_RATIO = .115; // spiral grid step, as fraction of map height
  const BASE_PX_PER_SECOND = 235; // speed=10; matches route demo's ~233px/s
  let state = 'idle'; // idle | running | paused
  let token = 0;
  let position = { ...CENTER };
  let lastMark = null;
  let lastFrame = null;

  const toPixels = p => ({ x: p.x * map.clientWidth, y: p.y * map.clientHeight });
  const distance = (a, b) => {
    const p = toPixels(a), q = toPixels(b);
    return Math.hypot(p.x - q.x, p.y - q.y);
  };
  function place(el, p) {
    el.style.left = `${p.x * 100}%`;
    el.style.top = `${p.y * 100}%`;
  }
  function controls() {
    $('start').disabled = state !== 'idle';
    $('pause').disabled = state === 'idle';
    $('pause').textContent = state === 'paused' ? '繼續' : '暫停';
    $('stop').disabled = state === 'idle';
  }
  function mark(p) {
    const img = document.createElement('img');
    img.className = 'jardi-footprint';
    img.src = 'images/footprint.png';
    img.alt = '';
    place(img, p);
    marks.append(img);
    lastMark = { ...p };
  }
  function addMarksAlong(a, b) {
    const gap = Math.max(15, map.clientWidth * .038 * 1.25);
    if (!lastMark) mark(a);
    // Place marks at approximately uniform spacing even at high speed.
    const d = distance(a, b);
    if (!d) return;
    const count = Math.max(1, Math.ceil(d / Math.max(2, gap / 3)));
    for (let i = 1; i <= count; i++) {
      const t = i / count;
      const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      if (distance(lastMark, p) >= gap) mark(p);
    }
  }
  function clipToEdge(from, target) {
    const dx = target.x - from.x, dy = target.y - from.y;
    let t = 1;
    if (dx > 0) t = Math.min(t, (1 - from.x) / dx);
    if (dx < 0) t = Math.min(t, -from.x / dx);
    if (dy > 0) t = Math.min(t, (1 - from.y) / dy);
    if (dy < 0) t = Math.min(t, -from.y / dy);
    return { p: { x: Math.max(0, Math.min(1, from.x + t * dx)), y: Math.max(0, Math.min(1, from.y + t * dy)) }, hit: t < 1 || t === 1 && (target.x <= 0 || target.x >= 1 || target.y <= 0 || target.y >= 1) };
  }
  // Right 1, down 1, left 2, up 2, right 3, down 3 ...
  function buildPath() {
    const w = map.clientWidth, h = map.clientHeight;
    const step = h * STEP_RATIO;
    const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
    const path = [{ ...CENTER }];
    let current = { ...CENTER };
    for (let leg = 0; leg < 1000; leg++) {
      const [dx, dy] = directions[leg % 4];
      const length = Math.floor(leg / 2) + 1;
      const target = {
        x: current.x + dx * step * length / w,
        y: current.y + dy * step * length / h
      };
      const { p, hit } = clipToEdge(current, target);
      path.push(p);
      if (hit) break;
      current = p;
    }
    return path;
  }
  function nextFrame(generation) {
    return new Promise(resolve => requestAnimationFrame(now => {
      if (generation !== token || state === 'idle') return resolve(null);
      if (lastFrame === null) lastFrame = now;
      const dt = Math.min(50, Math.max(0, now - lastFrame));
      lastFrame = now;
      resolve(state === 'paused' ? 0 : dt);
    }));
  }
  async function travel(target, generation) {
    while (generation === token && state !== 'idle') {
      const dt = await nextFrame(generation);
      if (dt === null) return false;
      if (dt === 0) continue;
      const remaining = distance(position, target);
      if (remaining < .01) { position = { ...target }; place(avatar, position); return true; }
      const speed = BASE_PX_PER_SECOND * Number($('speed').value) / 10;
      const fraction = Math.min(1, speed * dt / 1000 / remaining);
      const previous = position;
      position = {
        x: previous.x + (target.x - previous.x) * fraction,
        y: previous.y + (target.y - previous.y) * fraction
      };
      place(avatar, position);
      addMarksAlong(previous, position);
      if (fraction >= 1) return true;
    }
    return false;
  }
  async function run(generation) {
    const path = buildPath();
    mark(CENTER);
    for (let i = 1; i < path.length; i++) {
      if (!await travel(path[i], generation)) return;
    }
    if (generation !== token) return;
    // The avatar has reached the map boundary; do not loop.
    state = 'idle';
    controls();
  }
  function begin() {
    token++;
    state = 'running';
    lastFrame = null;
    lastMark = null;
    position = { ...CENTER };
    marks.replaceChildren();
    place(avatar, position);
    controls();
    run(token);
  }
  $('speed').addEventListener('input', () => { $('speed-value').value = $('speed').value; });
  $('start').addEventListener('click', () => { if (state === 'idle') begin(); });
  $('pause').addEventListener('click', () => {
    if (state === 'running') state = 'paused';
    else if (state === 'paused') state = 'running';
    lastFrame = null;
    controls();
  });
  $('stop').addEventListener('click', () => {
    if (state === 'idle') return;
    token++;
    state = 'idle';
    lastFrame = null;
    controls(); // retain current position and footprints
  });
  $('reset').addEventListener('click', () => {
    $('speed').value = '15';
    $('speed-value').value = '15';
    begin();
  });
  begin(); // autoplay once, no repeat
})();
