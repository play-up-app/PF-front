import { Calendar, Clock, MapPin, Users, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TournamentDetail } from '@/types/planning';

interface TournamentSelectorProps {
  tournaments: TournamentDetail[];
  selectedTournament: string;
  onTournamentChange: (value: string) => void;
}

const TournamentSelector = ({ tournaments, selectedTournament, onTournamentChange }: TournamentSelectorProps) => {
  const selectedTournamentData = tournaments.find(t => t.id === selectedTournament);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Configuration du planning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionner un tournoi
          </label>
          <Select value={selectedTournament} onValueChange={onTournamentChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choisissez un tournoi à planifier" />
            </SelectTrigger>
            <SelectContent>
              {tournaments.map((tournament) => (
                <SelectItem key={tournament.id} value={tournament.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{tournament.name}</span>
                    <span className={`ml-2 px-2 py-1 rounded-md text-xs ${
                      tournament.status === 'ready' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tournament.status === 'ready' ? 'Prêt' : 'Brouillon'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTournamentData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Informations du tournoi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{selectedTournamentData.registered_teams} équipes</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{selectedTournamentData.courts_available} terrains</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{selectedTournamentData.start_date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{selectedTournamentData.start_time}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TournamentSelector;
