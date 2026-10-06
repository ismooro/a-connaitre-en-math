// Particules (fumée, flammes, étincelles, ondes de choc) et effets de caméra.
(function (App) {
  const MAX = 800;
  const particles = [];
  const camera = { shake: 0, flash: 0 };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const TAU = Math.PI * 2;

  function add(p) {
    if (particles.length < MAX) {
      particles.push({ age: 0, life: 1, vx: 0, vy: 0, ay: 0, drag: 0, r: 2, grow: 0, ...p });
    }
  }

  // Traînée de fumée derrière un missile (light = intercepteur, fumée claire et courte).
  function trail(x, y, ux, uy, light) {
    const back = light ? 7 : 20;
    add({
      kind: 'smoke', x: x - ux * back, y: y - uy * back, vx: rnd(-8, 8), vy: rnd(-8, 8),
      life: light ? 0.7 : 1.8, r: light ? 2 : 3, grow: light ? 8 : 10, tone: light ? '215,215,225' : '120,120,132'
    });
  }

  // Explosion : éclair, onde de choc, boule de feu, étincelles, fumée. s = taille.
  function explosion(x, y, s = 1) {
    add({ kind: 'glow', x, y, life: 0.3, r: 26 * s, grow: 60 * s });
    add({ kind: 'ring', x, y, life: 0.55, r: 4, grow: 110 * s });
    for (let i = 0; i < 10 * s; i++) {
      const a = rnd(0, TAU), v = rnd(20, 120) * s;
      add({ kind: 'fire', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 2.5, life: rnd(0.4, 0.9), r: rnd(5, 11) * s, grow: 10 * s });
    }
    for (let i = 0; i < 16 * s; i++) {
      const a = rnd(0, TAU), v = rnd(90, 340) * s;
      add({ kind: 'spark', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, ay: 280, drag: 0.7, life: rnd(0.4, 1) });
    }
    for (let i = 0; i < 7 * s; i++) {
      add({ kind: 'smoke', x: x + rnd(-8, 8) * s, y: y + rnd(-8, 8) * s, vx: rnd(-25, 25), vy: -rnd(10, 45), life: rnd(1.6, 2.8), r: rnd(8, 14) * s, grow: 20, tone: '95,95,105' });
    }
    camera.shake = Math.max(camera.shake, 3 * s);
    camera.flash = Math.max(camera.flash, 0.12 * s);
  }

  // Incendie qui continue de brûler après l'impact (à appeler à chaque image).
  function burn(x, y) {
    if (Math.random() < 0.6) {
      add({ kind: 'fire', x: x + rnd(-16, 16), y: y - 2, vx: rnd(-8, 8), vy: -rnd(30, 80), life: rnd(0.5, 1), r: rnd(4, 9), grow: -4 });
    }
    if (Math.random() < 0.3) {
      add({ kind: 'smoke', x: x + rnd(-12, 12), y: y - 10, vx: rnd(-6, 14), vy: -rnd(25, 55), life: rnd(2, 3.2), r: 8, grow: 14, tone: '60,60,70' });
    }
  }

  function update(dt) {
    for (const p of particles) {
      p.age += dt;
      p.vy += p.ay * dt;
      const damp = Math.exp(-p.drag * dt);
      p.vx *= damp;
      p.vy *= damp;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (let i = particles.length - 1; i >= 0; i--) if (particles[i].age >= particles[i].life) particles.splice(i, 1);
    camera.shake *= Math.exp(-6 * dt);
    camera.flash = Math.max(0, camera.flash - 2 * dt);
  }

  function clear() {
    particles.length = 0;
    camera.shake = 0;
    camera.flash = 0;
  }

  App.effects = { particles, camera, trail, explosion, burn, update, clear };
})(window.App = window.App || {});
