// Carrés (0 à 16, plus 25), tables de multiplication (0 à 12), factorielles (0 à 10).
(function (App) {
  const { randInt, pick, buildQuestion } = App.util;

  const SQUARE_BASES = [...Array(17).keys(), 25];
  const factorial = (n) => (n < 2 ? 1 : n * factorial(n - 1));
  const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); // 3 628 800

  // `near` : erreurs plausibles ; on complète avec answer ± k si besoin.
  function numeric(prompt, answer, near) {
    const wrong = new Set(near.filter((v) => v >= 0 && v !== answer));
    for (let k = 1; wrong.size < 3; k++) {
      [answer + k, answer - k].forEach((v) => { if (v >= 0) wrong.add(v); });
    }
    return buildQuestion(prompt, group(answer), [...wrong].map(group));
  }

  App.numeric = {
    squares() {
      const n = pick(SQUARE_BASES);
      return numeric(`${n}² = ?`, n * n, [(n + 1) ** 2, (n - 1) ** 2, n * (n + 1), 2 * n]);
    },
    tables() {
      const a = randInt(13), b = randInt(13);
      return numeric(`${a} × ${b} = ?`, a * b, [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, a + b]);
    },
    factorials() {
      const n = randInt(11);
      return numeric(`${n}! = ?`, factorial(n), [factorial(n + 1), factorial(n - 1), n * n, n * (n + 1)]);
    }
  };
})(window.App = window.App || {});
