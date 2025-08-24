
import { Match } from '@/types/planning';

interface TableViewProps {
  matches: Match[];
}

const TableView = ({ matches }: TableViewProps) => {
  const formatTimeFromISO = (isoString: string): string => {
    const date = new Date(isoString);

    // Extraire les heures et minutes
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Heure</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Terrain</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Match</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Phase</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Durée</th>
          </tr>
        </thead>
        <tbody>
          {matches.map((match, index) => (
            <tr 
              key={`match-${index}-${match.debut_horaire || 'no-time'}-${match.terrain || 'no-court'}-${match.equipe_a || 'team-a'}-${match.equipe_b || 'team-b'}`} 
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <td className="py-3 px-4 font-medium text-gray-900">{formatTimeFromISO(match.debut_horaire)}</td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm">
                  Terrain {match.terrain}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="font-medium text-gray-900">
                  {match.equipe_a} <span className="text-gray-500">vs</span> {match.equipe_b}
                </div>
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-gray-800 text-sm">
                  {match.phase}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-600">{match.duration} min</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
