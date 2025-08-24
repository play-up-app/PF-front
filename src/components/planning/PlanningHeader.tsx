
import { Bot } from 'lucide-react';

const PlanningHeader = () => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          Planning IA
        </h1>
        <p className="text-gray-600 mt-1">
          Générez automatiquement des plannings optimisés pour vos tournois
        </p>
      </div>
    </div>
  );
};

export default PlanningHeader;
