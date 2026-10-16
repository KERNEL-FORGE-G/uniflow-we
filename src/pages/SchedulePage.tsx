// Le planning est construit par l'utilisateur lui-même (créneaux liés à ses propres
// cours) : plus aucun scan ni grille importée. On réutilise donc l'écran de planning
// personnel pour tous les profils (étudiant, délégué, enseignant), afin que la route
// historique /app/emploi-du-temps affiche partout la même expérience.
export { default } from './independent/IndependentSchedulePage'
