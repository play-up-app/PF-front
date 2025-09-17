import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import MatchCard from "./MatchCard";
import { Match } from "@/types/planning";
import { matchService } from "@/services/api";
import { TabsContent } from "@/components/ui/tabs";

const stats = {
    total: 10,
    in_progress: 5,
    ready: 3,
    completed: 2
}

interface LiveMatchDashboardProps {
    tournamentId: string;
}
const LiveMatchDashboard = ({tournamentId}: LiveMatchDashboardProps) => {
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'in_progress' | 'ready' | 'completed'>('all');
    const [phase, setPhase] = useState<'all' | 'poules' | 'quart' | 'demi' | 'finale'>('all');
    const [matchs, setMatchs] = useState<Match[]>([]);

    const handleStatusChange = (matchId: string, newStatus: string) => {
        setMatchs(prevMatchs => 
          prevMatchs.map(match => 
            match.id === matchId 
              ? { ...match, status: newStatus as Match['status'] }
              : match
          )
        );
      };
    useEffect(() => {
        const fetchMatchs = async () => {
            const matchs = await matchService.getMatchsByTournamentId(tournamentId);
            setMatchs(matchs);
            setLoading(false);
        }
        fetchMatchs();
    }, []);
    return (
        <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <div className="text-sm text-muted-foreground">Total</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-tournament-error">{stats.in_progress}</div>
                        <div className="text-sm text-muted-foreground">En cours</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-tournament-warning">{stats.ready}</div>
                        <div className="text-sm text-muted-foreground">Prêts</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-tournament-success">{stats.completed}</div>
                        <div className="text-sm text-muted-foreground">Terminés</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtres */}
            <Card>
                <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm font-medium">Filtres:</span>
                    </div>
                    {/* Statut du match */}
                    <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="ready">Prêts</SelectItem>
                            <SelectItem value="in_progress">En cours</SelectItem>
                            <SelectItem value="completed">Terminés</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* Phase du match */}
                    <Select value={phase} onValueChange={(value: any) => setPhase(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Phase" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les phases</SelectItem>
                            <SelectItem value="poules">Poules</SelectItem>
                            <SelectItem value="quart">Quarts</SelectItem>
                            <SelectItem value="demi">Demi-finales</SelectItem>
                            <SelectItem value="finale">Finale</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                </CardContent>
            </Card>

            <TabsContent value="matches" className="space-y-4">
                { loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-muted-foreground">Chargement des matches...</p>
                    </div> ) : (            
                    <div className={`grid gap-4 ${
                        matchs.length > 0 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 
                        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    }`}>
                        { matchs.map((match) => {
                            return (
                                <MatchCard key={match.id} match={match} onStatusChange={handleStatusChange} />
                            )
                        })}
                    </div>)
            }

            </TabsContent>
        </>
    )
}

export default LiveMatchDashboard;