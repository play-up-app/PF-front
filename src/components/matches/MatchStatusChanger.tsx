
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Match } from '@/types/planning';
import { matchService } from '@/services/api';


const MatchStatusChanger = ({match, onStatusChange}: {match: Match, onStatusChange: (matchId: string, newStatus: string) => void}) => {
  const [selectedStatus, setSelectedStatus] = useState(match.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'scheduled', label: 'Programmé' },
    { value: 'ready', label: 'Prêt' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminé' },
    { value: 'cancelled', label: 'Annulé' }
  ];

  const handleStatusUpdate = async () => {
    if (selectedStatus === match.status) return;

    setIsUpdating(true);
    try {
      const response = await matchService.updateMatchStatus(match.id, selectedStatus);
      console.log("response", response);
      if (!response.success) {
        toast({
          title: "Erreur",
          description: response.message,
          variant: "destructive",
        });
      }
      onStatusChange(match.id, selectedStatus);
      toast({
        title: "Statut mis à jour",
        description: `Le statut du match a été changé vers "${statusOptions.find(opt => opt.value === selectedStatus)?.label}".`,
      });
    } catch (error) {
      console.error('Error updating tournament status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du tournoi.",
        variant: "destructive",
      });
      setSelectedStatus(match.status); // Reset to original status
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as "scheduled" | "ready" | "in_progress" | "completed" | "cancelled")}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedStatus !== match.status && (
        <Button
          size="sm"
          onClick={handleStatusUpdate}
          disabled={isUpdating}
        >
          {isUpdating ? 'Mise à jour...' : 'Confirmer'}
        </Button>
      )}
    </div>
  );
};

export default MatchStatusChanger;
