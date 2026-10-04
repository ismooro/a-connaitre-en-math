// Règles du jeu et état. Phases : menu → playing → (cleared | hit | reset | victory).
(function (App) {
  const { RULES, WORLD, ui, levels, util } = App;
  const { t } = App.i18n;

  const state = {
    phase: 'menu', level: 0, streak: 0, errors: 0, speed: 1, totalErrors: 0,
    question: null, locked: false, missiles: [], interceptors: [], burning: null, eta: null, aim: -Math.PI / 2, spawnTimer: 0
  };
  let advanceTimer = null;

  const baseSpeed = () => 30 + state.level * 6;                    // pixels / seconde
  const spawnDelay = () => Math.max(1.8, 4.5 - state.level * 0.4); // secondes

  function startRun() {
    state.level = 0;
    state.totalErrors = 0;
    startLevel();
  }

  function startLevel() {
    clearTimeout(advanceTimer);
    Object.assign(state, { phase: 'playing', streak: 0, errors: 0, speed: 1, missiles: [], interceptors: [], burning: null, eta: null, spawnTimer: 1.2 });
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
    state.errors = 0;
    state.speed = 1;
    intercept();
    ui.renderHud(state);
    if (state.streak >= RULES.STREAK_TO_ADVANCE) return endLevel();
    advanceTimer = setTimeout(nextQuestion, 250);
  }

  function onWrong() {
    state.streak = 0;
    state.errors++;
    state.totalErrors++;
    state.speed += RULES.SPEED_PENALTY;
    ui.renderHud(state);
    if (state.errors >= RULES.ERRORS_TO_RESET) {
      state.phase = 'reset';
      return ui.showOverlay({
        title: () => t('reset'), text: () => t('resetText'), button: () => t('restart'), action: startRun
      });
    }
    advanceTimer = setTimeout(nextQuestion, 1000);
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
      text: () => (state.totalErrors ? t('winText', { n: state.totalErrors }) : t('perfect')),
      button: () => t('restart'), action: startRun
    });
  }

  // Lance un intercepteur sur le missile non verrouillé le plus proche du sol.
  function intercept() {
    const target = state.missiles.filter((m) => !m.doomed).sort((a, b) => b.y - a.y)[0];
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
        App.effects.explosion(target.x, target.y, 1);
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

  function spawnMissile() {
    const x = 40 + util.randInt(WORLD.W - 80);
    const targetX = 60 + util.randInt(WORLD.W - 120);
    const dx = targetX - x, dy = WORLD.GROUND + 10;
    const length = Math.hypot(dx, dy);
    state.missiles.push({ x, y: -10, ux: dx / length, uy: dy / length, puff: 0, doomed: false });
  }

  function loseLevel(missile) {
    clearTimeout(advanceTimer);
    state.phase = 'hit';
    state.burning = { x: missile.x, y: WORLD.GROUND };
    state.missiles = state.missiles.filter((m) => m !== missile);
    App.effects.explosion(missile.x, WORLD.GROUND - 4, 3);
    App.effects.camera.shake = 14;
    App.effects.camera.flash = 0.9;
    ui.showOverlay({
      title: () => t('hit'), text: () => t('hitText'), button: () => t('retry'), action: startLevel
    });
  }

  function tick(dt) {
    App.effects.update(dt);
    if (state.burning) App.effects.burn(state.burning.x, state.burning.y);
    updateInterceptors(dt);
    if (state.phase !== 'playing') return;

    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) {
      spawnMissile();
      state.spawnTimer = spawnDelay();
    }
    const v = baseSpeed() * state.speed;
    state.missiles.forEach((m) => {
      m.x += m.ux * v * dt;
      m.y += m.uy * v * dt;
      m.puff -= dt;
      if (m.puff <= 0) {
        App.effects.trail(m.x, m.y, m.ux, m.uy, false);
        m.puff = 0.035;
      }
    });
    const live = state.missiles.filter((m) => !m.doomed);
    state.eta = live.length ? Math.min(...live.map((m) => (WORLD.GROUND - m.y) / (m.uy * v))) : null;
    const impact = live.find((m) => m.y >= WORLD.GROUND);
    if (impact) loseLevel(impact);
  }

  App.game = { state, startRun, answer, tick };
})(window.App = window.App || {});
