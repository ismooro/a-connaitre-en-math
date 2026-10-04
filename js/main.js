(function (App) {
  const { game, ui, renderer, i18n } = App;
  const t = i18n.t;

  // Touches 1 à 4 = réponses.
  document.addEventListener('keydown', (e) => {
    const index = Number(e.key) - 1;
    if (index >= 0 && index < 4) game.answer(index);
  });

  document.getElementById('langBtn').addEventListener('click', () => {
    i18n.toggle();
    ui.refreshLanguage();
  });

  ui.renderHud(game.state);
  ui.showOverlay({ title: () => t('title'), text: () => t('intro'), button: () => t('start'), action: game.startRun });

  let last = performance.now();
  (function frame(now) {
    game.tick(Math.min((now - last) / 1000, 0.1));
    last = now;
    renderer.draw(game.state);
    requestAnimationFrame(frame);
  })(last);
})(window.App);
