(function (App) {
  const TEXT = {
    fr: {
      otherLang: 'EN', title: 'Défense mentale',
      intro: "Des frappes aériennes visent la ville. Une bonne réponse détruit le missile qui toucherait le sol en premier. Une erreur accélère les frappes jusqu'à la prochaine bonne réponse. Un missile qui touche le sol retire de la vie selon son type (léger : 1, moyen : 2, lourd : 3) et la vie ne se récupère jamais. 10 bonnes réponses d'affilée : niveau suivant. 10 erreurs au total, ou plus de vie : tout recommence au niveau 1. Touches 1 à 4 au clavier.",
      start: 'Commencer', level: 'Niveau', streak: 'Série', errors: 'Erreurs', speed: 'Vitesse', life: 'Vie',
      dead: 'La ville est détruite', deadText: 'Plus aucun point de vie : tout recommence au niveau 1.',
      reset: '10 erreurs au total', resetText: 'Trop d’erreurs : tout recommence au niveau 1.', restart: 'Recommencer',
      cleared: 'Niveau réussi', clearedText: 'Série de 10 atteinte. La vie perdue ne se récupère pas.', next: 'Niveau suivant',
      win: 'Victoire', winText: 'Tous les niveaux sont terminés. Erreurs au total : {n}. Vie restante : {hp}.',
      perfect: 'Tous les niveaux terminés sans aucune erreur. Vie restante : {hp}.',
      levelNames: ['Carrés', 'Tables de multiplication', 'Factorielles', 'Complexes : forme algébrique',
        'Complexes : forme trigonométrique', 'Complexes : forme exponentielle', 'Mélange final']
    },
    en: {
      otherLang: 'FR', title: 'Mental defense',
      intro: 'Air strikes are targeting the city. A correct answer destroys the missile that would reach the ground first. A mistake speeds up the strikes until your next correct answer. A missile that reaches the ground costs life depending on its type (light: 1, medium: 2, heavy: 3), and life never comes back. 10 correct in a row: next level. 10 mistakes in total, or no life left: everything restarts at level 1. Keys 1 to 4 on the keyboard.',
      start: 'Start', level: 'Level', streak: 'Streak', errors: 'Mistakes', speed: 'Speed', life: 'Life',
      dead: 'The city is destroyed', deadText: 'No life left: everything restarts at level 1.',
      reset: '10 mistakes in total', resetText: 'Too many mistakes: everything restarts at level 1.', restart: 'Restart',
      cleared: 'Level cleared', clearedText: 'Streak of 10 reached. Lost life does not come back.', next: 'Next level',
      win: 'Victory', winText: 'All levels cleared. Total mistakes: {n}. Life left: {hp}.',
      perfect: 'All levels cleared with no mistakes at all. Life left: {hp}.',
      levelNames: ['Squares', 'Multiplication tables', 'Factorials', 'Complex: algebraic form',
        'Complex: trigonometric form', 'Complex: exponential form', 'Final mix']
    }
  };

  let lang = 'fr';
  App.i18n = {
    t(key, vars = {}) {
      const value = TEXT[lang][key];
      if (typeof value !== 'string') return value;
      return value.replace(/\{(\w+)\}/g, (_, name) => vars[name]);
    },
    toggle() {
      lang = lang === 'fr' ? 'en' : 'fr';
      document.documentElement.lang = lang;
    }
  };
})(window.App = window.App || {});
