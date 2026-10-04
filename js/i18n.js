(function (App) {
  const TEXT = {
    fr: {
      otherLang: 'EN', title: 'Défense mentale',
      intro: "Des frappes aériennes visent la ville. Une bonne réponse détruit un missile. Une erreur accélère les frappes jusqu'à la prochaine bonne réponse. 10 bonnes réponses d'affilée : niveau suivant. 4 erreurs d'affilée : retour au niveau 1. Touches 1 à 4 au clavier.",
      start: 'Commencer', level: 'Niveau', streak: 'Série', errors: 'Erreurs', speed: 'Vitesse',
      hit: 'La ville est touchée', hitText: 'Le niveau recommence.', retry: 'Rejouer le niveau',
      reset: '4 erreurs d’affilée', resetText: 'Retour au niveau 1.', restart: 'Recommencer',
      cleared: 'Niveau réussi', clearedText: 'Série de 10 atteinte.', next: 'Niveau suivant',
      win: 'Victoire', winText: 'Tous les niveaux sont terminés. Erreurs au total : {n}.',
      perfect: 'Tous les niveaux terminés sans aucune erreur.',
      levelNames: ['Carrés', 'Tables de multiplication', 'Factorielles', 'Complexes : forme algébrique',
        'Complexes : forme trigonométrique', 'Complexes : forme exponentielle', 'Mélange final']
    },
    en: {
      otherLang: 'FR', title: 'Mental defense',
      intro: 'Air strikes are targeting the city. A correct answer destroys a missile. A mistake speeds up the strikes until your next correct answer. 10 correct in a row: next level. 4 mistakes in a row: back to level 1. Keys 1 to 4 on the keyboard.',
      start: 'Start', level: 'Level', streak: 'Streak', errors: 'Mistakes', speed: 'Speed',
      hit: 'The city was hit', hitText: 'The level restarts.', retry: 'Replay level',
      reset: '4 mistakes in a row', resetText: 'Back to level 1.', restart: 'Restart',
      cleared: 'Level cleared', clearedText: 'Streak of 10 reached.', next: 'Next level',
      win: 'Victory', winText: 'All levels cleared. Total mistakes: {n}.',
      perfect: 'All levels cleared with no mistakes at all.',
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
