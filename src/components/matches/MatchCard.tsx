import { Match } from '@/types/planning';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import MatchStatusChanger from './MatchStatusChanger';
import { useNavigate } from 'react-router-dom';

const MatchCard = ({match, onStatusChange} : {
    match : Match, 
    onStatusChange : (matchId: string, newStatus: string) => void}) => {
    const navigate = useNavigate();
    const getStatusColor = (status: Match['status']) => {
        const colors = {
          'scheduled': 'bg-muted text-muted-foreground',
          'ready': 'bg-tournament-warning text-white',
          'in_progress': 'bg-tournament-error text-white',
          'completed': 'bg-tournament-success text-white',
          'cancelled': 'bg-destructive text-destructive-foreground',
        };
        return colors[status] || colors.scheduled;
    };

    const getStatusLabel = (status: Match['status']) => {
        const labels = {
          'scheduled': 'Programmé',
          'ready': 'Prêt',
          'in_progress': 'En cours',
          'completed': 'Terminé',
          'cancelled': 'Annulé',
        };
        return labels[status] || status;
    };

    const formatTime = (timeString: string) => {
        return new Date(timeString).toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit'
        });
    };
    
    const onMatchSelect = (match: Match) => {
        navigate(`/tournaments/${match.tournament_id}/match/${match.id}`);
    }
    return (
        <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${match.status === 'in_progress' ? 'ring-2 ring-tournament-error' : ''}`}
            onClick={() => onMatchSelect?.(match)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Terrain {match.court_number}</span>
                        <Badge className={getStatusColor(match.status)}>
                            {getStatusLabel(match.status)}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatTime(match.schedule_time)}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                        {match.phase.charAt(0).toUpperCase() + match.phase.slice(1)}
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                        <div className="text-center">
                        <div className="font-semibold text-sm ">{match.metadata.original_team_names.team_a}</div>
                        <div className="text-2xl font-bold text-primary">{match.team_a_score}</div>
                        </div>
                        
                        <div className="text-center">
                        {match.status === 'in_progress' && (
                            <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Set {match.current_set}</div>
                            <div className="text-lg font-mono">
                                {match.current_set_score.team_a} - {match.current_set_score.team_b}
                            </div>
                            </div>
                        )}
                        {match.status === 'completed' && match.winner_team_id && (
                            <div className="text-xs text-tournament-success font-medium">
                            Victoire {match.winner_team_id === match.team_a_id ? match.metadata.original_team_names.team_a : match.metadata.original_team_names.team_b}
                            </div>
                        )}
                        </div>
                        
                        <div className="text-center">
                        <div className="font-semibold text-sm ">{match.metadata.original_team_names.team_b}</div>
                        <div className="text-2xl font-bold text-primary">{match.team_b_score}</div>
                        </div>
                    </div>
                    {match.sets_data.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                            <div>Sets joués:</div>
                            <div className="flex gap-2">
                                {match.sets_data.map((set) => (
                                <span key={set.set_number} className="font-mono">
                                    {set.team_a}-{set.team_b}
                                </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Changer le statut:</span>
                <MatchStatusChanger match={match} onStatusChange={onStatusChange} />
            </CardFooter>
        </Card>
    )
}

export default MatchCard;