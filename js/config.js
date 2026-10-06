// Réglages du jeu : tout ce qui se modifie facilement est ici.
(function (App) {
  App.RULES = {
    STREAK_TO_ADVANCE: 10, // bonnes réponses d'affilée pour passer au niveau suivant
    MAX_ERRORS: 10,        // erreurs au total (sur toute la partie) avant de tout recommencer
    LIVES: 10,             // points de vie de la ville : ils ne se regagnent jamais
    SPEED_PENALTY: 0.5     // accélération ajoutée à chaque erreur (retirée à la bonne réponse)
  };
  // Types de missiles : dégâts à la ville, vitesse relative, taille, couleur,
  // et fréquence d'apparition selon le niveau (lv va de 0 à 6).
  App.MISSILES = {
    light:    { damage: 1, speed: 1.3, scale: 0.8,  color: '#ffd166', weight: () => 5 },
    standard: { damage: 2, speed: 1,   scale: 1,    color: '#ff8a3d', weight: (lv) => 2 + lv * 0.5 },
    heavy:    { damage: 3, speed: 0.7, scale: 1.45, color: '#ff4d5e', weight: (lv) => Math.max(0, lv - 1) }
  };
  App.WORLD = { W: 800, H: 400, GROUND: 340 };
})(window.App = window.App || {});
