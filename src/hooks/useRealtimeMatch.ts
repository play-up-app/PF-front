import { useEffect, useState } from 'react';
import { supabase, Match } from '@/lib/supabase';

interface UseRealtimeMatchReturn {
  match: Match | null;
  loading: boolean;
  error: string | null;
  updateMatch: (updates: Partial<Match>) => Promise<void>;
}

/**
 * Hook pour écouter un match spécifique en temps réel
 */
export function useRealtimeMatch(matchId: string): UseRealtimeMatchReturn {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    // Charger le match initial
    const fetchMatch = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('match')
          .select('*')
          .eq('id', matchId)
          .single();

        if (fetchError) {
          setError(`Erreur lors du chargement: ${fetchError.message}`);
          return;
        }

        setMatch(data);
        setError(null);
      } catch (err) {
        setError(`Erreur inattendue: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();

    // S'abonner aux changements en temps réel pour ce match
    const channel = supabase
      .channel(`match_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'match',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          console.log('🔄 Match update received:', payload);
          console.log('🔄 Previous match:', match);
          console.log('🔄 New match data:', payload.new);
          // Créer une nouvelle référence d'objet pour forcer le re-render
          setMatch({ ...(payload.new as Match) });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscription active pour le match', matchId);
        } else if (status === 'CHANNEL_ERROR') {
          setError('Erreur de connexion temps réel');
        }
      });

    // Cleanup
    return () => {
      console.log('🧹 Nettoyage de la subscription pour le match', matchId);
      supabase.removeChannel(channel);
    };
  }, [matchId]);

  // Fonction pour mettre à jour le match
  const updateMatch = async (updates: Partial<Match>) => {
    if (!matchId) return;

    try {
      const { error: updateError } = await supabase
        .from('match')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        //   last_modified_by: 'current_user' // TODO: Récupérer l'ID utilisateur actuel
        })
        .eq('id', matchId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      console.log('✅ Match mis à jour:', updates);
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour du match:', err);
      setError(`Erreur lors de la mise à jour: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  return { match, loading, error, updateMatch };
}
