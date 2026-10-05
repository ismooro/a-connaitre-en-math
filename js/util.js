(function (App) {
  const randInt = (n) => Math.floor(Math.random() * n);
  const pick = (list) => list[randInt(list.length)];

  function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Question = { prompt, options: [4 textes], correct: index de la bonne réponse }
  function buildQuestion(prompt, answer, wrong) {
    const options = shuffle([answer, ...shuffle(wrong).slice(0, 3)]);
    return { prompt, options, correct: options.indexOf(answer) };
  }

  App.util = { randInt, pick, shuffle, buildQuestion };
})(window.App = window.App || {});
