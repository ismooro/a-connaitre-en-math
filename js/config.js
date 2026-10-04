// Réglages du jeu : tout ce qui se modifie facilement est ici.
(function (App) {
  App.RULES = {
    STREAK_TO_ADVANCE: 10, // bonnes réponses d'affilée pour passer au niveau suivant
    ERRORS_TO_RESET: 4,    // erreurs d'affilée avant retour au niveau 1
    SPEED_PENALTY: 0.5     // accélération ajoutée à chaque erreur (retirée à la bonne réponse)
  };
  App.WORLD = { W: 800, H: 400, GROUND: 340 };
})(window.App = window.App || {});
