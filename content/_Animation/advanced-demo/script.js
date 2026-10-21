(() => {
  const root = document.querySelector('.jardi-demo');
  if (!root) return;
  const $ = id => root.querySelector('#' + id);
  const pins = [
    { x: 20, y: 26 }, { x: 50, y: 26 }, { x: 80, y: 26 },
    { x: 68, y: 72 }, { x: 36, y: 72 }
  ];
  const map = $('map'), avatar = $('avatar'), marks = $('footprints');
  const flags = ['fast', 'repeat', 'reverse', 'orbit'];
  const config = () => Object.fromEntries(flags.map(k => [k, $(k).checked]));
  const place = (el, p) => {
    el.style.left = p.x + '%';
    el.style.top = p.y + '%';
  };
  const metric = (a, b) => Math.hypot(
    (a.x - b.x) * map.clientWidth / 100,
    (a.y - b.y) * map.clientHeight / 100
  );
  const footprintGap = () => Math.max(15, map.clientWidth * .038 * 1.25);
  function addFootprint(p) {
    const img = document.createElement('img');
    img.src = 'images/footprint.png';
    img.className = 'jardi-footprint';
    img.alt = '';
    place(img, p);
    marks.append(img);
    if (marks.childElementCount > 1200) marks.firstElementChild.remove();
  }
  pins.forEach((p, i) => {
    const img = document.createElement('img');
    img.src = 'images/pin.png';
    img.alt = 'Pin ' + (i + 1);
    img.className = 'jardi-pin';
    place(img, p);
    $('pins').append(img);
  });

  // idle: finished/stopped, running: animating, paused: frozen.
  let state = 'idle', generation = 0;
  let position = { ...pins[0] }, lastFootprint = null;
  let virtualTime = 0, lastFrame = null;

  function controls() {
    $('start').disabled = state !== 'idle';
    $('pause').disabled = state === 'idle';
    $('pause').textContent = state === 'paused' ? '繼續' : '暫停';
    $('stop').disabled = state === 'idle';
  }
  function footprintAt(p, force = false) {
    if (force || !lastFootprint || metric(p, lastFootprint) >= footprintGap()) {
      addFootprint(p);
      lastFootprint = { ...p };
    }
  }
  // Time only advances when running. Pausing does not accumulate wall-clock time.
  function frame(token) {
    return new Promise(resolve => {
      requestAnimationFrame(now => {
        if (token !== generation || state === 'idle') return resolve(false);
        if (lastFrame === null) lastFrame = now;
        const dt = Math.min(50, now - lastFrame);
        lastFrame = now;
        if (state === 'running') virtualTime += dt * (Number($('speed').value) / 10);
        resolve(true);
      });
    });
  }
  async function wait(ms, token, scaleSpeed = true) {
    let elapsed = 0, prev = virtualTime;
    while (token === generation && state !== 'idle') {
      if (!await frame(token)) return false;
      const delta = virtualTime - prev;
      prev = virtualTime;
      elapsed += scaleSpeed ? delta : delta / (Number($('speed').value) / 10);
      if (elapsed >= ms) return true;
    }
    return false;
  }
  async function move(target, token, trail = true) {
    const start = { ...position };
    const duration = Math.max(220, metric(start, target) * 4.3);
    const t0 = virtualTime;
    while (token === generation && state !== 'idle') {
      if (!await frame(token)) return false;
      const t = Math.min(1, (virtualTime - t0) / duration);
      position = {
        x: start.x + (target.x - start.x) * t,
        y: start.y + (target.y - start.y) * t
      };
      place(avatar, position);
      if (trail) footprintAt(position);
      if (t >= 1) return true;
    }
    return false;
  }
  async function jump(target, token) {
    if (!await wait(1000, token, false)) return false;
    position = { ...target };
    place(avatar, position);
    footprintAt(position, true); // one footprint exactly under every visited pin
    return true;
  }
  async function orbitAt(center, token) {
    const radiusPx = Math.max(12, map.clientWidth * .055);
    const rx = radiusPx / map.clientWidth * 100;
    const ry = radiusPx / map.clientHeight * 100;
    const point = a => ({
      x: center.x + rx * Math.cos(a),
      y: center.y + ry * Math.sin(a)
    });
    footprintAt(center, true); // initial pin also leaves a footprint
    if (!await move(point(0), token, true)) return false;
    // Animate the whole circumference continuously, at the SAME pixel speed
    // as straight segments. No per-segment minimum duration or frame overhead.
    const circumferencePx = 2 * Math.PI * radiusPx;
    const duration = circumferencePx * 4.3;
    const t0 = virtualTime;
    while (token === generation && state !== 'idle') {
      if (!await frame(token)) return false;
      const progress = Math.min(1, (virtualTime - t0) / duration);
      position = point(progress * Math.PI * 2);
      place(avatar, position);
      footprintAt(position);
      if (progress >= 1) break;
    }
    if (!await move(center, token, true)) return false;
    footprintAt(center, true); // close the orbit with a footprint at the pin
    return true;
  }
  async function run(token) {
    while (token === generation && state !== 'idle') {
      const opts = config();
      const order = opts.reverse ? [...pins].reverse() : pins;
      footprintAt(order[0], true);
      if (opts.orbit && !await orbitAt(order[0], token)) return;
      for (let i = 1; i < order.length; i++) {
        if (token !== generation || state === 'idle') return;
        if (opts.fast) {
          if (!await jump(order[i], token)) return;
        } else {
          if (!await move(order[i], token)) return;
          footprintAt(order[i], true);
        }
        if (opts.orbit && !await orbitAt(order[i], token)) return;
      }
      if (!opts.repeat) break;
      if (opts.fast) {
        if (!await jump(order[0], token)) return;
      } else {
        if (!await move(order[0], token)) return;
      }
    }
    if (token === generation && state !== 'idle') {
      state = 'idle';
      controls();
    }
  }
  function begin(clearTrail = true) {
    generation++;
    state = 'running';
    virtualTime = 0;
    lastFrame = null;
    if (clearTrail) marks.replaceChildren();
    lastFootprint = null;
    const order = $('reverse').checked ? [...pins].reverse() : pins;
    position = { ...order[0] };
    place(avatar, position);
    controls();
    run(generation);
  }
  flags.forEach(k => $(k).addEventListener('change', () => begin(true)));
  $('speed').addEventListener('input', () => {
    $('speed-value').value = $('speed').value;
  });
  $('start').addEventListener('click', () => {
    if (state === 'idle') begin(true);
  });
  $('pause').addEventListener('click', () => {
    if (state === 'running') state = 'paused';
    else if (state === 'paused') state = 'running';
    lastFrame = null;
    controls();
  });
  $('stop').addEventListener('click', () => {
    if (state === 'idle') return;
    generation++;
    state = 'idle';
    lastFrame = null;
    controls(); // retain current position and footprints
  });
  $('reset').addEventListener('click', () => {
    flags.forEach(k => $(k).checked = k === 'repeat');
    $('speed').value = '15';
    $('speed-value').value = '15';
    begin(true);
  });
  begin(true); // autoplay once on initial load (repeat checkbox is on by default)
})();
