// Règles du jeu et état. Phases : menu → playing → (cleared | dead | reset | victory).
(function (App) {
  const { RULES, WORLD, MISSILES, ui, levels, util } = App;
  const { t } = App.i18n;

  const state = {
    phase: 'menu', level: 0, streak: 0, speed: 1, totalErrors: 0, hp: RULES.LIVES,
    question: null, locked: false, missiles: [], interceptors: [], scars: [], eta: null, aim: -Math.PI / 2, spawnTimer: 0
  };
  let advanceTimer = null;

  const baseSpeed = () => 30 + state.level * 6;                    // pixels / seconde
  const spawnDelay = () => Math.max(1.8, 4.5 - state.level * 0.4); // secondes
  const maxThreats = () => 2 + Math.floor(state.level / 2);        // missiles menaçants en même temps
  const velocity = (m) => baseSpeed() * state.speed * MISSILES[m.type].speed;
  const etaOf = (m) => (WORLD.GROUND - m.y) / (m.uy * velocity(m)); // secondes avant l'impact
  const threats = () => state.missiles.filter((m) => !m.doomed);

  // Nouvelle partie : vie pleine, 0 erreur, niveau 1.
  function startRun() {
    Object.assign(state, { level: 0, totalErrors: 0, hp: RULES.LIVES, scars: [] });
    startLevel();
  }

  // La vie, les erreurs et les cicatrices de la ville sont conservées d'un niveau à l'autre.
  function startLevel() {
    clearTimeout(advanceTimer);
    Object.assign(state, { phase: 'playing', streak: 0, speed: 1, missiles: [], interceptors: [], eta: null, spawnTimer: 1.2 });
    App.effects.clear();
    nextQuestion();
  }

  function nextQuestion() {
    state.question = levels.next(state.level);
    state.locked = false;
    ui.renderQuestion(state.question, answer);
    ui.renderHud(state);
  }

  function answer(index) {
    if (state.phase !== 'playing' || state.locked) return;
    state.locked = true;
    const correct = index === state.question.correct;
    ui.revealAnswer(index, state.question.correct);
    if (correct) onCorrect(); else onWrong();
  }

  function onCorrect() {
    state.streak++;
    state.speed = 1;
    intercept();
    ui.renderHud(state);
    if (state.streak >= RULES.STREAK_TO_ADVANCE) return endLevel();
    advanceTimer = setTimeout(nextQuestion, 250);
  }

  function onWrong() {
    state.streak = 0;
    state.totalErrors++;
    state.speed += RULES.SPEED_PENALTY;
    ui.renderHud(state);
    if (state.totalErrors >= RULES.MAX_ERRORS) return gameOver('reset');
    advanceTimer = setTimeout(nextQuestion, 1000);
  }

  // kind : 'reset' (10 erreurs au total) ou 'dead' (plus de vie). Dans les deux cas, tout recommence.
  function gameOver(kind) {
    clearTimeout(advanceTimer);
    state.phase = kind;
    ui.showOverlay({ title: () => t(kind), text: () => t(kind + 'Text'), button: () => t('restart'), action: startRun });
  }

  function endLevel() {
    if (state.level < levels.count - 1) {
      state.phase = 'cleared';
      return ui.showOverlay({
        title: () => t('cleared'), text: () => t('clearedText'), button: () => t('next'),
        action: () => { state.level++; startLevel(); }
      });
    }
    state.phase = 'victory';
    ui.showOverlay({
      title: () => t('win'),
      text: () => t(state.totalErrors ? 'winText' : 'perfect', { n: state.totalErrors, hp: state.hp }),
      button: () => t('restart'), action: startRun
    });
  }

  // Lance un intercepteur sur le missile qui touchera le sol en premier.
  function intercept() {
    const target = threats().sort((a, b) => etaOf(a) - etaOf(b))[0];
    if (!target) return;
    target.doomed = true;
    const x = WORLD.W / 2, y = WORLD.GROUND - 10;
    state.aim = Math.atan2(target.y - y, target.x - x);
    const ux = Math.cos(state.aim), uy = Math.sin(state.aim);
    state.interceptors.push({ x: x + ux * 36, y: y + uy * 36, ux, uy, speed: 900, age: 0, target });
  }

  function updateInterceptors(dt) {
    state.interceptors = state.interceptors.filter((i) => {
      const target = i.target;
      const dx = target.x - i.x, dy = target.y - i.y, dist = Math.hypot(dx, dy);
      const step = i.speed * dt;
      i.age += dt;
      if (dist <= step + 8 || i.age > 1.6) {
        App.effects.explosion(target.x, target.y, 0.7 + MISSILES[target.type].scale * 0.5);
        state.missiles = state.missiles.filter((m) => m !== target);
        return false;
      }
      i.ux = dx / dist;
      i.uy = dy / dist;
      i.x += i.ux * step;
      i.y += i.uy * step;
      App.effects.trail(i.x, i.y, i.ux, i.uy, true);
      return true;
    });
  }

  // Tirage pondéré : les missiles lourds n'apparaissent qu'à partir du niveau 3.
  function pickType() {
    const kinds = Object.keys(MISSILES);
    let r = Math.random() * kinds.reduce((sum, k) => sum + MISSILES[k].weight(state.level), 0);
    return kinds.find((k) => (r -= MISSILES[k].weight(state.level)) < 0) || kinds[0];
  }

  function spawnMissile() {
    const x = 40 + util.randInt(WORLD.W - 80);
    const targetX = 60 + util.randInt(WORLD.W - 120);
    const dx = targetX - x, dy = WORLD.GROUND + 10;
    const length = Math.hypot(dx, dy);
    state.missiles.push({ x, y: -10, ux: dx / length, uy: dy / length, puff: 0, doomed: false, type: pickType(), eta: Infinity });
  }

  // Un missile touche le sol : la ville perd autant de vie que son type l'indique, sans jamais en regagner.
  function hitCity(m) {
    const type = MISSILES[m.type];
    state.hp = Math.max(0, state.hp - type.damage);
    state.missiles = state.missiles.filter((x) => x !== m);
    state.scars.push({ x: m.x, size: type.scale });
    App.effects.explosion(m.x, WORLD.GROUND - 4, 1.5 + type.damage * 0.5);
    App.effects.camera.shake = 6 + type.damage * 4;
    App.effects.camera.flash = 0.25 + type.damage * 0.2;
    ui.renderHud(state);
    if (state.hp <= 0) gameOver('dead');
  }

  function tick(dt) {
    App.effects.update(dt);
    state.scars.forEach((s) => App.effects.burn(s.x, WORLD.GROUND));
    updateInterceptors(dt);
    if (state.phase !== 'playing') return;

    state.spawnTimer -= dt;
    if (!state.missiles.length) state.spawnTimer = Math.min(state.spawnTimer, 1); // pas de temps mort
    if (state.spawnTimer <= 0) {
      if (threats().length < maxThreats()) { spawnMissile(); state.spawnTimer = spawnDelay(); }
      else state.spawnTimer = 0.5;
    }
    state.missiles.forEach((m) => {
      const v = velocity(m);
      m.x += m.ux * v * dt;
      m.y += m.uy * v * dt;
      m.eta = etaOf(m);
      m.puff -= dt;
      if (m.puff <= 0) {
        App.effects.trail(m.x, m.y, m.ux, m.uy, false);
        m.puff = 0.035;
      }
    });
    const live = threats();
    state.eta = live.length ? Math.min(...live.map((m) => m.eta)) : null;
    const impact = live.find((m) => m.y >= WORLD.GROUND);
    if (impact) hitCity(impact);
  }

  App.game = { state, startRun, answer, tick };
})(window.App = window.App || {});
