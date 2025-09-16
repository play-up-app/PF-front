import { Match } from "@/types/planning";
import { useOptimisticMatch } from './useOptimisticMatch';

export const useMatchScore = (initialMatch: Match) => {
  // Utiliser le hook optimiste pour gérer les scores
  const {
    match,
    scoreTeamA,
    scoreTeamB,
    startMatch,
    endSet,
    finishMatch,
    isPending,
    canUndo,
    isSaving
  } = useOptimisticMatch(initialMatch.id, initialMatch as any);

  const undo = () => {
    // Fonctionnalité undo supprimée avec le temps réel
    console.warn('Undo non disponible avec le temps réel');
  };

  return {
    match,
    canUndo,
    isSaving: isPending,
    scoreTeamA,
    scoreTeamB,
    startMatch,
    endSet,
    undo,
    finishMatch
  };
};