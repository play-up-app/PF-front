
import { MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Match } from '@/types/planning';

interface CalendarViewProps {
  matches: Match[];
}

const CalendarView = ({ matches }: CalendarViewProps) => {
  // Fonction utilitaire pour convertir les dates ISO en format heure
  const formatTimeFromISO = (isoString: string): string => {
    const date = new Date(isoString);

    // Extraire les heures et minutes
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };

  const getTimeSlots = () => {
    const times = [...new Set(matches.map(match => formatTimeFromISO(match.debut_horaire)
    ))];
    return times.sort();
  };

  const getCourts = () => {
    const courts = [...new Set(matches.map(match => match.terrain))];
    return courts.sort((a, b) => a - b);
  };

  const getMatchForTimeAndCourt = (time: string, court: number) => {
    return matches.find((match) => {
      const formatTimeDebutHoraire = formatTimeFromISO(match.debut_horaire)
      return formatTimeDebutHoraire === time && match.terrain === court
    });
  };

  const timeSlots = getTimeSlots();
  const courts = getCourts();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        {/* Header with courts */}
        <div className={`grid gap-2 mb-4`} style={{ gridTemplateColumns: `100px repeat(${courts.length}, 1fr)` }}>
          <div className="bg-gray-100 p-3 rounded-lg font-medium text-center">
            Horaires
          </div>
          {courts.map(court => (
            <div key={court} className="bg-blue-100 p-3 rounded-lg font-medium text-center">
              <MapPin className="w-4 h-4 inline mr-1" />
              Terrain {court}
            </div>
          ))}
        </div>

        {/* Time slots and matches */}
        <div className="space-y-2">
          {timeSlots.map(time => (
            <div key={time} className={`grid gap-2`} style={{ gridTemplateColumns: `100px repeat(${courts.length}, 1fr)` }}>
              {/* Time column */}
              <div className="bg-gray-50 p-3 rounded-lg font-medium text-center flex items-center justify-center">
                <Clock className="w-4 h-4 mr-1" />
                {time}
              </div>
              
              {/* Match cards for each court */}
              {courts.map(court => {
                const match = getMatchForTimeAndCourt(time, court);
                return (
                  <div key={`${time}-${court}`} className="min-h-[80px]">
                    {match ? (
                      <Card className="h-full hover:shadow-md transition-shadow border-l-4 border-l-primary">
                        <CardContent className="p-3">
                          <div className="space-y-1">
                            <div className="font-medium text-sm text-gray-900">
                              {match.equipe_a} <span className="text-gray-500 text-xs">vs</span> {match.equipe_b}
                            </div>
                            <div className="text-xs text-gray-600">
                              {match.phase}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {match.duration} min
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="h-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Libre</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
