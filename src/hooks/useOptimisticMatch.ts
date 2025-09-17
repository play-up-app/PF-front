import { useState, useEffect, useRef } from 'react';
import { supabase, Match } from '@/lib/supabase';

interface OptimisticMatch extends Match {
  // Interface étendue si nécessaire
}

export const useOptimisticMatch = (matchId: string, initialMatch: OptimisticMatch) => {
  // État local optimiste (ce que voit l'utilisateur)
  const [optimisticMatch, setOptimisticMatch] = useState<OptimisticMatch>(initialMatch);
  
  // État Supabase (source de vérité)
  const [realtimeMatch, setRealtimeMatch] = useState<OptimisticMatch>(initialMatch);
  
  // Ref pour avoir accès à l'état optimiste actuel dans les actions
  const optimisticMatchRef = useRef(optimisticMatch);
  
  // Queue des actions en attente
  const pendingActions = useRef<Array<{id: string, action: () => Promise<void>}>>([]);
  const isProcessing = useRef(false);

  // Mettre à jour la ref quand l'état optimiste change
  useEffect(() => {
    optimisticMatchRef.current = optimisticMatch;
  }, [optimisticMatch]);

  // Synchronisation avec Supabase Realtime
  useEffect(() => {
    if (!matchId) return;

    const channel = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'match',
        filter: `id=eq.${matchId}`
      }, (payload) => {
        console.log('🔄 Realtime update received:', payload);
        const updatedMatch = { ...(payload.new as OptimisticMatch) };
        setRealtimeMatch(updatedMatch);
        
        // Si pas d'actions en attente, synchroniser l'état optimiste
        if (pendingActions.current.length === 0) {
          setOptimisticMatch(updatedMatch);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Optimistic subscription active pour le match', matchId);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Processeur de queue d'actions
  const processQueue = async () => {
    if (isProcessing.current || pendingActions.current.length === 0) return;
    
    isProcessing.current = true;
    
    while (pendingActions.current.length > 0) {
      const action = pendingActions.current.shift();
      if (action) {
        try {
          await action.action();
        } catch (error) {
          console.error('❌ Erreur lors de l\'exécution de l\'action:', error);
          // En cas d'erreur, resynchroniser avec la DB
          setOptimisticMatch(realtimeMatch);
        }
      }
    }
    
    isProcessing.current = false;
  };

  // Fonction générique pour mettre à jour le score
  const updateScore = async (team: 'A' | 'B', increment: number) => {
    const actionId = Date.now().toString();
    
    console.log(`🎯 Update score ${team} by ${increment}`);
    
    // 1. Mise à jour optimiste immédiate (UX)
    setOptimisticMatch(prev => {
      const newMatch = {
        ...prev,
        current_set_score: {
          ...prev.current_set_score,
          team_a: team === 'A' ? prev.current_set_score.team_a + increment : prev.current_set_score.team_a,
          team_b: team === 'B' ? prev.current_set_score.team_b + increment : prev.current_set_score.team_b
        },
        last_score_update_at: new Date().toISOString()
      };
      console.log('🎯 Optimistic update:', newMatch.current_set_score);
      return newMatch;
    });

    // 2. Ajouter l'action à la queue
    pendingActions.current.push({
      id: actionId,
      action: async () => {
        // Utiliser l'état optimiste actuel via la ref
        const baseMatch = optimisticMatchRef.current;
        
        const newSetScore = {
          ...baseMatch.current_set_score,
          team_a: team === 'A' ? baseMatch.current_set_score.team_a + increment : baseMatch.current_set_score.team_a,
          team_b: team === 'B' ? baseMatch.current_set_score.team_b + increment : baseMatch.current_set_score.team_b
        };
        
        console.log('🎯 Database update (from optimistic ref):', newSetScore);
        
        const { error } = await supabase
          .from('match')
          .update({
            current_set_score: newSetScore,
            last_score_update_at: new Date().toISOString()
          })
          .eq('id', matchId);

        if (error) {
          throw error;
        }
      }
    });

    // 3. Traiter la queue
    processQueue();
  };

  // Actions spécifiques
  const scoreTeamA = () => updateScore('A', 1);
  const scoreTeamB = () => updateScore('B', 1);
  const decrementTeamA = () => updateScore('A', -1);
  const decrementTeamB = () => updateScore('B', -1);

  // Autres actions du match
  const startMatch = async () => {
    const { error } = await supabase
      .from('match')
      .update({
        status: 'in_progress',
        actual_start_time: new Date().toISOString()
      })
      .eq('id', matchId);

    if (error) throw error;
  };

  const endSet = async () => {
    const match = optimisticMatch;
    const isDecisiveSet = match.current_set === 5 || 
      (match.team_a_score === 2 && match.team_b_score === 2);
    const targetScore = isDecisiveSet ? 15 : 25;
    const minDifference = 2;
    
    const teamASetScore = match.current_set_score.team_a;
    const teamBSetScore = match.current_set_score.team_b;
    
    // Check if set is won
    const setWon = (teamASetScore >= targetScore && teamASetScore - teamBSetScore >= minDifference) ||
                  (teamBSetScore >= targetScore && teamBSetScore - teamASetScore >= minDifference);
    
    if (!setWon) {
      throw new Error(`Le set doit être gagné avec ${targetScore} points et 2 points d'écart minimum`);
    }
    
    const setWinner = teamASetScore > teamBSetScore ? 'team_a' : 'team_b';
    const newSetsData = [...match.sets_data, {
      set_number: match.current_set,
      team_a: teamASetScore,
      team_b: teamBSetScore
    }];
    
    const newTeamAScore = setWinner === 'team_a' ? match.team_a_score + 1 : match.team_a_score;
    const newTeamBScore = setWinner === 'team_b' ? match.team_b_score + 1 : match.team_b_score;
    
    // Check if match is won (best of 5 sets)
    const matchWon = newTeamAScore === 3 || newTeamBScore === 3;
    
    const { error } = await supabase
      .from('match')
      .update({
        team_a_score: newTeamAScore,
        team_b_score: newTeamBScore,
        current_set: matchWon ? match.current_set : match.current_set + 1,
        current_set_score: { team_a: 0, team_b: 0 },
        sets_data: newSetsData,
        status: matchWon ? 'completed' : match.status,
        winner_team_id: matchWon ? (newTeamAScore > newTeamBScore ? match.team_a_id : match.team_b_id) : undefined,
        actual_end_time: matchWon ? new Date().toISOString() : match.actual_end_time
      })
      .eq('id', matchId);

    if (error) throw error;
  };

  const finishMatch = async () => {
    const { error } = await supabase
      .from('match')
      .update({
        status: 'completed',
        actual_end_time: new Date().toISOString()
      })
      .eq('id', matchId);

    if (error) throw error;
  };

  return {
    match: optimisticMatch, // Ce que voit l'utilisateur
    realtimeMatch, // État réel de la DB
    scoreTeamA,
    scoreTeamB,
    decrementTeamA,
    decrementTeamB,
    startMatch,
    endSet,
    finishMatch,
    isPending: pendingActions.current.length > 0 || isProcessing.current,
    canUndo: false, // Plus d'undo avec le temps réel
    isSaving: false // Plus de sauvegarde manuelle
  };
};
