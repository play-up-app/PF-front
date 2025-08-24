
import { Zap, Clock, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const FeaturesInfo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Optimisation IA</h3>
          <p className="text-sm text-gray-600">
            Algorithmes avancés pour minimiser les temps d'attente et optimiser l'utilisation des terrains
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Gestion du temps</h3>
          <p className="text-sm text-gray-600">
            Prise en compte des pauses, échauffements et contraintes horaires spécifiques
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-medium text-gray-900 mb-2">Équité sportive</h3>
          <p className="text-sm text-gray-600">
            Répartition équitable des créneaux et respect des phases de compétition
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturesInfo;
