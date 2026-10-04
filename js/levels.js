// 7 niveaux : carrés, tables, factorielles, 3 formes complexes, puis un mélange.
(function (App) {
  const { numeric, complex, util } = App;
  const pools = [numeric.squares, numeric.tables, numeric.factorials,
    complex.algebraic, complex.trigonometric, complex.exponential];
  const generators = [...pools, () => util.pick(pools)()];

  let lastPrompt = '';
  App.levels = {
    count: generators.length,
    // Génère une question en évitant de répéter la précédente.
    next(level) {
      let q;
      do { q = generators[level](); } while (q.prompt === lastPrompt);
      lastPrompt = q.prompt;
      return q;
    }
  };
})(window.App = window.App || {});
