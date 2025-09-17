import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useMatchScore } from '@/hooks/useMatchScore';
import { Match } from '@/types/planning';
import { Play, Pause, RotateCcw, Trophy, Clock } from 'lucide-react';

interface MatchScoreEntryProps {
  match: Match;
  onMatchUpdate?: (match: Match) => void;
}

export const MatchScoreEntry = ({ match, onMatchUpdate }: MatchScoreEntryProps) => {
  const { toast } = useToast();
  const {
    match: currentMatch,
    canUndo,
    isSaving,
    scoreTeamA,
    scoreTeamB,
    startMatch,
    endSet,
    undo,
    finishMatch
  } = useMatchScore(match);
  
  // Plus besoin de autoSave avec le temps réel
  
  // Debug: Log des changements de match
  useEffect(() => {
    console.log('🔄 MatchScoreEntry - Match updated:', currentMatch);
  }, [currentMatch]);
  
  useEffect(() => {
    onMatchUpdate?.(currentMatch);
  }, [currentMatch, onMatchUpdate]);
  
  const handleStartMatch = async () => {
    try {
      await startMatch();
      toast({
        title: "Match démarré",
        description: "Le match a été démarré avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer le match",
        variant: "destructive",
      });
    }
  };
  
  const handleEndSet = async () => {
    try {
      await endSet();
      toast({
        title: "Set terminé",
        description: `Set ${currentMatch.current_set} terminé`,
      });
    } catch (error) {
      toast({
        title: "Set incomplet",
        description: error.message || "Le set doit être gagné avec 25 points et 2 points d'écart minimum",
        variant: "destructive",
      });
    }
  };
  
  const handleFinishMatch = async () => {
    try {
      await finishMatch();
      toast({
        title: "Match terminé",
        description: "Le match a été terminé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de terminer le match",
        variant: "destructive",
      });
    }
  };
  
  const getStatusBadge = () => {
    const statusMap = {
      'scheduled': { label: 'Programmé', variant: 'secondary' as const },
      'ready': { label: 'Prêt', variant: 'default' as const },
      'in_progress': { label: 'En cours', variant: 'destructive' as const },
      'completed': { label: 'Terminé', variant: 'outline' as const },
      'cancelled': { label: 'Annulé', variant: 'destructive' as const },
    };
    
    const status = statusMap[currentMatch.status];
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };
  
  const isDecisiveSet = currentMatch.current_set === 5 || 
    (currentMatch.team_a_score === 2 && currentMatch.team_b_score === 2);
  const targetScore = isDecisiveSet ? 15 : 25;
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">
            Court {currentMatch.court_number} - {currentMatch.phase}
          </CardTitle>
          {getStatusBadge()}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          {currentMatch.schedule_time}
          {currentMatch.actual_start_time && (
            <span className="ml-4">
              Démarré à {new Date(currentMatch.actual_start_time).toLocaleTimeString()}
            </span>
          )}
          {isSaving && (
            <span className="ml-4 flex items-center gap-1 text-orange-600">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              Synchronisation...
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Score principal */}
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{currentMatch.metadata.original_team_names.team_a}</h3>
            <div className="text-4xl font-bold text-primary">{currentMatch.team_a_score}</div>
            <div className="text-sm text-muted-foreground">Sets</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-medium mb-2">Set {currentMatch.current_set}</div>
            <div className="flex items-center justify-center gap-4 text-3xl font-bold">
              <span className="text-primary">{currentMatch.current_set_score.team_a}</span>
              <span className="text-muted-foreground">-</span>
              <span className="text-primary">{currentMatch.current_set_score.team_b}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              {isDecisiveSet ? 'Set décisif (15 pts)' : `Premier à ${targetScore}`}
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{currentMatch.metadata.original_team_names.team_b}</h3>
            <div className="text-4xl font-bold text-primary">{currentMatch.team_b_score}</div>
            <div className="text-sm text-muted-foreground">Sets</div>
          </div>
        </div>
        
        {/* Boutons de score */}
        {currentMatch.status === 'in_progress' && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={scoreTeamA}
              size="lg"
              className="h-16 text-lg"
              variant="outline"
            >
              +1 {currentMatch.metadata.original_team_names.team_a}
            </Button>
            <Button
              onClick={scoreTeamB}
              size="lg"
              className="h-16 text-lg"
              variant="outline"
            >
              +1 {currentMatch.metadata.original_team_names.team_b}
            </Button>
          </div>
        )}
        
        {/* Historique des sets */}
        {currentMatch.sets_data.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Historique des sets</h4>
            <div className="grid grid-cols-1 gap-2">
              {currentMatch.sets_data.map((set) => (
                <div key={set.set_number} className="flex items-center justify-between py-2 px-4 bg-muted rounded-lg">
                  <span className="font-medium">Set {set.set_number}</span>
                  <span className="font-mono">
                    {set.team_a} - {set.team_b}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <Separator />
        
        {/* Actions */}
        <div className="flex flex-wrap gap-2 justify-center">
          {currentMatch.status === 'ready' && (
            <Button onClick={handleStartMatch} className="gap-2">
              <Play className="h-4 w-4" />
              Démarrer le match
            </Button>
          )}
          
          {currentMatch.status === 'in_progress' && (
            <>
              <Button
                onClick={undo}
                disabled={!canUndo}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Annuler
              </Button>
              
              <Button
                onClick={handleEndSet}
                variant="secondary"
                className="gap-2"
              >
                <Pause className="h-4 w-4" />
                Terminer le set
              </Button>
              
              {/* Plus besoin de bouton sauvegarder avec le temps réel */}
            </>
          )}
          
          {currentMatch.status === 'completed' && (
            <Button onClick={handleFinishMatch} className="gap-2">
              <Trophy className="h-4 w-4" />
              Valider le résultat
            </Button>
          )}
        </div>
        
        {currentMatch.winner_team_id && (
          <div className="text-center p-4 bg-tournament-success/10 rounded-lg">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-tournament-success" />
            <div className="text-lg font-semibold">
              Victoire de {currentMatch.winner_team_id === currentMatch.team_a_id ? 
                currentMatch.metadata.original_team_names.team_a : currentMatch.metadata.original_team_names.team_b}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};