"use client";

import { useEffect, useState } from 'react';
import { Plus, Search, Filter, X } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import TeamsList from '@/components/teams/TeamsList';
import TeamForm from '@/components/teams/TeamForm';
import { Team, TournamentDetail } from '@/types/planning';
import { teamsService, tournamentService, usersService } from '@/services/api';

const TeamsPage = () => {
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTournament, setSelectedTournament] = useState('all');
  const [teams, setTeams] = useState<Team[] | null>(null);
  const [tournaments, setTournaments] = useState<TournamentDetail[] | null>(null);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // 10 équipes par page

  const handleGetTournaments = async () => {
    setIsLoadingTournaments(true);
    try {
      const data = await tournamentService.getTournaments();
      setTournaments(data["tournaments"]);
    } catch (error) {
      console.error("Erreur lors du chargement des tournois:", error.message);
    } finally {
      setIsLoadingTournaments(false);
    }
  };

  const handleGetTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const data = await teamsService.getTeamsWithMembers();
      setTeams(data);
    } catch (error) {
      console.error("Erreur lors du chargement des équipes:", error.message);
    } finally {
      setIsLoadingTeams(false);
    }
  };
  // Préparer les options de tournois pour le dropdown
  const tournamentOptions = [
    { id: 'all', name: 'Tous les tournois' },
    ...(tournaments || [])
  ];

  // Filtrer les équipes en toute sécurité
  const filteredTeams = teams ? teams.filter(team => {
    const matchesSearch = (team.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (team.tournament?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    // Gestion robuste du filtrage par tournoi
    const teamTournamentId = team.tournamentId || (team as any).tournament_id;
    const matchesTournament = selectedTournament === 'all' || 
                             teamTournamentId === selectedTournament ||
                             String(teamTournamentId) === String(selectedTournament);
    
    return matchesSearch && matchesTournament;
  }) : [];

  // Pagination logic
  const totalPages = Math.ceil(filteredTeams.length / itemsPerPage);
  const paginatedTeams = filteredTeams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedTournament]);

  const handleAddTeam = async (teamData: any) => {
    setIsCreatingTeam(true);
    try {
      
      // 1. Vérifier que le tournoi est sélectionné
      if (!teamData.tournamentId) {
        console.error("Aucun tournoi sélectionné");
        return;
      }

      // 2. Récupérer le captain_id via l'email de contact
      let captainId = null;
      if (teamData.contactEmail) {
        try {
          const captain = await usersService.getUserByEmail(teamData.contactEmail);
          captainId = captain?.id || null;
        } catch (error) {
          console.warn('Impossible de récupérer le captain_id:', error.message);
        }
      }

      // 3. Récupérer les user_id des membres via leurs emails
      const membersWithIds = [];
      if (teamData.members && teamData.members.length > 0) {
        for (const member of teamData.members) {
          if (member.email) {
            try {
              const user = await usersService.getUserByEmail(member.email);
              if (user?.id) {
                membersWithIds.push({
                  user_id: user.id,
                  role: member.role || 'player',
                  position: member.position || '',
                  status: member.status || 'active'
                });
              }
            } catch (error) {
              console.log(`Impossible de récupérer l'user_id pour ${member.email}:`, error.message);
            }
          }
        }
      }

      // 4. Préparer les données de l'équipe (selon la documentation API)
      const teamPayload = {
        name: teamData.name,
        description: teamData.description || '',
        tournament_id: teamData.tournamentId,
        captain_id: captainId,
        contact_email: teamData.contactEmail,
        contact_phone: teamData.contactPhone || '',
        skill_level: teamData.skillLevel,
        notes: `Équipe créée avec ${membersWithIds.length} membre(s) ajouté(s)`
      };

      // 5. Créer l'équipe d'abord avec le bon endpoint
      const createdTeam = await teamsService.createTeam(teamData.tournamentId, teamPayload);

      // 6. Ajouter les membres à l'équipe avec leurs vrais user_id
      if (membersWithIds.length > 0 && createdTeam.id) {
        (`Ajout de ${membersWithIds.length} membres à l'équipe...`);
        await teamsService.addPlayersToTeam(createdTeam.id, membersWithIds);
        ('Membres ajoutés avec succès à l\'équipe');
      }

      // 7. Recharger la liste des équipes après création
      await handleGetTeams();
      setIsAddingTeam(false);
    } catch (error) {
      console.error("Erreur lors de la création de l'équipe:", error.message);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedTournament('all');
  };

  const hasActiveFilters = searchTerm || selectedTournament !== 'all';

  useEffect(() => {
    ("Chargement initial des données...");
    handleGetTournaments();
    handleGetTeams();
  }, [])

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Équipes</h1>
            <p className="text-gray-600 mt-1">
              Gérez les équipes de tous vos tournois
            </p>
          </div>
          <Button 
            onClick={() => setIsAddingTeam(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle équipe</span>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher une équipe ou un tournoi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedTournament}
                  onChange={(e) => setSelectedTournament(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isLoadingTournaments}
                >
                  {tournamentOptions.map(tournament => (
                    <option key={tournament.id} value={tournament.id}>
                      {tournament.name}
                    </option>
                  ))}
                </select>
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-800"
                >
                  <X className="w-4 h-4" />
                  <span>Réinitialiser</span>
                </Button>
              )}
            </div>
            {hasActiveFilters && (
              <div className="mt-3 text-sm text-gray-600">
                {filteredTeams.length === 0 ? (
                  <p className="text-orange-600">Aucune équipe ne correspond aux critères de recherche.</p>
                ) : (
                  <p>{filteredTeams.length} équipe(s) trouvée(s) sur {teams?.length || 0}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total équipes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {isLoadingTeams ? '...' : teams ? teams.length : 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Équipes affichées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {isLoadingTeams ? '...' : filteredTeams.length}
              </div>
              {searchTerm || selectedTournament !== 'all' ? (
                <p className="text-xs text-gray-500 mt-1">Filtré(es)</p>
              ) : null}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Équipes confirmées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {isLoadingTeams ? '...' : filteredTeams ? filteredTeams.filter(t => t.status === 'confirmed').length : 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total joueurs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {isLoadingTeams ? '...' : filteredTeams ? filteredTeams.reduce((acc, team) => acc + (team.members?.length || 0), 0) : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams List */}
        <TeamsList 
          teams={paginatedTeams}
          onEditTeam={(team) => {
            console.log("Edit team:", team);
            // teamsService.updateTeam(team.id, team);
          }}
          onDeleteTeam={(teamId) => {
            console.log("Delete team:", teamId);
            teamsService.deleteTeam(teamId);
          }}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Add Team Modal */}
        {isAddingTeam && (
          <TeamForm
            tournaments={tournaments || []}
            onSubmit={handleAddTeam}
            onCancel={() => setIsAddingTeam(false)}
            isLoading={isCreatingTeam}
          />
        )}
      </div>
    </Layout>
  );
};

export default TeamsPage;
