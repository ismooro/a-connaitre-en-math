// Formules sur les nombres complexes (avec a, b, r, θ — sans valeurs numériques).
// Pour ajouter une question : item('énoncé', 'bonne réponse', 'fausse 1', 'fausse 2', 'fausse 3')
(function (App) {
  const { pick, buildQuestion } = App.util;
  const item = (prompt, answer, ...wrong) => ({ prompt, answer, wrong });

  const R = '√(a² + b²)';
  const A = 'z = a + ib ⇒ ';
  const T = 'z = r(cos θ + i sin θ) ⇒ ';
  const E = 'z = r e^(iθ) ⇒ ';

  const ALGEBRAIC = [
    item(A + 'Re(z) = ?', 'a', 'b', 'ib', 'a + b'),
    item(A + 'Im(z) = ?', 'b', 'ib', 'a', 'a − b'),
    item(A + 'z̄ = ?', 'a − ib', '−a + ib', 'a + ib', 'b − ia'),
    item(A + 'z · z̄ = ?', 'a² + b²', 'a² − b²', '(a + b)²', '2a'),
    item(A + 'z + z̄ = ?', '2a', '2ib', '2b', 'a² + b²'),
    item(A + 'z − z̄ = ?', '2ib', '2b', '2a', '0'),
    item(A + '|z| = ?', R, 'a² + b²', 'a + b', '√(a² − b²)'),
    item(A + '|z|² = ?', 'a² + b²', 'a² − b²', 'a + b', '(a + b)²'),
    item(A + '1/z = ?', '(a − ib)/(a² + b²)', '(a + ib)/(a² + b²)', '(a − ib)/(a² − b²)', 'a − ib'),
    item(A + 'z² = ?', 'a² − b² + 2iab', 'a² + b²', 'a² − b²', 'a² + b² + 2iab'),
    item(A + '(z + z̄)/2 = ?', 'a', 'b', 'ib', 'a²'),
    item(A + '(z − z̄)/(2i) = ?', 'b', 'a', 'ib', '2b'),
    item('z ∈ iℝ ⇔ ?', 'a = 0', 'b = 0', 'a = b', 'a² + b² = 0'),
    item('z ∈ ℝ ⇔ ?', 'b = 0', 'a = 0', 'a = b', 'a = −b'),
    item('i² = ?', '−1', '1', 'i', '−i')
  ];

  const TRIGONOMETRIC = [
    item(A + 'r = |z| = ?', R, 'a² + b²', 'a + b', 'b/a'),
    item(A + 'cos θ = ?', 'a/' + R, 'b/' + R, 'a/(a² + b²)', 'a + b'),
    item(A + 'sin θ = ?', 'b/' + R, 'a/' + R, 'b/(a² + b²)', 'a − b'),
    item(A + 'tan θ = ?', 'b/a', 'a/b', 'ab', 'b − a'),
    item(A + 'z = ?', 'r(cos θ + i sin θ)', 'r(sin θ + i cos θ)', 'r(cos θ − i sin θ)', 'r(cos θ + sin θ)'),
    item(T + 'a = ?', 'r cos θ', 'r sin θ', 'r / cos θ', 'cos θ / r'),
    item(T + 'b = ?', 'r sin θ', 'r cos θ', 'r / sin θ', 'sin θ / r'),
    item(T + 'z̄ = ?', 'r(cos θ − i sin θ)', 'r(−cos θ + i sin θ)', 'r(cos θ + i sin θ)', 'r(sin θ − i cos θ)'),
    item(T + '−z = ?', 'r(cos(θ+π) + i sin(θ+π))', 'r(cos(π−θ) + i sin(π−θ))', 'r(cos(θ+π/2) + i sin(θ+π/2))', 'r(cos θ − i sin θ)'),
    item(T + 'zⁿ = ?', 'rⁿ(cos nθ + i sin nθ)', 'r(cos nθ + i sin nθ)', 'rⁿ(cos θⁿ + i sin θⁿ)', 'nr(cos θ + i sin θ)'),
    item('arg(z₁ · z₂) = ?', 'θ₁ + θ₂', 'θ₁ · θ₂', 'θ₁ − θ₂', 'θ₁ / θ₂'),
    item('arg(z₁ / z₂) = ?', 'θ₁ − θ₂', 'θ₁ + θ₂', 'θ₁ / θ₂', 'θ₂ − θ₁'),
    item('|z₁ · z₂| = ?', 'r₁ r₂', 'r₁ + r₂', 'r₁ / r₂', 'r₁² r₂²'),
    item('|z₁ / z₂| = ?', 'r₁ / r₂', 'r₁ r₂', 'r₁ − r₂', 'r₂ / r₁'),
    item('arg(z̄) = ?', '−θ', 'θ', 'π − θ', 'θ + π')
  ];

  const EXPONENTIAL = [
    item(A + 'z = ?', 'r e^(iθ)', 'r e^θ', 'θ e^(ir)', 'r e^(−iθ)'),
    item(A + 'r = ?', R, 'a² + b²', 'a + b', 'b/a'),
    item('e^(iθ) = ?', 'cos θ + i sin θ', 'cos θ − i sin θ', 'sin θ + i cos θ', 'cos θ + sin θ'),
    item('|e^(iθ)| = ?', '1', 'θ', 'e', '0'),
    item(E + 'z̄ = ?', 'r e^(−iθ)', '−r e^(iθ)', 'r e^(iθ)', '(1/r) e^(iθ)'),
    item(E + 'zⁿ = ?', 'rⁿ e^(inθ)', 'r e^(inθ)', 'rⁿ e^(iθⁿ)', 'n r e^(iθ)'),
    item(E + '1/z = ?', '(1/r) e^(−iθ)', '(1/r) e^(iθ)', '−r e^(iθ)', 'r e^(−iθ)'),
    item(E + 'Re(z) = ?', 'r cos θ', 'r sin θ', 'r e^θ', 'cos θ'),
    item(E + 'Im(z) = ?', 'r sin θ', 'r cos θ', 'i r sin θ', 'sin θ'),
    item('z₁ · z₂ = ?', 'r₁r₂ e^(i(θ₁+θ₂))', 'r₁r₂ e^(iθ₁θ₂)', '(r₁+r₂) e^(i(θ₁+θ₂))', 'r₁r₂ e^(i(θ₁−θ₂))'),
    item('z₁ / z₂ = ?', '(r₁/r₂) e^(i(θ₁−θ₂))', '(r₁/r₂) e^(i(θ₁+θ₂))', 'r₁r₂ e^(i(θ₁−θ₂))', '(r₂/r₁) e^(i(θ₁−θ₂))'),
    item('cos θ = ?', '(e^(iθ) + e^(−iθ)) / 2', '(e^(iθ) − e^(−iθ)) / 2', '(e^(iθ) + e^(−iθ)) / 2i', 'e^(iθ) + e^(−iθ)'),
    item('sin θ = ?', '(e^(iθ) − e^(−iθ)) / 2i', '(e^(iθ) + e^(−iθ)) / 2i', '(e^(iθ) − e^(−iθ)) / 2', 'e^(iθ) − e^(−iθ)'),
    item('e^(iπ) = ?', '−1', '1', 'i', '−i'),
    item('e^(iπ/2) = ?', 'i', '−i', '1', '−1')
  ];

  const from = (bank) => () => {
    const { prompt, answer, wrong } = pick(bank);
    return buildQuestion(prompt, answer, wrong);
  };

  App.complex = { algebraic: from(ALGEBRAIC), trigonometric: from(TRIGONOMETRIC), exponential: from(EXPONENTIAL) };
})(window.App = window.App || {});
