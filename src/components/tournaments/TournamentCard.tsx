
import { Link } from 'react-router-dom';
import { Calendar, Users, MapPin, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TournamentDetail } from '@/types/planning';
import TournamentStatusChanger from './TournamentStatusChanger';

interface TournamentCardProps {
  tournament: TournamentDetail;
  onStatusChange: (tournamentId: string, newStatus: string) => void;
}

const TournamentCard = ({ tournament, onStatusChange }: TournamentCardProps) => {
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

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md hover:border-primary/20 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link 
            to={`/tournaments/${tournament.id}`}
            className="block"
          >
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
              {tournament.name}
            </h3>
          </Link>
          <Badge className={`mt-2 ${getStatusColor(tournament.status)}`}>
            {getStatusLabel(tournament.status)}
          </Badge>
        </div>
        
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {new Date(tournament.start_date).toLocaleDateString('fr-FR')} à {new Date(tournament.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          <span>
            {tournament.registered_teams}/{tournament.max_teams} équipes
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="capitalize">
            {tournament.tournament_type.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(tournament.registered_teams / tournament.max_teams) * 100}%`
              }}
            />
          </div>
          <span className="text-xs text-gray-500 ml-3">
            {Math.round((tournament.registered_teams / tournament.max_teams) * 100)}%
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Changer le statut:</span>
          <TournamentStatusChanger 
            tournament={tournament} 
            onStatusChange={onStatusChange}
          />
        </div>
      </div>
    </div>
  );
};

export default TournamentCard;
