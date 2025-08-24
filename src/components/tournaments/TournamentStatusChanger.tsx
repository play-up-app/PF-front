
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TournamentDetail } from '@/pages/TournamentsPage';

interface TournamentStatusChangerProps {
  tournament: TournamentDetail;
  onStatusChange: (tournamentId: string, newStatus: string) => void;
}

const TournamentStatusChanger = ({ tournament, onStatusChange }: TournamentStatusChangerProps) => {
  const [selectedStatus, setSelectedStatus] = useState(tournament.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'ready', label: 'Prêt' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'completed', label: 'Terminé' },
    { value: 'cancelled', label: 'Annulé' }
  ];

  const handleStatusUpdate = async () => {
    if (selectedStatus === tournament.status) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BDD_SERVICE_URL}/tournaments/${tournament.id}/status/`, {
        method: 'PATCH',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: selectedStatus })
      });

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      onStatusChange(tournament.id, selectedStatus);
      toast({
        title: "Statut mis à jour",
        description: `Le statut du tournoi a été changé vers "${statusOptions.find(opt => opt.value === selectedStatus)?.label}".`,
      });
    } catch (error) {
      console.error('Error updating tournament status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut du tournoi.",
        variant: "destructive",
      });
      setSelectedStatus(tournament.status); // Reset to original status
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
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
      
      {selectedStatus !== tournament.status && (
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

export default TournamentStatusChanger;
