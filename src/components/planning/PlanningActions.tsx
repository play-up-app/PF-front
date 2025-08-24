
import { RefreshCw, Zap, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlanningActionsProps {
  selectedTournament: string;
  isGenerating: boolean;
  generatedPlanning: any;
  showPreview: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  onTogglePreview: () => void;
}

const PlanningActions = ({
  selectedTournament,
  isGenerating,
  generatedPlanning,
  showPreview,
  onGenerate,
  onRegenerate,
  onTogglePreview
}: PlanningActionsProps) => {
  return (
    <div className="flex justify-center pt-4">
      {!generatedPlanning ? (
        <Button
          onClick={onGenerate}
          disabled={!selectedTournament || isGenerating}
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              L'IA génère le planning...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Générer le planning avec l'IA
            </>
          )}
        </Button>
      ) : (
        <div className="flex gap-3">
          <Button
            onClick={onRegenerate}
            variant="outline"
            size="lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Régénérer
          </Button>
          <Button
            onClick={onTogglePreview}
            variant="outline"
            size="lg"
          >
            <Eye className="w-5 h-5 mr-2" />
            {showPreview ? 'Masquer' : 'Afficher'} le planning
          </Button>
          <Button size="lg">
            <Download className="w-5 h-5 mr-2" />
            Télécharger
          </Button>
        </div>
      )}
    </div>
  );
};

export default PlanningActions;
