import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Users, Clock, MapPin, Trophy, Grid, List, RefreshCw, Upload, Trash2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmailComposer from '@/components/tournaments/EmailComposer';
import CalendarView from '@/components/planning/CalendarView';
import TableView from '@/components/planning/TableView';
import { TournamentDetail } from '@/pages/TournamentsPage';
import { Match, AIPlanning, Team } from '@/types/planning';
import { tournamentService, planningService, teamsService } from '@/services/api';
import LiveMatchDashboard from '@/components/matches/LiveMatchDashboard';

const TournamentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [tournament, setTournament] = useState<TournamentDetail | null>(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [generatedPlanning, setGeneratedPlanning] = useState<AIPlanning | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar');
  const [loading, setLoading] = useState(true);
  const [loadingPlanning, setLoadingPlanning] = useState(false);
  const [loadingTeamsWithMembers, setLoadingTeamsWithMembers] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [importingExcel, setImportingExcel] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [deletingAllTeams, setDeletingAllTeams] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Fonction utilitaire pour calculer la durée d'un match en minutes
  const calculateMatchDurationInMinutes = (startISO: string, endISO: string): number => {
    const startDate = new Date(startISO);
    const endDate = new Date(endISO);
    
    // Calculer la différence en millisecondes puis convertir en minutes
    const diffInMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffInMs / (1000 * 60));
  };

  // Fonction pour extraire tous les matchs du planning
  const getAllMatches = (planning: AIPlanning, tournamentData: TournamentDetail | null): Match[] => {
    const allMatches: Match[] = [];
    const matchDuration = tournamentData?.match_duration_minutes || 0;
    
    // Extraire les matchs des poules
    if (planning.poules && Array.isArray(planning.poules)) {
      planning.poules.forEach((poule) => {
        if (poule.matchs && Array.isArray(poule.matchs)) {
          poule.matchs.forEach((match) => {
            allMatches.push({
              ...match,
              phase: "poules",
              duration: matchDuration
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
            duration: matchDuration
          });
        });
      }
      
      // Demi-finales
      if (elimination.demi_finales && Array.isArray(elimination.demi_finales)) {
        elimination.demi_finales.forEach((match) => {
          allMatches.push({
            ...match,
            phase: "demi",
            duration: matchDuration
          });
        });
      }
      
      // Finale
      if (elimination.finale) {
        allMatches.push({
          ...elimination.finale,
          phase: "finale", 
          duration: matchDuration
        });
      }
    }
    return allMatches;
  };

  // Fonction pour charger le planning du tournoi
  const loadPlanningForTournament = async (tournamentId: string, tournamentData?: TournamentDetail | null) => {
    if (!tournamentId) return;
    
    setLoadingPlanning(true);
    try {
      const response = await planningService.getPlanningByTournament(tournamentId);
      console.log(response);

      if (response.success) {
        const planningData = response.data;
        if (planningData) {
          const planningObj = planningData.planning_data;
          planningObj.total_matches = planningData.total_matches;
          
          setGeneratedPlanning(planningObj);
          const extractedMatches = getAllMatches(planningObj, tournamentData || tournament);
          setMatches(extractedMatches);
        } else {
          setGeneratedPlanning(null);
          setMatches([]);
        }
      } else {
        setGeneratedPlanning(null);
        setMatches([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du planning:", error);
      setGeneratedPlanning(null);
      setMatches([]);
    } finally {
      setLoadingPlanning(false);
    }
  };

  const fetchTournament = async (id: string) => {
    try {
      const response = await tournamentService.getTournamentById(id);
      setTournament(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching tournament:', error);
      return null;
    } finally {
      console.log("fetch tournament finally")
      setLoading(false);
    }
  };

  const fetchTeams = async (tournamentId: string) => {
    try {
      const response = await tournamentService.getTeamsByTournament(tournamentId);
      if (response["success"]) {
        setTeams(response["data"]);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  // Fonction pour gérer l'import Excel
  const handleImportExcel = async () => {
    if (!fileInputRef.current?.files?.[0]) {
      setImportMessage("Veuillez sélectionner un fichier Excel");
      // Supprimer le message après 2 secondes
      setTimeout(() => setImportMessage(null), 2000);
      return;
    }

    const file = fileInputRef.current.files[0];
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      setImportMessage("Veuillez sélectionner un fichier Excel (.xlsx ou .xls)");
      // Supprimer le message après 2 secondes
      setTimeout(() => setImportMessage(null), 2000);
      return;
    }

    setImportingExcel(true);
    setImportMessage(null);

    try {
      const result = await teamsService.importTeamsFromExcel(id!, file);
      setImportMessage(`Import réussi : ${result}`);
      
      // Recharger les équipes après l'import
      await fetchTeams(id!);
      
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Supprimer le message de succès après 2 secondes
      setTimeout(() => setImportMessage(null), 2000);
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      setImportMessage(`Erreur lors de l'import : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      // Supprimer le message d'erreur après 2 secondes
      setTimeout(() => setImportMessage(null), 2000);
    } finally {
      setImportingExcel(false);
    }
  };

  // Fonction pour déclencher la sélection de fichier
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Fonction pour supprimer toutes les équipes
  const handleDeleteAllTeams = async () => {
    if (!id) return;

    // Confirmation avant suppression
    const confirmed = window.confirm(
      `Êtes-vous sûr de vouloir supprimer toutes les équipes du tournoi "${tournament?.name}" ?\n\nCette action est irréversible et supprimera également tous les membres des équipes.`
    );

    if (!confirmed) return;

    setDeletingAllTeams(true);
    setDeleteMessage(null);

    try {
      const result = await teamsService.deleteAllTeamsFromTournament(id);
      
      if (result.success) {
        setDeleteMessage(`Suppression réussie : ${result.message}`);
        // Recharger les équipes après suppression
        await fetchTeams(id);
        // Supprimer le message après 3 secondes
        setTimeout(() => setDeleteMessage(null), 3000);
      } else {
        setDeleteMessage(`Erreur lors de la suppression : ${result.message}`);
        // Supprimer le message après 3 secondes
        setTimeout(() => setDeleteMessage(null), 3000);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les équipes:', error);
      setDeleteMessage(`Erreur lors de la suppression : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      // Supprimer le message après 3 secondes
      setTimeout(() => setDeleteMessage(null), 3000);
    } finally {
      setDeletingAllTeams(false);
    }
  };

  useEffect(() => {
    if (id) {
      const loadData = async () => {
        const tournamentData = await fetchTournament(id);
        await fetchTeams(id);
        // Charger le planning après que le tournoi soit chargé
        await loadPlanningForTournament(id, tournamentData);
      };
      loadData();
    }
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'ready': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon';
      case 'ready': return 'Prêt';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getSkillLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner': return 'Débutant';
      case 'intermediate': return 'Intermédiaire';
      case 'advanced': return 'Avancé';
      default: return level;
    }
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du tournoi...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!tournament) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tournoi introuvable</h2>
          <p className="text-gray-600 mb-6">Le tournoi demandé n'existe pas ou a été supprimé.</p>
          <Link to="/tournaments">
            <Button>Retour aux tournois</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/tournaments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
            <p className="text-gray-600 mt-1">{tournament.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <EmailComposer tournament={tournament} teams={teams} />
            <Badge className={getStatusColor(tournament.status)}>
              {getStatusLabel(tournament.status)}
            </Badge>
          </div>
        </div>

        {/* Tournament Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Date de début</p>
                  <p className="font-medium">
                    {tournament.start_date ? 
                      new Date(tournament.start_date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) : '-'
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {tournament.start_time? new Date(tournament.start_time).toISOString().slice(11, 16) : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Équipes</p>
                  <p className="font-medium">
                    {tournament.registered_teams || 0}/{tournament.max_teams || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Terrains</p>
                  <p className="font-medium">{tournament.courts_available || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-gray-600">Durée match</p>
                  <p className="font-medium">{tournament.match_duration_minutes || 0} min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="planning" className="space-y-6">
          <TabsList>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="teams">Équipes</TabsTrigger>
            <TabsTrigger value="matches">Matchs</TabsTrigger>
          </TabsList>

          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Planning du tournoi
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {matches.length} matchs programmés
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadPlanningForTournament(id!)}
                      disabled={loadingPlanning}
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${loadingPlanning ? 'animate-spin' : ''}`} />
                      Actualiser
                    </Button>
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
                {loadingPlanning ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Chargement du planning...</p>
                    </div>
                  </div>
                ) : matches.length > 0 ? (
                  viewMode === 'calendar' ? (
                    <CalendarView matches={matches} />
                  ) : (
                    <TableView matches={matches} />
                  )
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun planning généré pour ce tournoi</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Rendez-vous sur la page Planning pour générer automatiquement le planning
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <div className= "flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Équipes participantes
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {teams.length} équipes inscrites
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFileSelect}
                      disabled={importingExcel || deletingAllTeams}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Importer Excel
                    </Button>
                    {teams.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteAllTeams}
                        disabled={deletingAllTeams || importingExcel}
                      >
                        <Trash2 className={`w-4 h-4 mr-1 ${deletingAllTeams ? 'animate-pulse' : ''}`} />
                        Supprimer toutes
                      </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => tournamentService.updateRegisteredTeamsCount(id!)}
                        disabled={loadingTeamsWithMembers || deletingAllTeams}
                      >
                        <RefreshCw className={`w-4 h-4 mr-1 ${loadingTeamsWithMembers ? 'animate-spin' : ''}`} />
                        Actualiser
                      </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Input file caché pour l'import Excel */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={handleImportExcel}
                />
                
                {/* Messages d'import */}
                {importMessage && (
                  <div className={`mb-4 p-3 rounded-md text-sm ${
                    importMessage.includes('réussi') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {importMessage}
                  </div>
                )}

                {/* Messages de suppression */}
                {deleteMessage && (
                  <div className={`mb-4 p-3 rounded-md text-sm ${
                    deleteMessage.includes('réussi') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {deleteMessage}
                  </div>
                )}

                {/* Indicateur de chargement pour l'import */}
                {importingExcel && (
                  <div className="mb-4 p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Import en cours...
                  </div>
                )}

                {/* Indicateur de chargement pour la suppression */}
                {deletingAllTeams && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Suppression en cours...
                  </div>
                )}

                {teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teams.map((team) => (
                      <Card key={team.id} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{team.name}</CardTitle>
                            <div className="flex gap-2">
                              <Badge className={getSkillLevelColor(team.skill_level || 'intermediate')}>
                                {getSkillLevelLabel(team.skill_level || 'intermediate')}
                              </Badge>
                              <Badge variant={team.status === 'confirmed' ? 'default' : 'secondary'}>
                                {team.status === 'confirmed' ? 'Confirmée' : 'Inscrite'}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{team.contact_email}</p>
                        </CardHeader>
                        <CardContent>
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Membres ({team.members?.length || 0})
                            </p>
                            <div className="space-y-1">
                              {team.members?.map((member, index) => (
                                <div key={index} className="flex items-center justify-between text-sm">
                                  <span>{member.email}</span>
                                  <div className="flex gap-2">
                                    <span className="text-gray-500">{member.role}</span>
                                    <span className="text-gray-400">{member.position}</span>
                                  </div>
                                </div>
                              )) || (
                                <p className="text-sm text-gray-500">Aucun membre enregistré</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Aucune équipe inscrite</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Les équipes apparaîtront ici une fois inscrites au tournoi
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <LiveMatchDashboard tournamentId={id!} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TournamentDetailPage;
