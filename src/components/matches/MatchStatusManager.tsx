import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Match } from '@/types/planning';
import { Clock, AlertTriangle, CheckCircle, XCircle, Play } from 'lucide-react';
import { matchService } from '@/services/api';

interface MatchStatusManagerProps {
  match: Match;
  onStatusChange?: (matchId: string, newStatus: Match['status']) => void;
}

const statusConfig = {
  'scheduled': {
    label: 'Programmé',
    icon: Clock,
    color: 'bg-secondary text-secondary-foreground',
    nextStates: ['ready', 'cancelled'],
  },
  'ready': {
    label: 'Prêt',
    icon: CheckCircle,
    color: 'bg-tournament-warning text-white',
    nextStates: ['in_progress', 'cancelled'],
  },
  'in_progress': {
    label: 'En cours',
    icon: Play,
    color: 'bg-tournament-error text-white',
    nextStates: ['completed', 'cancelled'],
  },
  'completed': {
    label: 'Terminé',
    icon: CheckCircle,
    color: 'bg-tournament-success text-white',
    nextStates: [],
  },
  'cancelled': {
    label: 'Annulé',
    icon: XCircle,
    color: 'bg-destructive text-destructive-foreground',
    nextStates: ['scheduled'],
  },
};

export const MatchStatusManager = ({ match, onStatusChange }: MatchStatusManagerProps) => {
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<Match['status']>(match.status);
  const [isChanging, setIsChanging] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  
  const currentConfig = statusConfig[match.status];
  const Icon = currentConfig.icon;
  
  const handleStatusChange = async () => {
    if (selectedStatus === match.status) return;
    
    setIsChanging(true);
    const response = await matchService.updateMatchStatus(match.id, selectedStatus);
    console.log("response", response);
    if (!response.success) {
        toast({
            title: "Erreur",
            description: response.message,
            variant: "destructive",
        });
    }
    setIsChanging(false);
    onStatusChange?.(match.id, selectedStatus);
      
    toast({
    title: "Statut mis à jour",
    description: `Le match est maintenant "${statusConfig[selectedStatus].label}"`,
    });
      
    setConfirmDialog(false);

  };
  
  const getStatusHistory = () => {
    // Cette fonction pourrait récupérer l'historique depuis l'API
    return [
      { status: 'scheduled', timestamp: match.schedule_time, reason: 'Match programmé' },
      ...(match.actual_start_time ? [{ 
        status: 'in_progress' as const, 
        timestamp: match.actual_start_time, 
        reason: 'Match démarré' 
      }] : []),
      ...(match.actual_end_time ? [{ 
        status: 'completed' as const, 
        timestamp: match.actual_end_time, 
        reason: 'Match terminé' 
      }] : []),
    ];
  };
  
  const canChangeStatus = currentConfig.nextStates.length > 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          Gestion du statut
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statut actuel */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Statut actuel</Label>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={currentConfig.color}>
                {currentConfig.label}
              </Badge>
              {match.status === 'in_progress' && (
                <span className="text-sm text-muted-foreground">
                  Démarré à {new Date(match.actual_start_time!).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Informations du match */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label>Terrain</Label>
            <div className="font-medium">{match.court_number}</div>
          </div>
          <div>
            <Label>Heure prévue</Label>
            <div className="font-medium">
              {new Date(match.schedule_time).toLocaleTimeString()}
            </div>
          </div>
          <div>
            <Label>Phase</Label>
            <div className="font-medium">{match.phase}</div>
          </div>
          <div>
            <Label>Tour</Label>
            <div className="font-medium">{match.round_number}</div>
          </div>
        </div>
        
        {/* Équipes */}
        <div className="space-y-2">
          <Label>Équipes</Label>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="font-medium">{match.metadata.original_team_names.team_a}</span>
              <span className="text-2xl font-bold">{match.team_a_score}</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="font-medium">{match.metadata.original_team_names.team_b}</span>
              <span className="text-2xl font-bold">{match.team_b_score}</span>
            </div>
          </div>
        </div>
        
        {/* Changement de statut */}
        {canChangeStatus && (
          <div className="space-y-3 pt-4 border-t">
            <Label>Changer le statut</Label>
            
            <Select value={selectedStatus} onValueChange={(value: Match['status']) => setSelectedStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={match.status} disabled>
                  {currentConfig.label} (actuel)
                </SelectItem>
                {currentConfig.nextStates.map((status) => (
                  <SelectItem key={status} value={status}>
                    {statusConfig[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full"
                  disabled={selectedStatus === match.status}
                  variant={selectedStatus === 'cancelled' ? 'destructive' : 'default'}
                >
                  {selectedStatus === 'cancelled' && <AlertTriangle className="h-4 w-4 mr-2" />}
                  Changer vers "{selectedStatus && statusConfig[selectedStatus].label}"
                </Button>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirmer le changement de statut</DialogTitle>
                  <DialogDescription>
                    Vous êtes sur le point de changer le statut du match de 
                    "{currentConfig.label}" vers "{selectedStatus && statusConfig[selectedStatus].label}".
                    {selectedStatus === 'cancelled' && (
                      <span className="block mt-2 text-destructive font-medium">
                        ⚠️ Cette action annulera le match.
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label>Match</Label>
                      <div>{match.metadata.original_team_names.team_a} vs {match.metadata.original_team_names.team_b}</div>
                    </div>
                    <div>
                      <Label>Terrain</Label>
                      <div>Terrain {match.court_number}</div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDialog(false)}
                    disabled={isChanging}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleStatusChange}
                    disabled={isChanging}
                    variant={selectedStatus === 'cancelled' ? 'destructive' : 'default'}
                  >
                    {isChanging ? 'Changement...' : 'Confirmer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
        
        {/* Historique */}
        <div className="space-y-3 pt-4 border-t">
          <Label>Historique</Label>
          <div className="space-y-2">
            {getStatusHistory().map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {statusConfig[entry.status].label}
                  </Badge>
                  <span className="text-muted-foreground">{entry.reason}</span>
                </div>
                <span className="text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};