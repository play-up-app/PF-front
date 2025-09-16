import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Grid, List, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PlanningHeader from '@/components/planning/PlanningHeader';
import TournamentSelector from '@/components/planning/TournamentSelector';
import PlanningActions from '@/components/planning/PlanningActions';
import CalendarView from '@/components/planning/CalendarView';
import TableView from '@/components/planning/TableView';
import LoadingState from '@/components/planning/LoadingState';
import FeaturesInfo from '@/components/planning/FeaturesInfo';
import { AIPlanning, TournamentDetail, Match } from '@/types/planning';
import { tournamentService, planningService, matchService } from '@/services/api';

const PlanningPage = () => {
  const navigate = useNavigate();
  const [selectedTournament, setSelectedTournament] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [generatedPlanning, setGeneratedPlanning] = useState<AIPlanning | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [tournaments, setTournaments] = useState<TournamentDetail[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  const getTournaments = async () => {
    const response = await tournamentService.getTournaments();
    setTournaments(response["data"]["tournaments"]);
  }

  const calculateMatchDurationInMinutes = (startISO: string, endISO: string): number => {
    const startDate = new Date(startISO);
    const endDate = new Date(endISO);
    
    // Calculer la différence en millisecondes puis convertir en minutes
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffInMs / (1000 * 60));
  };

  const getAllMatches = (planning: AIPlanning, selectedTournament: string, tournaments: TournamentDetail[]): Match[] => {
    const allMatches: Match[] = [];
    // Extraire les matchs des poules
    const duration = tournaments.find((tournament) => tournament.id === selectedTournament)?.match_duration_minutes
    if (planning.poules && Array.isArray(planning.poules)) {
      planning.poules.forEach((poule) => {
        if (poule.matchs && Array.isArray(poule.matchs)) {
          poule.matchs.forEach((match) => {
            allMatches.push({
              ...match,
              phase: "poules",
              duration: duration
            });
          });
        }
      });
    }
    
    // Extraire les matchs de la phase d'élimination
    if (planning.phase_elimination_apres_poules) {
      const elimination = planning.phase_elimination_apres_poules;
      
      // Quarts de finale
      if (elimination.quarts && Array.isArray(elimination.quarts)) {
        elimination.quarts.forEach((match) => {
          allMatches.push({
            ...match,
            phase: "quart",
            duration: duration
          });
        });
      }
      
      // Demi-finales
      if (elimination.demi_finales && Array.isArray(elimination.demi_finales)) {
        elimination.demi_finales.forEach((match) => {
          allMatches.push({
            ...match,
            phase: "demi",
            duration: duration  
          });
        });
      }
      
      // Finale
      if (elimination.finale) {
        allMatches.push({
          ...elimination.finale,
          phase: "finale", 
          duration: duration
        });
      }
    }
    return allMatches
  }

  const handleGeneratePlanning = async () => {
    if (!selectedTournament) return;
      
    setIsGenerating(true);
    const response = await matchService.deleteMatchsFromAi(selectedTournament);
    if (response.success) {
      const response = await planningService.generatePlanning(selectedTournament);
      if (response.success) {
        const planningObj = response.data["planning_data"]
        planningObj["total_matches"] = response.data["total_matches"]
        setGeneratedPlanning(planningObj)
        const extractedMatches = getAllMatches(planningObj, selectedTournament, tournaments);
        setMatches(extractedMatches);
        setIsGenerating(false);
        setShowPreview(true);
      } else {
        console.error(response.message);
      }
    }
  };

  const handleRegeneratePlanning = () => {
    setGeneratedPlanning(null);
    setShowPreview(false);
    handleGeneratePlanning();
  };

  const handleValidatePlanning = async () => {
    if (!selectedTournament) return;

    // Confirmation avant validation
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir valider ce planning pour le tournoi ?\n\nCette action va :\n- Changer le statut du tournoi à "Prêt"\n- Créer automatiquement tous les matchs\n- Finaliser le planning\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    setIsValidating(true);
    let hasError = false;
    let errorMessage = '';

    try {
      // 1. Changer le statut du tournoi à "ready"
      try {
        await tournamentService.updateTournamentStatus(selectedTournament, "ready");
      } catch (error) {
        console.error('Erreur lors du changement de statut:', error);
        errorMessage += `Erreur changement de statut: ${error instanceof Error ? error.message : 'Erreur inconnue'}\n`;
        hasError = true;
      }
      
      // 2. Créer les matchs depuis l'IA
      try {
        await matchService.createMatchsFromAi(selectedTournament);
      } catch (error) {
        console.error('Erreur lors de la création des matchs:', error);
        errorMessage += `Erreur création des matchs: ${error instanceof Error ? error.message : 'Erreur inconnue'}\n`;
        hasError = true;
      }
      
    } finally {
      setIsValidating(false);
      
      // 3. Toujours rediriger vers la page de détail du tournoi
      if (hasError) {
        alert(`Validation partiellement réussie avec des erreurs :\n\n${errorMessage}\n\nVous êtes redirigé vers la page du tournoi pour vérifier l'état.`);
      } else {
        alert('Planning validé avec succès ! Redirection vers le tournoi...');
      }
      
      navigate(`/tournaments/${selectedTournament}`);
    }
  };



  useEffect(() => {
    getTournaments()
  }, [])

  return (
    <Layout>
      <div className="space-y-8">
        <PlanningHeader />

        <TournamentSelector
          tournaments={tournaments}
          selectedTournament={selectedTournament}
          onTournamentChange={setSelectedTournament}
        />

        <Card>
          <CardContent>
            <PlanningActions
              selectedTournament={selectedTournament}
              isGenerating={isGenerating}
              generatedPlanning={generatedPlanning}
              showPreview={showPreview}
              onGenerate={handleGeneratePlanning}
              onRegenerate={handleRegeneratePlanning}
              onTogglePreview={() => setShowPreview(!showPreview)}
            />
          </CardContent>
        </Card>

        {generatedPlanning && showPreview && (
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    Planning généré
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Planning optimisé automatiquement par l'IA - {generatedPlanning.total_matches} matchs programmés
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleValidatePlanning}
                    disabled={isValidating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className={`w-4 h-4 mr-1 ${isValidating ? 'animate-pulse' : ''}`} />
                    {isValidating ? 'Validation...' : 'Valider le planning'}
                  </Button>
                  <Button
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                    disabled={isValidating}
                  >
                    <Grid className="w-4 h-4 mr-1" />
                    Calendrier
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    disabled={isValidating}
                  >
                    <List className="w-4 h-4 mr-1" />
                    Liste
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === 'calendar' ? (
                <CalendarView matches={matches} />
              ) : (
                <TableView matches={matches} />
              )}
            </CardContent>
          </Card>
        )}

        {isGenerating && <LoadingState />}

        <FeaturesInfo />
      </div>
    </Layout>
  );
};

export default PlanningPage;
