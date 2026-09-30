/*
 * Point Blank Dev home: four service scenes in a ring around the camera (AI, Full-Stack, E-commerce, Security).
 * Click a service to turn to its scene and open its details; click it again to close them.
 * three.js r147 (the last release with these classic example scripts) loads from jsdelivr first, in order.
 */
(() => {
  const CDN = 'https://cdn.jsdelivr.net/npm/three@0.147.0/';
  const DEPS = ['build/three.min.js', 'examples/js/loaders/GLTFLoader.js', 'examples/js/utils/BufferGeometryUtils.js', 'examples/js/environments/RoomEnvironment.js', 'examples/js/math/MeshSurfaceSampler.js'];
  const load = (src) => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = () => reject(new Error(`Couldn't load ${src}`));
    document.head.appendChild(s);
  });
  DEPS.reduce((chain, dep) => chain.then(() => load(CDN + dep)), Promise.resolve())
    .then(start)
    .catch((err) => { const el = document.getElementById('loading'); if (el) el.textContent = err.message; });

  function start() {
  const V3 = THREE.Vector3;
  const rand = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2;
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const randomUnit = (out = new V3()) => { const u = rand(-1, 1), a = rand(0, TAU), r = Math.sqrt(1 - u * u); return out.set(r * Math.cos(a), u, r * Math.sin(a)); };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TIME = reduced ? 0.35 : 1;

  /* ---------- Renderer, scene, camera ---------- */
  const canvas = document.getElementById('c');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const BG = 0x07060c;
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.FogExp2(BG, 0.035);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new THREE.RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.AmbientLight(0x8b7bd8, 0.35));
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 80);
  camera.rotation.order = 'YXZ';

  /* Soft round sprite for every particle system */
  const dotTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'); const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)'); grd.addColorStop(0.35, 'rgba(255,255,255,.55)'); grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  /* A pool of glowing particles: emit bursts, they fly, slow, fade */
  class Sparks {
    constructor(parent, count, color, size, gravity = 0) {
      this.n = count; this.i = 0; this.gravity = gravity;
      this.pos = new Float32Array(count * 3); this.vel = new Float32Array(count * 3);
      this.col = new Float32Array(count * 3); this.life = new Float32Array(count);
      this.base = new THREE.Color(color);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(this.col, 3));
      this.points = new THREE.Points(geo, new THREE.PointsMaterial({ size, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      this.points.frustumCulled = false;
      parent.add(this.points);
    }
    emit(p, dir, k, speed, spread) {
      const r = new V3();
      for (let j = 0; j < k; j++) {
        const i = this.i++ % this.n, o = i * 3;
        randomUnit(r).multiplyScalar(spread);
        const s = speed * rand(0.4, 1);
        this.pos[o] = p.x; this.pos[o + 1] = p.y; this.pos[o + 2] = p.z;
        this.vel[o] = dir.x * s + r.x; this.vel[o + 1] = dir.y * s + r.y; this.vel[o + 2] = dir.z * s + r.z;
        this.life[i] = rand(0.7, 1);
      }
    }
    update(dt) {
      const drag = Math.pow(0.08, dt);
      for (let i = 0; i < this.n; i++) {
        const o = i * 3;
        if (this.life[i] <= 0) { this.col[o] = this.col[o + 1] = this.col[o + 2] = 0; continue; }
        this.life[i] -= dt * 1.6;
        this.vel[o + 1] -= this.gravity * dt;
        this.vel[o] *= drag; this.vel[o + 1] *= drag; this.vel[o + 2] *= drag;
        this.pos[o] += this.vel[o] * dt; this.pos[o + 1] += this.vel[o + 1] * dt; this.pos[o + 2] += this.vel[o + 2] * dt;
        const l = Math.max(0, this.life[i]) ** 1.5;
        this.col[o] = this.base.r * l; this.col[o + 1] = this.base.g * l; this.col[o + 2] = this.base.b * l;
      }
      this.points.geometry.attributes.position.needsUpdate = true;
      this.points.geometry.attributes.color.needsUpdate = true;
    }
  }

  const clock = { t: 0 };
  const view = { yaw: 0 };
  const facing = (deg) => Math.max(0, Math.cos(view.yaw - THREE.MathUtils.degToRad(deg)));

  /* ---------- Tiny logos: thousands of flat logo stamps that always face the camera ---------- */
  // The stamp is drawn once from the real logo into a texture (see "Load the logo"); until then it's blank
  const blankTex = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1); blankTex.needsUpdate = true;
  const logoPointMats = [];
  const pointScale = () => renderer.getDrawingBufferSize(new THREE.Vector2()).y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
  class LogoPoints {
    constructor(parent, n, { additive = false, onTop = false } = {}) {
      this.n = n;
      this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 3); this.size = new Float32Array(n); this.rot = new Float32Array(n);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
      geo.setAttribute('aColor', new THREE.BufferAttribute(this.col, 3));
      geo.setAttribute('aSize', new THREE.BufferAttribute(this.size, 1));
      geo.setAttribute('aRot', new THREE.BufferAttribute(this.rot, 1));
      const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
        uniforms: { uTex: { value: logoTex || blankTex }, uScale: { value: 800 } },
        vertexShader: `attribute float aSize; attribute vec3 aColor; attribute float aRot; uniform float uScale;
          varying vec3 vColor; varying float vRot;
          void main(){ vColor = aColor; vRot = aRot; vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform sampler2D uTex; varying vec3 vColor; varying float vRot;
          void main(){
            vec2 uv = gl_PointCoord - 0.5; float c = cos(vRot), s = sin(vRot);
            uv = mat2(c, -s, s, c) * uv + 0.5; uv.y = 1.0 - uv.y;
            float a = texture2D(uTex, uv).a;
            if (a < 0.1) discard;
            gl_FragColor = vec4(vColor, a);
          }`,
      });
      logoPointMats.push(mat);
      if (onTop) { mat.depthTest = false; }
      this.points = new THREE.Points(geo, mat); this.points.frustumCulled = false; if (onTop) this.points.renderOrder = 10; parent.add(this.points);
    }
    set(i, p, color, size, rot = 0) {
      const o = i * 3;
      this.pos[o] = p.x; this.pos[o + 1] = p.y; this.pos[o + 2] = p.z;
      this.col[o] = color.r; this.col[o + 1] = color.g; this.col[o + 2] = color.b;
      this.size[i] = size; this.rot[i] = rot;
    }
    commit() { const a = this.points.geometry.attributes; a.position.needsUpdate = a.aColor.needsUpdate = a.aSize.needsUpdate = a.aRot.needsUpdate = true; }
  }
  let logoTex = null;

  /* Points spread over the logo's surface, for scenes where tiny logos form the big one */
  const logoSamples = (geo, count, width) => {
    const sampler = new THREE.MeshSurfaceSampler(new THREE.Mesh(geo)).build();
    const out = [], p = new V3();
    for (let i = 0; i < count; i++) { sampler.sample(p); out.push(p.clone().multiplyScalar(width)); }
    return out;
  };

  /* A station with several concepts: only the chosen one shows and runs, restarting from its beginning */
  const variantStation = (g, defs) => {
    const vs = {};
    let current = defs[0].key, startedAt = 0;
    defs.forEach((d) => { const vg = new THREE.Group(); g.add(vg); vs[d.key] = { key: d.key, vg, api: d.build(vg) }; vg.visible = d.key === current; });
    return {
      variants: defs.map((d) => [d.key, d.label]),
      get current() { return current; },
      restart() { startedAt = clock.t; },
      setVariant(k) { if (!vs[k]) return; current = k; startedAt = clock.t; Object.values(vs).forEach((v) => { v.vg.visible = v.key === k; }); },
      update(dt) { vs[current].api.update(dt, clock.t - startedAt); },
    };
  };

  /* ---------- The ring: five scenes around the camera ---------- */
  const RING = 9;
  const STATIONS = [
    { key: 'ai', angle: 0 },
    { key: 'build', angle: 90 },
    { key: 'shop', angle: 180 },
    { key: 'shield', angle: 270 },
  ];
  const stationGroup = (angleDeg) => {
    const a = THREE.MathUtils.degToRad(angleDeg), g = new THREE.Group();
    g.position.set(Math.sin(a) * RING, 0, -Math.cos(a) * RING);
    g.rotation.y = -a; // local +z faces the camera at the center
    scene.add(g); return g;
  };
  const accentLights = (g, a, b) => {
    const l1 = new THREE.PointLight(a, 2.6, 14, 1.4); l1.position.set(3, 2.5, 3.5); g.add(l1);
    const l2 = new THREE.PointLight(b, 2.2, 14, 1.4); l2.position.set(-3.5, -1.5, 3); g.add(l2);
    return [l1, l2];
  };

  /* Materials */
  const logoMat = new THREE.MeshStandardMaterial({ color: 0x3f2f66, metalness: 0.8, roughness: 0.32, envMapIntensity: 0.45 });
  const miniMat = new THREE.MeshStandardMaterial({ color: 0x5b43a0, metalness: 0.75, roughness: 0.3, emissive: 0x160b33, envMapIntensity: 0.45 });
  const gunmetal = new THREE.MeshStandardMaterial({ color: 0x14111d, metalness: 0.9, roughness: 0.38, envMapIntensity: 0.3 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe8a92c, metalness: 1, roughness: 0.25, emissive: 0x4a2d00, envMapIntensity: 0.65 });

  /* The logo geometry arrives async; scenes register holders and fill them in once it loads */
  let logoGeo = null;
  const onLogo = [];
  const whenLogo = (fn) => (logoGeo ? fn(logoGeo) : onLogo.push(fn));

  /* ---------- SECURITY: a shield bubble that deflects incoming fire ---------- */
  const shield = (() => {
    const g = stationGroup(270); g.scale.setScalar(0.85); accentLights(g, 0x22d3ee, 0x8b5cf6);
    const R = 2.2, HITS = 10;
    const holder = new THREE.Group(); g.add(holder);
    whenLogo((geo) => { const m = new THREE.Mesh(geo, logoMat); m.scale.setScalar(2.1); holder.add(m); });
    const hitDirs = Array.from({ length: HITS }, () => new V3(0, 0, 1)), hitT = new Array(HITS).fill(-99);
    let hitI = 0;
    const bubbleMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uHits: { value: hitDirs }, uHitT: { value: hitT }, uA: { value: new THREE.Color(0x6d3cf0) }, uB: { value: new THREE.Color(0x22d3ee) } },
      vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP;
        void main(){ vP = normalize(position); vec4 mv = modelViewMatrix * vec4(position,1.0);
          vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uTime; uniform vec3 uHits[${HITS}]; uniform float uHitT[${HITS}]; uniform vec3 uA; uniform vec3 uB;
        varying vec3 vN; varying vec3 vV; varying vec3 vP;
        void main(){
          float fr = pow(1.0 - abs(dot(vN, vV)), 2.4);
          float ring = 0.0;
          for (int i = 0; i < ${HITS}; i++) {
            float age = uTime - uHitT[i];
            if (age < 0.0 || age > 1.3) continue;
            float d = acos(clamp(dot(vP, uHits[i]), -1.0, 1.0));
            ring += smoothstep(0.14, 0.0, abs(d - age * 1.7)) * (1.0 - age / 1.3) * 1.3;
            ring += smoothstep(0.4, 0.0, d) * max(0.0, 1.0 - age * 5.0) * 2.0;
          }
          float hex = 0.5 + 0.5 * sin(vP.y * 46.0 - uTime * 2.5);
          float a = 0.035 + fr * 0.8 + hex * 0.02;
          vec3 col = mix(uA, uB, fr) * a + uB * ring;
          gl_FragColor = vec4(col, 1.0);
        }`,
    });
    const bubble = new THREE.Mesh(new THREE.IcosahedronGeometry(R, 12), bubbleMat); g.add(bubble);
    const cage = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(R * 1.015, 2)),
      new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.1, blending: THREE.AdditiveBlending, depthWrite: false }));
    g.add(cage);

    // Incoming fire: streaks with bright heads
    const N = 34, TAIL = 0.22;
    const shots = Array.from({ length: N }, () => ({ p: new V3(), v: new V3(), state: 0, wait: rand(0, 2), hue: Math.random() < 0.5 }));
    const linePos = new Float32Array(N * 6), lineCol = new Float32Array(N * 6), headPos = new Float32Array(N * 3), headCol = new Float32Array(N * 3);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3)); lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
    const lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    lines.frustumCulled = false; g.add(lines);
    const headGeo = new THREE.BufferGeometry();
    headGeo.setAttribute('position', new THREE.BufferAttribute(headPos, 3)); headGeo.setAttribute('color', new THREE.BufferAttribute(headCol, 3));
    const heads = new THREE.Points(headGeo, new THREE.PointsMaterial({ size: 0.34, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    heads.frustumCulled = false; g.add(heads);
    const PINK = new THREE.Color(0xf472b6), GREEN = new THREE.Color(0x4ade80);
    const sparks = new Sparks(g, 500, 0x9ff3ff, 0.09);
    const n = new V3(), target = new V3(), tail = new V3();
    const spawn = (s) => {
      randomUnit(s.p); if (s.p.z > 0.35) s.p.z = -s.p.z; // come from the sides and behind, never from the camera
      s.p.multiplyScalar(rand(8, 10));
      randomUnit(target).multiplyScalar(R * 0.8); target.z = Math.abs(target.z);
      s.v.copy(target).sub(s.p).normalize().multiplyScalar(rand(7, 11));
      s.state = 1; s.hue = Math.random() < 0.5;
    };
    let spin = 0;
    return {
      update(dt, t) {
        bubbleMat.uniforms.uTime.value = t;
        spin += dt * 2.2;
        holder.rotation.set(0.1 * Math.sin(t * 0.7), spin, 0.06 * Math.cos(t));
        holder.position.y = Math.sin(t * 1.3) * 0.08;
        cage.rotation.y -= dt * 0.12; cage.rotation.x += dt * 0.05;
        shots.forEach((s, i) => {
          if (s.state === 0) { s.wait -= dt; if (s.wait <= 0) spawn(s); }
          else {
            s.p.addScaledVector(s.v, dt);
            if (s.state === 1 && s.p.length() <= R) {
              s.p.setLength(R); n.copy(s.p).normalize();
              s.v.reflect(n).multiplyScalar(0.8); s.state = 2;
              hitDirs[hitI].copy(n); hitT[hitI] = t; hitI = (hitI + 1) % HITS;
              sparks.emit(s.p, n, 16, 5, 1.6);
            }
            if (s.p.length() > 12) { s.state = 0; s.wait = rand(0.1, 0.9); }
          }
          const c = s.hue ? PINK : GREEN, vis = s.state === 0 ? 0 : 1, o = i * 6;
          tail.copy(s.v).multiplyScalar(-0.1).add(s.p);
          linePos.set([s.p.x, s.p.y, s.p.z, tail.x, tail.y, tail.z], o);
          lineCol.set([c.r * vis, c.g * vis, c.b * vis, 0, 0, 0], o);
          headPos.set([s.p.x, s.p.y, s.p.z], i * 3);
          headCol.set([c.r * vis * 1.4, c.g * vis * 1.4, c.b * vis * 1.4], i * 3);
        });
        lineGeo.attributes.position.needsUpdate = lineGeo.attributes.color.needsUpdate = true;
        headGeo.attributes.position.needsUpdate = headGeo.attributes.color.needsUpdate = true;
        sparks.update(dt);
      },
    };
  })();

  /* ---------- FULL-STACK: infrastructure rising out of a grid that runs to the horizon ---------- */
  const buildGroup = stationGroup(90); buildGroup.scale.setScalar(0.7); accentLights(buildGroup, 0x34d399, 0x8b5cf6);
  const build = variantStation(buildGroup, [{ key: 'city', label: 'Infrastructure', build: (vg) => {
    const FLOOR = -1.9;
    vg.rotation.x = 0.32; // look down a little onto the city
    // The grid: starts as a small plate, then runs out to the horizon
    const grid = new THREE.GridHelper(70, 140, 0x34d399, 0x1c5a45);
    grid.position.y = FLOOR; grid.material.transparent = true; grid.material.opacity = 0.55; vg.add(grid);
    const horizon = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 96), new THREE.MeshBasicMaterial({ color: 0x6ef7c0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    horizon.rotation.x = -Math.PI / 2; horizon.position.y = FLOOR + 0.01; vg.add(horizon);

    // Towers: a skyline, tallest near the middle, rising in a wave from the center outwards
    const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
    const edgesGeo = new THREE.EdgesGeometry(box);
    const towerMat = new THREE.MeshStandardMaterial({ color: 0x08070e, metalness: 0.3, roughness: 0.85, emissive: 0x040b09, envMapIntensity: 0.05 });
    const EDGE_COLORS = [0x34d399, 0x34d399, 0x8b5cf6, 0x22d3ee];
    const towers = [];
    const taken = new Set();
    for (let tries = 0; towers.length < 70 && tries < 2000; tries++) {
      const gx = Math.round(rand(-6, 10)), gz = Math.round(rand(-9, 2));
      const d = Math.hypot(gx, gz * 1.3);
      // Keep a clear plaza in front for the logo tower
      if (d < 2.6 || d > 10 || (Math.abs(gx) < 4 && gz > -3) || taken.has(`${gx},${gz}`)) continue;
      taken.add(`${gx},${gz}`);
      const w = rand(0.28, 0.42), h = Math.max(0.4, (4.2 - d * 0.36) * rand(0.45, 1.15));
      const group = new THREE.Group(); group.position.set(gx * 0.5, FLOOR, gz * 0.5); vg.add(group);
      const body = new THREE.Mesh(box, towerMat); group.add(body);
      const edges = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: EDGE_COLORS[towers.length % EDGE_COLORS.length], transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
      group.add(edges);
      // The glowing scan-line that "prints" the tower as it rises
      const scan = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xb8ffe4, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
      group.add(scan);
      towers.push({ group, body, edges, scan, w, h, start: 0.55 + d * 0.11 + rand(0, 0.25) });
    }

    // The centerpiece: rings of logos stacking into a tower, crowned by the logo
    const LAYERS = 4, PER = 10, R = 0.85, GAP = 0.62;
    const hero = new THREE.Group(); hero.position.set(0, FLOOR, 0.2); vg.add(hero);
    const minis = new THREE.InstancedMesh(new THREE.BufferGeometry(), miniMat, LAYERS * PER);
    minis.instanceMatrix.setUsage(THREE.DynamicDrawUsage); minis.frustumCulled = false; hero.add(minis);
    whenLogo((geo) => { minis.geometry = geo; });
    const rings = [0x34d399, 0x8b5cf6, 0x22d3ee, 0xf472b6].map((col, l) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.022, 8, 80), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
      ring.rotation.x = Math.PI / 2; ring.position.y = 0.25 + l * GAP - 0.22; hero.add(ring); return ring;
    });
    const crown = new THREE.Group(); hero.add(crown);
    whenLogo((geo) => { const m = new THREE.Mesh(geo, logoMat); m.scale.setScalar(1.25); crown.add(m); });
    const from = Array.from({ length: LAYERS * PER }, () => { const v = randomUnit(new V3()); v.y = Math.abs(v.y) + 0.3; return v.multiplyScalar(rand(5, 7)); });
    const angles = new Array(LAYERS).fill(0);

    // Data pulses racing along the grid lines
    const PULSES = 70, pulses = Array.from({ length: PULSES }, () => ({ axis: 0, line: 0, s: 0, dir: 1, speed: 0 }));
    const pPos = new Float32Array(PULSES * 3), pCol = new Float32Array(PULSES * 3);
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
    const pulsePts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.28, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    pulsePts.frustumCulled = false; vg.add(pulsePts);
    const PULSE_COLORS = [new THREE.Color(0x6ef7c0), new THREE.Color(0x67e8f9), new THREE.Color(0xc4b5fd)];
    const resetPulse = (p) => { p.axis = Math.random() < 0.5 ? 0 : 1; p.line = Math.round(rand(-14, 6)) * 0.5; p.dir = Math.random() < 0.5 ? -1 : 1; p.s = -p.dir * rand(4, 9); p.speed = rand(2.5, 5.5); p.c = PULSE_COLORS[Math.floor(rand(0, 3))]; };
    pulses.forEach(resetPulse);

    const sparks = new Sparks(vg, 400, 0xb8ffe4, 0.07, 1.2);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new V3(), p = new V3(), to = new V3(), up = new V3(0, 1, 0);
    const landed = new Array(LAYERS * PER).fill(false), topped = new Array(towers.length).fill(false);
    let lastT = Infinity;
    const outBack = (x) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2; };
    return {
      update(dt, t) {
        if (t < lastT) { landed.fill(false); topped.fill(false); } // replaying from the start
        lastT = t;
        // 1. The grid rushes out to the horizon
        const spread = smooth(0, 0.9, t);
        grid.scale.setScalar(0.04 + 0.96 * spread * spread);
        // The grid runs far, so it fades as the camera turns to other scenes
        const face = facing(90) ** 3;
        grid.material.opacity = 0.55 * smooth(0, 0.15, t) * face; grid.visible = face > 0.01;
        horizon.scale.setScalar(1 + spread * 60); horizon.material.opacity = 0.9 * (1 - spread) * smooth(0, 0.05, t);
        // 2. Towers print up fast, in a wave from the middle out
        towers.forEach((tw, i) => {
          const u = Math.min(1, Math.max(0, (t - tw.start) / 0.55));
          const h = tw.h * (u > 0 ? outBack(u) : 0);
          tw.group.visible = u > 0;
          tw.body.scale.set(tw.w, Math.max(h, 0.001), tw.w); tw.edges.scale.copy(tw.body.scale);
          tw.scan.scale.set(tw.w * 1.6, 1, tw.w * 1.6); tw.scan.position.y = h;
          tw.scan.material.opacity = u > 0 && u < 1 ? 0.9 : Math.max(0, tw.scan.material.opacity - dt * 2.5);
          tw.edges.material.opacity = 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.5 + i));
          if (u >= 1 && !topped[i]) { topped[i] = true; p.copy(tw.group.position); p.y += tw.h; sparks.emit(p, up, 5, 1.5, 0.5); }
        });
        // 3. The logo tower assembles in the middle, then the crown lands
        for (let l = 0; l < LAYERS; l++) {
          angles[l] += dt * (0.4 + 0.2 * l) * (l % 2 ? 1 : -1);
          const layerStart = 1.6 + l * 0.45;
          rings[l].material.opacity = 0.9 * smooth(layerStart + 0.6, layerStart + 0.9, t);
          for (let k = 0; k < PER; k++) {
            const i = l * PER + k, ts = layerStart + k * 0.03, a = (k / PER) * TAU + angles[l];
            to.set(Math.cos(a) * R, 0.25 + l * GAP, Math.sin(a) * R);
            let size = 0.46;
            if (t < ts) { size = 0; p.set(0, -40, 0); }
            else if (t < ts + 0.55) { const u = smooth(0, 1, (t - ts) / 0.55); p.lerpVectors(from[i], to, u); }
            else { p.copy(to); if (!landed[i]) { landed[i] = true; sparks.emit(p.clone().add(hero.position), up, 3, 1.2, 0.4); } }
            e.set(0, Math.PI / 2 - a, 0); q.setFromEuler(e);
            m4.compose(p, q, sc.set(size, size, size)); minis.setMatrixAt(i, m4);
          }
        }
        minis.instanceMatrix.needsUpdate = true;
        const crownIn = smooth(3.8, 4.5, t);
        crown.visible = crownIn > 0;
        crown.position.y = 5 - (5 - (0.25 + LAYERS * GAP + 0.35)) * crownIn;
        crown.rotation.y = Math.sin(t * 0.6) * 0.35;
        // 4. Traffic: pulses run along the grid once it's out
        const live = smooth(1, 1.6, t);
        pulses.forEach((pl, i) => {
          pl.s += pl.dir * pl.speed * dt;
          if (Math.abs(pl.s) > 9) resetPulse(pl);
          if (pl.axis === 0) p.set(pl.s, FLOOR + 0.02, pl.line); else p.set(pl.line, FLOOR + 0.02, pl.s);
          pPos.set([p.x, p.y, p.z], i * 3);
          pCol.set([pl.c.r * live, pl.c.g * live, pl.c.b * live], i * 3);
        });
        pGeo.attributes.position.needsUpdate = pGeo.attributes.color.needsUpdate = true;
        sparks.update(dt);
      },
    };
  } }]);

  /* ---------- AI: a brain of logo neurons firing pulses down their connections ---------- */
  const aiGroup = stationGroup(0); aiGroup.scale.setScalar(0.96); accentLights(aiGroup, 0xf472b6, 0x8b5cf6);
  const ai = variantStation(aiGroup, [
    /* Logo neurons: a brain whose neurons are tiny logos, firing pulses down their connections */
    { key: 'net', label: 'Logo neurons', build: (vg) => {
      const brain = new THREE.Group(); brain.position.y = 0.35; brain.rotation.x = 0.18; vg.add(brain);
      const nodes = [];
      while (nodes.length < 170) {
        const p = new V3(rand(-1, 1), rand(-1, 1), rand(-1, 1));
        if (p.lengthSq() > 1 || p.y < -0.7) continue;
        p.x *= 2.7; p.y *= 1.75; p.z *= 1.85;
        if (Math.abs(p.x) < 0.22) continue; // the gap between hemispheres
        nodes.push(p);
      }
      const adj = nodes.map(() => []), edges = [];
      const link = (a, b) => { if (a === b || adj[a].some((x) => x.to === b)) return; const e = edges.length; edges.push([a, b]); adj[a].push({ to: b, e }); adj[b].push({ to: a, e }); };
      nodes.forEach((p, i) => { nodes.map((q, j) => ({ j, d: p.distanceToSquared(q) })).sort((a, b) => a.d - b.d).slice(1, 4).forEach(({ j }) => link(i, j)); });
      for (let k = 0; k < 14; k++) {
        const a = Math.floor(rand(0, nodes.length)), mirror = new V3(-nodes[a].x, nodes[a].y, nodes[a].z);
        link(a, nodes.map((q, j) => ({ j, d: q.distanceToSquared(mirror) })).sort((x, y) => x.d - y.d)[0].j);
      }
      const ePos = new Float32Array(edges.length * 6), eCol = new Float32Array(edges.length * 6);
      edges.forEach(([a, b], i) => ePos.set([nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z], i * 6));
      const eGeo = new THREE.BufferGeometry();
      eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3)); eGeo.setAttribute('color', new THREE.BufferAttribute(eCol, 3));
      brain.add(new THREE.LineSegments(eGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })));
      const edgeHeat = new Float32Array(edges.length), glow = new Float32Array(nodes.length);
      const neurons = new LogoPoints(brain, nodes.length);
      const tilt = nodes.map(() => rand(-0.35, 0.35));
      // Soft halos behind firing neurons
      const hPos = new Float32Array(nodes.length * 3), hCol = new Float32Array(nodes.length * 3);
      nodes.forEach((p, i) => hPos.set([p.x, p.y, p.z], i * 3));
      const hGeo = new THREE.BufferGeometry();
      hGeo.setAttribute('position', new THREE.BufferAttribute(hPos, 3)); hGeo.setAttribute('color', new THREE.BufferAttribute(hCol, 3));
      brain.add(new THREE.Points(hGeo, new THREE.PointsMaterial({ size: 0.7, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
      const P = 150, pulses = Array.from({ length: P }, () => ({ at: Math.floor(rand(0, nodes.length)), from: -1, e: -1, to: 0, s: 1, hops: 0, wait: rand(0, 3) }));
      const pPos = new Float32Array(P * 3), pCol = new Float32Array(P * 3);
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3)); pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
      const pulsePts = new THREE.Points(pGeo, new THREE.PointsMaterial({ size: 0.2, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      pulsePts.frustumCulled = false; brain.add(pulsePts);
      const PULSE = new THREE.Color(0xffc2e6), BASE = new THREE.Color(0x6a4fc4), FIRE = new THREE.Color(0xffd6f0), EDGE = new THREE.Color(0x24164a), HOT = new THREE.Color(0xff5fb8), c = new THREE.Color(), tmp = new V3();
      const next = (pl) => {
        const options = adj[pl.at].filter((x) => x.to !== pl.from), list = options.length ? options : adj[pl.at];
        const pick = list[Math.floor(Math.random() * list.length)];
        pl.from = pl.at; pl.to = pick.to; pl.e = pick.e; pl.s = 0;
      };
      return {
        update(dt, t) {
          brain.rotation.y = Math.sin(t * 0.2) * 0.55 + t * 0.05;
          pulses.forEach((pl, i) => {
            if (pl.wait > 0) { pl.wait -= dt; pCol.set([0, 0, 0], i * 3); return; }
            if (pl.e < 0) { next(pl); pl.hops = Math.floor(rand(4, 12)); }
            pl.s += (dt * 3.4) / Math.max(nodes[pl.from].distanceTo(nodes[pl.to]), 0.2);
            edgeHeat[pl.e] = 1;
            if (pl.s >= 1) {
              glow[pl.to] = 1; pl.at = pl.to;
              if (--pl.hops <= 0) { pl.e = -1; pl.wait = rand(0.2, 1.4); pl.at = Math.floor(rand(0, nodes.length)); pl.from = -1; pCol.set([0, 0, 0], i * 3); return; }
              next(pl);
            }
            tmp.lerpVectors(nodes[pl.from], nodes[pl.to], Math.min(pl.s, 1));
            pPos.set([tmp.x, tmp.y, tmp.z], i * 3); pCol.set([PULSE.r, PULSE.g, PULSE.b], i * 3);
          });
          const fade = Math.pow(0.02, dt);
          nodes.forEach((p, i) => {
            glow[i] *= fade;
            c.copy(BASE).lerp(FIRE, glow[i]);
            neurons.set(i, p, c, 0.27 + glow[i] * 0.25, tilt[i] + glow[i] * 0.4);
            const h = glow[i] * 1.1; hCol.set([HOT.r * h, HOT.g * h * 0.7, HOT.b * h], i * 3);
          });
          edges.forEach((_, i) => { edgeHeat[i] *= Math.pow(0.1, dt); c.copy(EDGE).lerp(HOT, edgeHeat[i] * 0.8); eCol.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6); });
          neurons.commit();
          pGeo.attributes.position.needsUpdate = pGeo.attributes.color.needsUpdate = true;
          hGeo.attributes.color.needsUpdate = eGeo.attributes.color.needsUpdate = true;
        },
      };
    } },

  ]);

  /* ---------- E-COMMERCE: the logo in a halo of dust, where specks flash gold like purchases ---------- */
  const shopGroup = stationGroup(180); shopGroup.scale.setScalar(0.74); accentLights(shopGroup, 0xfbbf24, 0x8b5cf6);
  const shop = variantStation(shopGroup, [
    /* Halo: the original opening scene, the logo lit by orbiting neon inside a swirl of dust */
    { key: 'halo', label: 'Halo', build: (vg) => {
      const holder = new THREE.Group(); vg.add(holder);
      whenLogo((geo) => { const m = new THREE.Mesh(geo, logoMat); m.scale.setScalar(3.9); holder.add(m); });
      const pink = new THREE.PointLight(0xf472b6, 3, 12, 1.5), green = new THREE.PointLight(0x34d399, 3, 12, 1.5), white = new THREE.PointLight(0xbfb2ff, 0.9, 14, 1.4);
      vg.add(pink, green, white); white.position.set(0, 1, 6);
      const n = 900, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new THREE.Color();
      for (let i = 0; i < n; i++) {
        const a = rand(0, TAU), r = rand(3.4, 5.8), y = rand(-0.7, 0.7) * (1 - (r - 3.4) / 2.4);
        pos.set([Math.cos(a) * r, y, Math.sin(a) * r * 0.45], i * 3);
        c.setHSL(rand(0.72, 0.8), 0.8, rand(0.25, 0.6)); col.set([c.r, c.g, c.b], i * 3);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const halo = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.08, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
      halo.rotation.x = 0.25; vg.add(halo);
      // Purchases: a random speck flashes gold with a ring and a spray of sparks
      const baseCol = col.slice(), glow = new Float32Array(n), GOLD = new THREE.Color(0xffc14a);
      const BURSTS = 10, bursts = Array.from({ length: BURSTS }, () => {
        const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffd36b, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
        flash.material.color.setRGB(1.5, 1.1, 0.45); // soft gold
        vg.add(flash); return { flash, age: 9 };
      });
      let burstI = 0, nextBuy = 0.5;
      const buySparks = new Sparks(vg, 300, 0xffcf5c, 0.1, 1); buySparks.base.setRGB(1.3, 1, 0.4);
      const bp = new V3(), up = new V3(0, 1, 0);
      return {
        update(dt, t) {
          holder.position.y = Math.sin(t) * 0.1;
          holder.rotation.set(pointer.y * 0.12 + Math.cos(t / 3) * 0.04, pointer.x * 0.25 + Math.sin(t / 4) * 0.06, Math.sin(t) * 0.015);
          pink.position.set(Math.cos(t * 0.7) * 5, Math.sin(t * 0.9) * 2.5, 3 + Math.sin(t * 0.5));
          green.position.set(Math.cos(t * 0.7 + Math.PI) * 5, Math.sin(t * 0.8 + 1) * 2.5, 3 + Math.cos(t * 0.6));
          halo.rotation.y += dt * 0.08;
          nextBuy -= dt;
          if (nextBuy <= 0) {
            nextBuy = rand(0.15, 0.55);
            // A speck on the front half of the halo (the back half is behind the logo), where it is right now
            let i = 0;
            for (let tries = 0; tries < 20; tries++) {
              i = Math.floor(rand(0, n)); bp.fromArray(pos, i * 3); halo.localToWorld(bp); vg.worldToLocal(bp);
              if (bp.z > 0.2) break;
            }
            glow[i] = 1;
            const b = bursts[burstI++ % BURSTS]; b.age = 0; b.flash.position.copy(bp);
            buySparks.emit(bp, up, 7, 1.6, 0.8);
          }
          for (let i = 0; i < n; i++) {
            if (glow[i] <= 0.001) continue;
            glow[i] *= Math.pow(0.08, dt);
            const k = glow[i], o = i * 3;
            col[o] = baseCol[o] + (GOLD.r * 1.6 - baseCol[o]) * k; col[o + 1] = baseCol[o + 1] + (GOLD.g * 1.6 - baseCol[o + 1]) * k; col[o + 2] = baseCol[o + 2] + (GOLD.b * 1.6 - baseCol[o + 2]) * k;
          }
          geo.attributes.color.needsUpdate = true;
          bursts.forEach((b) => {
            b.age += dt; const u = Math.min(1, b.age / 1.2);
            b.flash.material.opacity = 0.55 * Math.max(0, 1 - u * 1.6); b.flash.scale.setScalar(0.7 + u * 0.6);
          });
          buySparks.update(dt);
        },
      };
    } },
  ]);

  /* Deep-space dust around the whole ring, so the turn between scenes has depth */
  (() => {
    const n = 1800, pos = new Float32Array(n * 3), col = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), r = rand(4, 22);
      pos.set([Math.sin(a) * r, rand(-7, 7), -Math.cos(a) * r], i * 3);
      c.setHSL(rand(0.68, 0.82), 0.6, rand(0.15, 0.45)); col.set([c.r, c.g, c.b], i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.05, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  })();

  /* ---------- Load the logo ---------- */
  new THREE.GLTFLoader().load('/point-blank-dev.glb', (gltf) => {
    gltf.scene.updateMatrixWorld(true);
    const parts = [];
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      let geo = o.geometry.clone().applyMatrix4(o.matrixWorld);
      Object.keys(geo.attributes).forEach((k) => { if (k !== 'position' && k !== 'normal') geo.deleteAttribute(k); });
      parts.push(geo.index ? geo.toNonIndexed() : geo);
    });
    const geo = THREE.BufferGeometryUtils.mergeBufferGeometries(parts);
    geo.rotateX(Math.PI / 2); // the logo is a flat extrusion lying down; stand it up facing the camera
    geo.computeBoundingBox(); geo.center();
    const size = new V3(); geo.boundingBox.getSize(size); geo.scale(1 / size.x, 1 / size.x, 1 / size.x);
    geo.computeBoundingSphere();
    // Draw the logo once, flat and white, into a texture: the stamp every tiny logo uses
    const rt = new THREE.WebGLRenderTarget(256, 256);
    const stampScene = new THREE.Scene(); stampScene.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xffffff })));
    const cam = new THREE.OrthographicCamera(-0.52, 0.52, 0.52, -0.52, -2, 2);
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(stampScene, cam); renderer.setRenderTarget(null);
    logoTex = rt.texture; logoPointMats.forEach((m) => { m.uniforms.uTex.value = logoTex; });
    logoGeo = geo; onLogo.splice(0).forEach((fn) => fn(geo));
    document.getElementById('loading').remove();
  }, undefined, (err) => { document.getElementById('loading').textContent = `Couldn't load the logo: ${err.message || err}`; });

  /* ---------- Camera: turn on the spot to face a scene ---------- */
  const KEYS = STATIONS.map((s) => s.key);
  let yaw = 0, target = 0, active = 'ai';
  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', (e) => { pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = (e.clientY / innerHeight) * 2 - 1; });
  const dots = [...document.querySelectorAll('#dots span')];
  const seg = document.getElementById('seg');
  const MULTI = { ai, build, shop };
  const ACCENT = { ai: 'var(--ai)', build: 'var(--build)', shop: 'var(--shop)' };
  function renderSeg(key) {
    const st = MULTI[key];
    seg.classList.toggle('show', !!st && st.variants.length > 1);
    if (!st || st.variants.length < 2) return;
    seg.style.setProperty('--sc', ACCENT[key]);
    seg.innerHTML = st.variants.map(([k, label]) => `<button data-v="${k}" class="${k === st.current ? 'on' : ''}">${label}</button>`).join('');
  }
  const go = (key) => {
    if (key !== active && MULTI[key]) MULTI[key].restart();
    active = key; target = THREE.MathUtils.degToRad(STATIONS.find((s) => s.key === key).angle);
    dots.forEach((d, i) => d.classList.toggle('on', KEYS[i] === key));
    document.querySelectorAll('.card').forEach((c) => c.classList.toggle('on', c.dataset.s === key));
    renderSeg(key);
  };

  /* Framing: keep the scene in the open space, between the cards and the details panel when it's open */
  const framing = { x: 0, y: 0, fov: 48, tx: 0, ty: 0, tfov: 48 };
  const frameTarget = () => {
    const w = innerWidth, h = innerHeight, wide = w > 820 && w / h > 1;
    const panel = document.getElementById('drawer'), open = panel.classList.contains('open');
    if (wide) {
      const left = document.querySelector('.panel').getBoundingClientRect().right;
      const right = open ? w - panel.getBoundingClientRect().width : w;
      // Centre in the open space; with details open, zoom out to fit the gap between the cards and the panel
      const gap = right - left;
      framing.tx = -((left + right) / 2 - w / 2); framing.ty = 0;
      framing.tfov = open ? Math.min(82, 48 * Math.max(1, 620 / gap)) : 48;
    } else { framing.tx = 0; framing.ty = h * 0.2; framing.tfov = 62; }
  };
  const applyFrame = () => {
    camera.setViewOffset(innerWidth, innerHeight, framing.x, framing.y, innerWidth, innerHeight);
    camera.fov = framing.fov; camera.updateProjectionMatrix();
    const k = pointScale(); logoPointMats.forEach((m) => { m.uniforms.uScale.value = k; });
  };
  const resize = () => {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    frameTarget(); framing.x = framing.tx; framing.y = framing.ty; framing.fov = framing.tfov;
    applyFrame();
  };
  addEventListener('resize', resize); resize();

  /* ---------- Hover shows, click tells ---------- */
  const COPY = {
    ai: { title: 'AI features your users actually use', lede: 'Put AI to work inside your product and your operations, built properly and measured.', items: [['Assistants and search in your app', 'Chat, answers and smart search over your own data.'], ['Workflow automation', 'Take repetitive work off your team in support, ops and sales.'], ['Safe by design', 'Your data stays yours, with evaluation, guardrails and cost control.'], ['Ship, then improve', 'Launch in weeks, then keep making it better on a retainer.']] },
    build: { title: 'From idea to production, one team', lede: 'Senior engineers who design, build and run the whole stack with you.', items: [['Web apps and APIs', 'Front end to database, built to scale with you.'], ['Modern, boring-in-a-good-way tech', 'TypeScript, React and Next.js, Node, Postgres, cloud.'], ['Quality built in', 'Code review, tests, CI/CD and documentation, as standard.'], ['A team without the hiring', 'Senior output from day one, without a full-time payroll.']] },
    shop: { title: 'Stores that sell', lede: 'Custom storefronts, checkout and payments that turn visits into revenue.', items: [['Custom storefronts', 'Fast, on-brand shopping built around your products.'], ['Payments and subscriptions', 'Checkout, billing, taxes and refunds, handled right.'], ['Integrations', 'Inventory, shipping, CRM and the rest of your tools, connected.'], ['Conversion tuning', 'Speed and UX work, measured by what sells.']] },
    shield: { title: 'Find the gaps before someone else does', lede: 'Practical security reviews that end in a clear, prioritized fix list.', items: [['Code and architecture review', 'Where the real risks are in how your system is built.'], ['Access and secrets', 'Authentication, permissions and key handling, hardened.'], ['Dependency and cloud audit', 'Outdated packages, open ports and misconfigurations.'], ['A fix list you can act on', 'Ranked by risk, with help fixing what matters most.']] },
  };
  const drawer = document.getElementById('drawer');
  const openDetails = (key) => {
    go(key);
    const c = COPY[key];
    document.getElementById('dTitle').textContent = c.title;
    document.getElementById('dLede').textContent = c.lede;
    document.getElementById('dList').innerHTML = c.items.map(([b, s]) => `<li><b>${b}</b><span>${s}</span></li>`).join('');
    drawer.style.setProperty('--dc', getComputedStyle(document.querySelector(`.card[data-s="${key}"]`)).getPropertyValue('--c'));
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); frameTarget();
    document.querySelectorAll('.card').forEach((c) => c.classList.toggle('open', c.dataset.s === key));
    document.getElementById('close').focus({ preventScroll: true });
  };
  const closeDetails = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); frameTarget(); document.querySelectorAll('.card').forEach((c) => c.classList.remove('open')); };
  document.getElementById('close').addEventListener('click', closeDetails);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetails(); });
  document.getElementById('copy').addEventListener('click', (e) => {
    const btn = e.currentTarget, text = document.getElementById('email').textContent;
    navigator.clipboard.writeText(text).then(() => { btn.textContent = 'Copied'; }, () => {
      const r = document.createRange(); r.selectNodeContents(document.getElementById('email'));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); btn.textContent = 'Selected, press Ctrl+C';
    });
    setTimeout(() => { btn.textContent = 'Copy email'; }, 1800);
  });

  document.querySelectorAll('.card').forEach((card) => {
    const key = card.dataset.s;
    // First click turns to the scene; clicking the scene you're on opens its details
    card.addEventListener('click', () => {
      // A new card turns to its scene and opens its details; the same card again toggles the details
      if (active !== key || !drawer.classList.contains('open')) openDetails(key);
      else closeDetails();
    });
  });
  document.getElementById('brand').addEventListener('click', () => go('ai'));

  seg.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    MULTI[active].setVariant(b.dataset.v); renderSeg(active);
  });

  // #ai, #build, #shop, #shield (and #press) open straight onto a scene
  const fromHash = (snap) => {
    const [key, variant] = location.hash.slice(1).split('-');
    if (!KEYS.includes(key)) { go(active); return; }
    if (variant && MULTI[key]) MULTI[key].setVariant(variant);
    go(key); if (snap) yaw = target;
  };
  fromHash(true);
  addEventListener('hashchange', () => fromHash(false));

  /* ---------- Loop ---------- */
  const timer = new THREE.Clock();
  const scenes = [shield, build, ai, shop];
  const frame = () => {
    const dt = Math.min(timer.getDelta(), 0.05) * TIME;
    clock.t += dt; const t = clock.t;
    // Shortest way round, eased
    const d = Math.atan2(Math.sin(target - yaw), Math.cos(target - yaw));
    yaw += d * (1 - Math.exp(-dt * (reduced ? 12 : 3.4) / TIME));
    const ease = 1 - Math.exp(-dt * (reduced ? 20 : 5) / TIME);
    if (Math.abs(framing.tx - framing.x) + Math.abs(framing.ty - framing.y) + Math.abs(framing.tfov - framing.fov) > 0.01) {
      framing.x += (framing.tx - framing.x) * ease; framing.y += (framing.ty - framing.y) * ease; framing.fov += (framing.tfov - framing.fov) * ease;
      applyFrame();
    }
    view.yaw = yaw;
    camera.rotation.set(-pointer.y * 0.035, -yaw - pointer.x * 0.05, 0);
    scenes.forEach((s) => s.update(dt, t));
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  }
})();
