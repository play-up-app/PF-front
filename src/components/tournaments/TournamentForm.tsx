
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Trophy, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { tournamentService } from '@/services/api';

interface TournamentFormData {
  name: string;
  description: string;
  tournament_type: string;
  max_teams: number;
  courts_available: number;
  start_date: string;
  start_time: string;
  match_duration_minutes: number;
  break_duration_minutes: number;
  organizer_id: string;
  status: string;
}

const TournamentForm = () => {
  const url = `${import.meta.env.VITE_BDD_SERVICE_URL}/tournaments`
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    description: '',
    tournament_type: '',
    max_teams: 8,
    courts_available: 2,
    start_date: '',
    start_time: '09:00',
    match_duration_minutes: 20,
    break_duration_minutes: 5,
    organizer_id:"88a62d0f-e786-400e-9dbb-e65198286ea8",
    status: "draft"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps = [
    {
      title: 'Informations générales',
      icon: Trophy,
      fields: ['name', 'description', 'tournament_type']
    },
    {
      title: 'Configuration',
      icon: Calendar,
      fields: ['max_teams', 'courts_available', 'start_date', 'start_time']
    },
    {
      title: 'Paramètres avancés',
      icon: Settings,
      fields: ['match_duration', 'break_duration']
    }
  ];

  const handleInputChange = (field: keyof TournamentFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number) => {
    const requiredFields = steps[step].fields;
    return requiredFields.every(field => {
      const value = formData[field as keyof TournamentFormData];
      return value !== '' && value !== null && value !== undefined;
    });
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      tournamentService.createTournament(formData);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Tournoi créé avec succès!",
        description: `Le tournoi "${formData.name}" a été créé.`,
      });
      
      // Navigate to tournament detail
      navigate('/tournaments/1');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du tournoi.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nom du tournoi *</Label>
              <Input
                id="name"
                placeholder="Ex: Tournoi de volley-ball été 2024"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre tournoi..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="tournament_type">Type de tournoi *</Label>
              <Select onValueChange={(value) => handleInputChange('tournament_type', value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="poules_elimination">Poules + Élimination</SelectItem>
                  <SelectItem value="round_robin">Round Robin</SelectItem>
                  <SelectItem value="elimination_directe">Élimination directe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="max_teams">Nombre max d'équipes *</Label>
                <Input
                  id="max_teams"
                  type="number"
                  min="4"
                  max="32"
                  value={formData.max_teams}
                  onChange={(e) => handleInputChange('max_teams', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="courts_available">Terrains disponibles *</Label>
                <Input
                  id="courts_available"
                  type="number"
                  min="1"
                  max="8"
                  value={formData.courts_available}
                  onChange={(e) => handleInputChange('courts_available', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="start_date">Date de début *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="start_time">Heure de début *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="match_duration">Durée d'un match (minutes) *</Label>
                <Input
                  id="match_duration"
                  type="number"
                  min="10"
                  max="60"
                  value={formData.match_duration_minutes}
                  onChange={(e) => handleInputChange('match_duration_minutes', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
              
              <div>
                <Label htmlFor="break_duration">Pause entre matchs (minutes) *</Label>
                <Input
                  id="break_duration"
                  type="number"
                  min="2"
                  max="20"
                  value={formData.break_duration_minutes}
                  onChange={(e) => handleInputChange('break_duration_minutes', parseInt(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Récapitulatif</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• Tournoi: {formData.name}</p>
                <p>• Type: {formData.tournament_type.replace('_', ' ')}</p>
                <p>• {formData.max_teams} équipes max sur {formData.courts_available} terrain(s)</p>
                <p>• Début: {formData.start_date} à {formData.start_time}</p>
                <p>• Matchs de {formData.match_duration_minutes}min avec {formData.break_duration_minutes}min de pause</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/tournaments')}
          className="mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour aux tournois
        </Button>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Créer un nouveau tournoi
        </h1>
        <p className="text-gray-600">
          Configurez votre tournoi en 3 étapes simples
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={index} className="flex items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isActive 
                      ? 'border-primary bg-primary text-white' 
                      : isCompleted 
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }
                  `}
                >
                  <StepIcon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      w-16 h-0.5 mx-4 transition-colors
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            {steps[currentStep].title}
          </h2>
        </div>
      </div>

      {/* Form content */}
      <Card className="p-6 mb-8">
        {renderStepContent()}
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Suivant
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer le tournoi'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default TournamentForm;
