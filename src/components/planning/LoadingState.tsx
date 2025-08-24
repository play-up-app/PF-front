
import { Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingState = () => {
  return (
    <Card className="animate-pulse">
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-white animate-bounce" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          L'IA génère votre planning...
        </h3>
        <p className="text-gray-600 mb-4">
          Optimisation des créneaux et répartition des équipes en cours
        </p>
        <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
