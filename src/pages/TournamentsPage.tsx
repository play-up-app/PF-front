import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import TournamentCard from '@/components/tournaments/TournamentCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { tournamentService } from '@/services/api';

export interface TournamentDetail {
    id: string, 
    name: string,
    description: string, 
    courts_available: string, 
    match_duration_minutes: number, 
    break_duration_minutes: number,
    constraints: object,
    organizer_id: string,
    status: 'draft' | 'ready' | 'in_progress' | 'completed' | 'cancelled',
    created_at: string,
    updated_at: string,
    start_date: string, 
    start_time: string, 
    max_teams: number,
    registered_teams: number,
    tournament_type: 'poules_elimination' | 'round_robin' | 'elimination_directe' | 'double_elimination'
}


const TournamentsPage = () => {
  const url = `${import.meta.env.VITE_BDD_SERVICE_URL}/tournaments`
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [tournaments, setTournaments] = useState<TournamentDetail[]>([])
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    const matchesType = typeFilter === 'all' || tournament.tournament_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTournaments.length / itemsPerPage);
  const paginatedTournaments = filteredTournaments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  const getTournamentStats = () => {
    const stats = {
      total: tournaments.length,
      active: tournaments.filter(t => t.status === 'in_progress').length,
      ready: tournaments.filter(t => t.status === 'ready').length,
      draft: tournaments.filter(t => t.status === 'draft').length,
      completed: tournaments.filter(t => t.status === 'completed').length,
    };
    return stats;
  };

  const getTournaments = async () => {
    try {
      const response = await tournamentService.getTournaments();
      console.log("response", response["tournaments"]);
      setTournaments(response["tournaments"]);
      // const response = await fetch(url, {
      //   method: "GET",
      //   headers: {
      //     "accept": "application/json",
      //     "Content-Type": "application/json"
      //   }
      // });
      // const responseJson = await response.json()
      // setTournaments(responseJson["data"])
    } catch (error) {
        console.error(error.message);
    }
  }

  const handleStatusChange = (tournamentId: string, newStatus: string) => {
    setTournaments(prevTournaments => 
      prevTournaments.map(tournament => 
        tournament.id === tournamentId 
          ? { ...tournament, status: newStatus as TournamentDetail['status'] }
          : tournament
      )
    );
  };

  const stats = getTournamentStats();
  
  useEffect(() => {
    getTournaments()
  }, [])
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tournois
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez tous vos tournois de volley-ball
            </p>
          </div>
          
          <Link to="/tournaments/new">
            <Button className="space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nouveau tournoi</span>
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-600">En cours</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.ready}</div>
            <div className="text-sm text-gray-600">Prêts</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.draft}</div>
            <div className="text-sm text-gray-600">Brouillons</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Terminés</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Rechercher un tournoi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="ready">Prêt</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="elimination_directe">Élimination directe</SelectItem>
                  <SelectItem value="poules_elimination">Poules + Élimination</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tournament Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTournaments.map((tournament, index) => (
            <div
              key={tournament.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TournamentCard 
                tournament={tournament} 
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </div>

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

        {/* Empty State */}
        {paginatedTournaments.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun tournoi trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos critères de recherche ou créez un nouveau tournoi.
            </p>
            <Link to="/tournaments/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer un tournoi
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TournamentsPage;
