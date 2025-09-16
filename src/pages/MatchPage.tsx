import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MatchScoreEntry } from '@/components/matches/MatchScoreEntry';
import { MatchStatusManager } from '@/components/matches/MatchStatusManager';
// import { MatchResultValidator } from '@/components/matches/MatchResultValidator';
import { Match } from '@/types/planning';
import { ArrowLeft, Trophy, Users, Clock } from 'lucide-react';
import { matchService } from '@/services/api';
import { useNavigate } from 'react-router-dom';

const MatchesPage = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const fetchMatch = async () => {
    const match = await matchService.getMatchById(matchId);
    setSelectedMatch(match);
  }

  useEffect(() => {
    fetchMatch();
  }, [matchId]);

  useEffect(() => {
    if (selectedMatch) {
      // Déterminer l'onglet approprié selon le statut du match
      if (selectedMatch.status === 'in_progress') {
        setActiveTab('score');
      } else if (selectedMatch.status === 'completed') {
        setActiveTab('validation');
      } else {
        setActiveTab('status');
      }
    }
  }, [selectedMatch]);
  
  const handleMatchSelect = (match: Match) => {
    setSelectedMatch(match);
  };
  
  const handleMatchUpdate = (updatedMatch: Match) => {
    setSelectedMatch(updatedMatch);
  };
  
  const handleStatusChange = (matchId: string, newStatus: Match['status']) => {
    if (selectedMatch && selectedMatch.id === matchId) {
      setSelectedMatch({
        ...selectedMatch,
        status: newStatus
      });
    }
  };
  
  if (!matchId) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Match introuvable</h2>
          <p className="text-muted-foreground">Impossible de charger le match.</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Matches</h1>
            <p className="text-muted-foreground">
              {selectedMatch 
                ? `${selectedMatch.metadata.original_team_names.team_a} vs ${selectedMatch.metadata.original_team_names.team_b} - Court ${selectedMatch.court_number}`
                : 'Dashboard en temps réel des matches'
              }
            </p>
          </div>
          
          {selectedMatch && (
            <Button
              onClick={() => navigate(`/tournaments/${selectedMatch.tournament_id}/`)}
              variant="outline"
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </Button>
          )}
        </div>

        {selectedMatch && (
          // Gestion de match spécifique
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status" className="gap-2">
                <Clock className="h-4 w-4" />
                Statut
              </TabsTrigger>
              <TabsTrigger 
                value="score" 
                className="gap-2"
                disabled={selectedMatch.status !== 'in_progress' && selectedMatch.status !== 'ready'}
              >
                <Trophy className="h-4 w-4" />
                Score
              </TabsTrigger>
              <TabsTrigger 
                value="validation" 
                className="gap-2"
                disabled={selectedMatch.status !== 'completed'}
              >
                <Trophy className="h-4 w-4" />
                Validation
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="status" className="space-y-0">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <MatchStatusManager
                    match={selectedMatch}
                    onStatusChange={handleStatusChange}
                  />
                </div>
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions rapides</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        onClick={() => setActiveTab('score')}
                        className="w-full"
                        disabled={selectedMatch.status !== 'in_progress' && selectedMatch.status !== 'ready'}
                      >
                        Gérer le score
                      </Button>
                      <Button
                        onClick={() => setActiveTab('validation')}
                        className="w-full"
                        disabled={selectedMatch.status !== 'completed'}
                        variant="outline"
                      >
                        Valider le résultat
                      </Button>
                      <Button
                        onClick={() => navigate(`/tournaments/${selectedMatch.tournament_id}/`)}
                        className="w-full"
                        variant="secondary"
                      >
                        Retour au dashboard
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="score" className="space-y-0">
              <MatchScoreEntry
                match={selectedMatch}
                onMatchUpdate={handleMatchUpdate}
              />
            </TabsContent>
            {/*
            <TabsContent value="validation" className="space-y-0">
              <MatchResultValidator
                match={selectedMatch}
                onValidate={(matchId, validationData) => {
                  console.log('Match validated:', matchId, validationData);
                }}
                onCorrection={(matchId, corrections) => {
                  console.log('Match corrected:', matchId, corrections);
                }}
              />
            </TabsContent> */}
          </Tabs>
        )}
      </div>
    </Layout>
  );
};

export default MatchesPage;