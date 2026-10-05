// Tout ce qui touche au DOM (hors canvas) : en-tête, question, réponses, fenêtre centrale.
(function (App) {
  const { t } = App.i18n;
  const $ = (id) => document.getElementById(id);
  let lastState = null;
  let overlaySpec = null;

  function fillPips(el, count, filled) {
    if (el.children.length !== count) el.innerHTML = '<i></i>'.repeat(count);
    [...el.children].forEach((pip, i) => pip.classList.toggle('on', i < filled));
  }

  function renderHud(state) {
    lastState = state;
    $('levelName').textContent = `${t('level')} ${state.level + 1}/${App.levels.count} : ${t('levelNames')[state.level]}`;
    $('streakLabel').textContent = t('streak');
    $('errorLabel').textContent = t('errors');
    $('speedLabel').textContent = t('speed');
    $('speedValue').textContent = '×' + state.speed.toFixed(1);
    $('langBtn').textContent = t('otherLang');
    fillPips($('streakPips'), App.RULES.STREAK_TO_ADVANCE, state.streak);
    fillPips($('errorPips'), App.RULES.MAX_ERRORS, state.totalErrors);
    $('lifeLabel').textContent = t('life');
    $('lifeValue').textContent = `${state.hp}/${App.RULES.LIVES}`;
    $('lifeBar').style.setProperty('--hp', state.hp / App.RULES.LIVES);
  }

  function renderQuestion(question, onPick) {
    $('prompt').innerHTML = App.math.toMathML(question.prompt);
    const box = $('options');
    box.innerHTML = '';
    question.options.forEach((text, i) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.innerHTML = '<span class="key"></span><span></span>';
      button.children[0].textContent = i + 1;
      button.children[1].innerHTML = App.math.toMathML(text);
      button.addEventListener('click', () => onPick(i));
      box.appendChild(button);
    });
  }

  function revealAnswer(picked, correct) {
    const buttons = [...$('options').children];
    buttons.forEach((b) => { b.disabled = true; });
    buttons[correct].classList.add('right');
    if (picked !== correct) {
      buttons[picked].classList.add('wrong');
      const prompt = $('prompt');
      prompt.classList.remove('shake');
      void prompt.offsetWidth; // relance l'animation
      prompt.classList.add('shake');
    }
  }

  // spec = { title(), text(), button(), action } : des fonctions, pour suivre le changement de langue.
  function renderOverlay() {
    $('overlayTitle').textContent = overlaySpec.title();
    $('overlayText').textContent = overlaySpec.text();
    $('overlayBtn').textContent = overlaySpec.button();
  }

  function showOverlay(spec) {
    overlaySpec = spec;
    renderOverlay();
    $('overlay').hidden = false;
    $('overlayBtn').focus();
  }

  function hideOverlay() {
    overlaySpec = null;
    $('overlay').hidden = true;
  }

  function refreshLanguage() {
    if (lastState) renderHud(lastState);
    if (overlaySpec) renderOverlay();
  }

  $('overlayBtn').addEventListener('click', () => {
    const { action } = overlaySpec;
    hideOverlay();
    action();
  });

  App.ui = { renderHud, renderQuestion, revealAnswer, showOverlay, hideOverlay, refreshLanguage };
})(window.App = window.App || {});
