import { useEffect, useState } from 'react';
import { Calendar, Grid, List } from 'lucide-react';
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


const PlanningPage = () => {
  const planningUrl = import.meta.env.VITE_PLANNING_SERVICE_URL
  const bddUrl = import.meta.env.VITE_BDD_SERVICE_URL

  const [selectedTournament, setSelectedTournament] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlanning, setGeneratedPlanning] = useState<AIPlanning | null>(null);
  // const [generatedPlanning, setGeneratedPlanning] = useState(null)
  const [showPreview, setShowPreview] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [tournaments, setTournaments] = useState<TournamentDetail[]>([])
  const [matches, setMatches] = useState<Match[]>([])

  const getTournaments = async () => {
    try {
      const response = await fetch(`${bddUrl}/tournaments`, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });
      const responseJson = await response.json()
      setTournaments(responseJson["data"])
    } catch (error) {
        console.error(error.message);
    }
  }

  const calculateMatchDurationInMinutes = (startISO: string, endISO: string): number => {
    const startDate = new Date(startISO);
    const endDate = new Date(endISO);
    
    // Calculer la différence en millisecondes puis convertir en minutes
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffInMs / (1000 * 60));
  };

  const handleGeneratePlanning = async () => {
    if (!selectedTournament) return;
    
    setIsGenerating(true);

    try {
      const response = await fetch(`${planningUrl}/planning/generate`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({tournament_id: selectedTournament})
      })
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      const planningObj = json["data"]["planning_data"]
      planningObj["total_matches"] = json["data"]["total_matches"]

      setGeneratedPlanning(planningObj)
      // Appeler getAllMatches avec le planning généré
      const extractedMatches = getAllMatches(planningObj);
      setMatches(extractedMatches);

      setIsGenerating(false);
      setShowPreview(true);
    } catch (error) {
        console.error(error.message);
        setIsGenerating(false)
    }
  };

  const handleRegeneratePlanning = () => {
    setGeneratedPlanning(null);
    setShowPreview(false);
    handleGeneratePlanning();
  };

  const getAllMatches = (planning: AIPlanning): Match[] => {
    const allMatches: Match[] = [];
    // Extraire les matchs des poules
    if (planning.poules && Array.isArray(planning.poules)) {
      planning.poules.forEach((poule) => {
        if (poule.matchs && Array.isArray(poule.matchs)) {
          poule.matchs.forEach((match) => {
            const duration = calculateMatchDurationInMinutes(match.debut_horaire, match.fin_horaire)
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
          const duration = calculateMatchDurationInMinutes(match.debut_horaire, match.fin_horaire)

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
          const duration = calculateMatchDurationInMinutes(match.debut_horaire, match.fin_horaire)
          allMatches.push({
            ...match,
            phase: "demi",
            duration: duration  
          });
        });
      }
      
      // Finale
      if (elimination.finale) {
        const duration = calculateMatchDurationInMinutes(
          elimination.finale.debut_horaire, 
          elimination.finale.fin_horaire
        )
        allMatches.push({
          ...elimination.finale,
          phase: "finale", 
          duration: duration
        });
      }
    }
    return allMatches
  }

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
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('calendar')}
                  >
                    <Grid className="w-4 h-4 mr-1" />
                    Calendrier
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
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
