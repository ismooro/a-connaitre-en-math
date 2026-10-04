// Dessin de la scène 2D : ciel, ville en 3 plans, batterie anti-aérienne, missiles, radar, explosions.
// Ne modifie jamais l'état du jeu.
(function (App) {
  const { W, H, GROUND } = App.WORLD;
  const fx = App.effects;
  const TAU = Math.PI * 2;
  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d');
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * ratio;
  canvas.height = H * ratio;
  ctx.scale(ratio, ratio);

  // Générateur pseudo-aléatoire fixe : la ville est toujours la même.
  let seed = 11;
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const between = (a, b) => a + rand() * (b - a);
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const WINDOW_COLORS = ['#f5c46b', '#f5c46b', '#ffe3a1', '#9fd3ff'];
  const beacons = []; // feux rouges clignotants sur les antennes

  // ---------- Décor fixe (dessiné une seule fois) ----------
  function layer(paint) {
    const c = document.createElement('canvas');
    c.width = W * ratio;
    c.height = H * ratio;
    const g = c.getContext('2d');
    g.scale(ratio, ratio);
    paint(g);
    return c;
  }

  function paintSky(g) {
    const sky = g.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, '#070b18');
    sky.addColorStop(0.55, '#1b1a3a');
    sky.addColorStop(0.85, '#4a2c4d');
    sky.addColorStop(1, '#8a4a52');
    g.fillStyle = sky;
    g.fillRect(0, 0, W, H);
    for (let i = 0; i < 90; i++) {
      g.globalAlpha = between(0.25, 0.9);
      g.fillStyle = rand() < 0.15 ? '#bcd4ff' : '#ecebe4';
      const s = rand() < 0.1 ? 2 : 1.2;
      g.fillRect(rand() * W, rand() * GROUND * 0.65, s, s);
    }
    g.globalAlpha = 1;
    const mx = 130, my = 72; // lune, halo et cratères
    const halo = g.createRadialGradient(mx, my, 10, mx, my, 90);
    halo.addColorStop(0, 'rgba(190,205,255,0.35)');
    halo.addColorStop(1, 'rgba(190,205,255,0)');
    g.fillStyle = halo;
    g.fillRect(mx - 90, my - 90, 180, 180);
    g.fillStyle = '#f1efe3';
    g.beginPath();
    g.arc(mx, my, 24, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(120,120,140,0.28)';
    [[-8, -6, 6], [7, 4, 8], [-3, 11, 4], [10, -10, 3]].forEach(([dx, dy, r]) => {
      g.beginPath();
      g.arc(mx + dx, my + dy, r, 0, TAU);
      g.fill();
    });
    for (let i = 0; i < 7; i++) { // nuages
      const cx = rand() * W, cy = between(40, 200), cw = between(80, 180);
      for (let j = 0; j < 5; j++) {
        g.fillStyle = 'rgba(120,110,170,0.07)';
        g.beginPath();
        g.ellipse(cx + (j - 2) * cw * 0.2, cy + between(-6, 6), cw * 0.28, between(7, 12), 0, 0, TAU);
        g.fill();
      }
    }
  }

  function building(g, x, w, h, o) {
    const top = GROUND - h;
    g.fillStyle = o.color;
    g.fillRect(x, top, w, h + 1);
    g.fillStyle = 'rgba(150,170,230,0.10)'; // reflet de lune
    g.fillRect(x, top, 2, h);
    g.fillStyle = 'rgba(0,0,0,0.25)';        // arête dans l'ombre
    g.fillRect(x + w - 3, top, 3, h);
    g.fillStyle = o.color;
    const roof = o.roofs ? Math.floor(rand() * 4) : 0;
    if (roof === 1) { // antenne
      g.fillRect(x + w / 2 - 0.8, top - 24, 1.6, 24);
      if (o.beacons) beacons.push({ x: x + w / 2, y: top - 25, phase: rand() * 3 });
    } else if (roof === 2) { // étage en retrait
      g.fillRect(x + 5, top - 9, w - 10, 9);
    } else if (roof === 3) { // château d'eau
      g.fillRect(x + 6, top - 12, 12, 9);
      g.fillRect(x + 8, top - 3, 2, 3);
      g.fillRect(x + 14, top - 3, 2, 3);
    }
    if (!o.windows) return;
    for (let y = top + 8; y < GROUND - 6; y += 12) {
      for (let wx = x + 6; wx < x + w - 7; wx += 9) {
        if (rand() > o.lit) continue;
        g.fillStyle = WINDOW_COLORS[Math.floor(rand() * WINDOW_COLORS.length)];
        g.globalAlpha = o.windowAlpha * (0.6 + rand() * 0.4);
        g.fillRect(wx, y, 4, 6);
      }
    }
    g.globalAlpha = 1;
  }

  function skyline(g, o) {
    for (let x = -12; x < W;) {
      const w = between(o.wMin, o.wMax);
      building(g, x, w, between(o.minH, o.maxH), o);
      x += w + between(1, 5);
    }
  }

  function paintCity(g) {
    skyline(g, { color: '#1a2142', minH: 50, maxH: 120, wMin: 30, wMax: 60 });
    const haze = g.createLinearGradient(0, GROUND - 130, 0, GROUND);
    haze.addColorStop(0, 'rgba(138,74,82,0)');
    haze.addColorStop(1, 'rgba(138,74,82,0.35)');
    g.fillStyle = haze;
    g.fillRect(0, GROUND - 130, W, 130);
    skyline(g, { color: '#121832', minH: 40, maxH: 130, wMin: 28, wMax: 54, roofs: true, windows: true, lit: 0.22, windowAlpha: 0.55 });
    skyline(g, { color: '#0a0e1b', minH: 24, maxH: 100, wMin: 30, wMax: 52, roofs: true, windows: true, lit: 0.4, windowAlpha: 1, beacons: true });
    g.fillStyle = '#121828'; // trottoir
    g.fillRect(0, GROUND, W, 8);
    g.fillStyle = '#090c16'; // chaussée
    g.fillRect(0, GROUND + 8, W, H - GROUND - 8);
    g.fillStyle = 'rgba(236,235,228,0.22)';
    for (let x = 10; x < W; x += 40) g.fillRect(x, GROUND + 36, 22, 2);
    for (let x = 60; x < W; x += 110) { // lampadaires et halos
      const lx = x + 10, ly = GROUND - 38;
      g.fillStyle = '#05070d';
      g.fillRect(x, ly, 1.8, 44);
      g.fillRect(x, ly, 11, 1.8);
      const glow = g.createRadialGradient(lx, ly, 0, lx, ly, 42);
      glow.addColorStop(0, 'rgba(255,214,140,0.5)');
      glow.addColorStop(1, 'rgba(255,214,140,0)');
      g.fillStyle = glow;
      g.fillRect(lx - 42, ly - 42, 84, 84);
      g.save();
      g.translate(lx, GROUND + 16);
      g.scale(1, 0.18);
      const pool = g.createRadialGradient(0, 0, 0, 0, 0, 50);
      pool.addColorStop(0, 'rgba(255,214,140,0.35)');
      pool.addColorStop(1, 'rgba(255,214,140,0)');
      g.fillStyle = pool;
      g.fillRect(-50, -50, 100, 100);
      g.restore();
    }
  }

  const skyLayer = layer(paintSky);
  const cityLayer = layer(paintCity);

  // ---------- Éléments animés ----------
  function drawBeams(t) { // projecteurs
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    [[150, 0], [650, 2]].forEach(([x, phase]) => {
      const a = -Math.PI / 2 + Math.sin(t * 0.45 + phase) * 0.55, len = 380, spread = 0.045;
      const g = ctx.createLinearGradient(x, GROUND, x + Math.cos(a) * len, GROUND + Math.sin(a) * len);
      g.addColorStop(0, 'rgba(200,220,255,0.16)');
      g.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(x, GROUND);
      ctx.lineTo(x + Math.cos(a - spread) * len, GROUND + Math.sin(a - spread) * len);
      ctx.lineTo(x + Math.cos(a + spread) * len, GROUND + Math.sin(a + spread) * len);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  function drawBeacons(t) {
    beacons.forEach((b) => {
      if ((t + b.phase) % 2.4 > 0.35) return;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 8);
      g.addColorStop(0, 'rgba(255,70,70,0.9)');
      g.addColorStop(1, 'rgba(255,70,70,0)');
      ctx.fillStyle = g;
      ctx.fillRect(b.x - 8, b.y - 8, 16, 16);
    });
  }

  function drawBattery(state) {
    const x = W / 2, y = GROUND - 10;
    ctx.fillStyle = '#10151f';
    ctx.fillRect(x - 24, y + 2, 48, 10);
    ctx.fillStyle = '#1a2230';
    ctx.beginPath();
    ctx.arc(x, y + 2, 11, Math.PI, TAU);
    ctx.fill();
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(state.aim);
    ctx.fillStyle = '#252e3f';
    ctx.fillRect(2, -6, 30, 4.4);
    ctx.fillRect(2, 1.6, 30, 4.4);
    ctx.fillStyle = '#0c1018';
    ctx.fillRect(30, -6, 3, 4.4);
    ctx.fillRect(30, 1.6, 3, 4.4);
    if (state.interceptors.some((i) => i.age < 0.09)) { // flamme au départ du tir
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(36, 0, 0, 36, 0, 22);
      g.addColorStop(0, 'rgba(255,240,190,0.95)');
      g.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = g;
      ctx.fillRect(14, -22, 44, 44);
    }
    ctx.restore();
  }

  // Trajectoire prévue et point d'impact de chaque missile.
  function drawProjections(live, next) {
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 1;
    live.forEach((m) => {
      const ix = m.x + (m.ux / m.uy) * (GROUND - m.y);
      ctx.strokeStyle = 'rgba(255,77,94,0.22)';
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(ix, GROUND);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,77,94,0.65)';
      ctx.beginPath();
      ctx.moveTo(ix - 5, GROUND + 9);
      ctx.lineTo(ix + 5, GROUND + 9);
      ctx.lineTo(ix, GROUND + 2);
      ctx.fill();
    });
    ctx.setLineDash([]);
    if (next) { // prochaine cible
      ctx.strokeStyle = 'rgba(255,77,94,0.75)';
      ctx.beginPath();
      ctx.arc(next.x, next.y, 16, 0, TAU);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawMissile(m, t) {
    ctx.save();
    ctx.translate(m.x, m.y);
    ctx.rotate(Math.atan2(m.uy, m.ux));
    const flick = 6 * (0.7 + 0.3 * Math.sin(t * 60 + m.x));
    ctx.globalCompositeOperation = 'lighter';
    const flame = ctx.createLinearGradient(-20, 0, -38 - flick, 0);
    flame.addColorStop(0, 'rgba(255,240,190,0.95)');
    flame.addColorStop(0.4, 'rgba(255,138,61,0.7)');
    flame.addColorStop(1, 'rgba(255,60,20,0)');
    ctx.fillStyle = flame;
    ctx.beginPath();
    ctx.moveTo(-20, -2.6);
    ctx.quadraticCurveTo(-36 - flick, 0, -20, 2.6);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#6f7684'; // ailerons
    ctx.beginPath();
    ctx.moveTo(-21, -3); ctx.lineTo(-27, -8); ctx.lineTo(-14, -3);
    ctx.moveTo(-21, 3); ctx.lineTo(-27, 8); ctx.lineTo(-14, 3);
    ctx.fill();
    const body = ctx.createLinearGradient(0, -3.4, 0, 3.4);
    body.addColorStop(0, '#eef0f4');
    body.addColorStop(0.5, '#b5bac4');
    body.addColorStop(1, '#5d6371');
    ctx.fillStyle = body;
    ctx.fillRect(-21, -3.4, 18, 6.8);
    ctx.fillStyle = '#2a2f3c';
    ctx.fillRect(-14, -3.4, 2, 6.8);
    ctx.fillStyle = '#c0392b'; // ogive
    ctx.beginPath();
    ctx.moveTo(-3, -3.4);
    ctx.quadraticCurveTo(4, -2.6, 9, 0);
    ctx.quadraticCurveTo(4, 2.6, -3, 3.4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    if (m.doomed) { // cible verrouillée par un intercepteur
      ctx.save();
      ctx.strokeStyle = '#7ee0b5';
      ctx.setLineDash([4, 4]);
      ctx.lineDashOffset = -t * 30;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 17, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawInterceptor(i) {
    ctx.save();
    ctx.translate(i.x, i.y);
    ctx.rotate(Math.atan2(i.uy, i.ux));
    ctx.globalCompositeOperation = 'lighter';
    const flame = ctx.createLinearGradient(-12, 0, -26, 0);
    flame.addColorStop(0, 'rgba(255,240,190,0.95)');
    flame.addColorStop(1, 'rgba(255,120,40,0)');
    ctx.fillStyle = flame;
    ctx.fillRect(-26, -1.6, 14, 3.2);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#f2f4f8';
    ctx.fillRect(-12, -1.6, 12, 3.2);
    ctx.fillStyle = '#7ee0b5';
    ctx.beginPath();
    ctx.moveTo(0, -1.6); ctx.lineTo(5, 0); ctx.lineTo(0, 1.6);
    ctx.fill();
    ctx.restore();
  }

  function drawParticles() {
    const list = fx.particles;
    for (const p of list) { // fumée d'abord, puis les lueurs en mode additif
      if (p.kind !== 'smoke') continue;
      const k = p.age / p.life;
      ctx.fillStyle = `rgba(${p.tone},${0.34 * (1 - k) * Math.min(1, p.age * 6)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.r + p.grow * p.age), 0, TAU);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (const p of list) {
      const k = p.age / p.life, r = Math.max(0.1, p.r + p.grow * p.age);
      if (p.kind === 'fire') {
        ctx.fillStyle = `hsla(${42 - 38 * k},100%,${62 - 26 * k}%,${0.85 * (1 - k)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, TAU);
        ctx.fill();
      } else if (p.kind === 'spark') {
        ctx.strokeStyle = `rgba(255,214,140,${1 - k})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 0.035, p.y - p.vy * 0.035);
        ctx.stroke();
      } else if (p.kind === 'ring') {
        ctx.strokeStyle = `rgba(255,236,200,${0.7 * (1 - k)})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, TAU);
        ctx.stroke();
      } else if (p.kind === 'glow') {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
        g.addColorStop(0, `rgba(255,244,210,${1 - k})`);
        g.addColorStop(1, 'rgba(255,120,40,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, TAU);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  // Radar : la batterie au centre, chaque missile placé selon son cap et sa distance.
  function drawRadar(state, t) {
    const cx = W - 74, cy = 100, R = 62;
    ctx.save();
    ctx.fillStyle = 'rgba(6,14,24,0.72)';
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI, TAU);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(126,224,181,0.45)';
    ctx.lineWidth = 1;
    [1, 0.66, 0.33].forEach((f) => {
      ctx.beginPath();
      ctx.arc(cx, cy, R * f, Math.PI, TAU);
      ctx.stroke();
    });
    ctx.beginPath();
    ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
    ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - R);
    ctx.stroke();
    const sweep = Math.PI + (Math.sin(t * 1.5) * 0.5 + 0.5) * Math.PI;
    const dir = Math.cos(t * 1.5) >= 0 ? 1 : -1;
    for (let i = 0; i < 6; i++) {
      const a = sweep - dir * i * 0.06;
      ctx.strokeStyle = `rgba(126,224,181,${0.7 - i * 0.11})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.stroke();
    }
    state.missiles.forEach((m) => {
      const dx = m.x - W / 2, dy = GROUND - m.y;
      const dist = Math.min(1, Math.hypot(dx, dy) / 525), a = Math.atan2(dy, dx);
      ctx.fillStyle = m.doomed ? '#7ee0b5' : '#ff4d5e';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * dist * R, cy - Math.sin(a) * dist * R, 2.6, 0, TAU);
      ctx.fill();
    });
    ctx.fillStyle = '#7ee0b5';
    ctx.fillRect(cx - 2, cy - 2, 4, 4);
    ctx.font = '600 12px ui-monospace, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = state.eta !== null && state.eta < 3 ? '#ff4d5e' : '#ff8a3d';
    ctx.fillText(state.eta === null ? 'T− – –' : `T− ${Math.max(0, state.eta).toFixed(1)} s`, cx, cy + 17);
    ctx.restore();
  }

  function drawOverlays(danger, t, cam) {
    const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.62);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.45)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);
    if (danger > 0.55) { // bords rouges qui pulsent quand l'impact approche
      const alert = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.6);
      alert.addColorStop(0, 'rgba(255,40,60,0)');
      alert.addColorStop(1, `rgba(255,40,60,${(danger - 0.55) * 0.8 * (0.6 + 0.4 * Math.sin(t * 8))})`);
      ctx.fillStyle = alert;
      ctx.fillRect(0, 0, W, H);
    }
    if (cam.flash > 0.01) {
      ctx.fillStyle = `rgba(255,240,220,${Math.min(1, cam.flash)})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  App.renderer = {
    draw(state) {
      const t = performance.now() / 1000, cam = fx.camera;
      const live = state.missiles.filter((m) => !m.doomed);
      const next = live.reduce((low, m) => (!low || m.y > low.y ? m : low), null);
      const danger = next ? clamp01((next.y - GROUND * 0.5) / (GROUND * 0.5)) : 0;

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      if (cam.shake > 0.1) ctx.translate((Math.random() - 0.5) * cam.shake * 2, (Math.random() - 0.5) * cam.shake * 2);
      ctx.drawImage(skyLayer, 0, 0, W, H);
      drawBeams(t);
      ctx.drawImage(cityLayer, 0, 0, W, H);
      if (danger) {
        const glow = ctx.createLinearGradient(0, GROUND - 120, 0, GROUND);
        glow.addColorStop(0, 'rgba(255,77,94,0)');
        glow.addColorStop(1, `rgba(255,77,94,${0.45 * danger})`);
        ctx.fillStyle = glow;
        ctx.fillRect(0, GROUND - 120, W, 120);
      }
      drawBeacons(t);
      drawBattery(state);
      drawProjections(live, next);
      state.missiles.forEach((m) => drawMissile(m, t));
      state.interceptors.forEach(drawInterceptor);
      drawParticles();
      ctx.restore();
      drawOverlays(danger, t, cam);
      drawRadar(state, t);
    }
  };
})(window.App = window.App || {});
