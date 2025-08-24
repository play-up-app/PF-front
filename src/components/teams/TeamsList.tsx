
import { useState } from 'react';
import { Mail, Users, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {Team, Member} from '@/types/planning'

interface TeamsListProps {
  teams: Team[];
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (teamId: string) => void;
}

const TeamsList = ({ teams, onEditTeam, onDeleteTeam }: TeamsListProps) => {
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);

  const toggleTeamExpansion = (teamId: string) => {
    setExpandedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'advanced': return 'bg-red-100 text-red-700';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'beginner': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'confirmed' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-blue-100 text-blue-700';
  };

  const handleDeleteTeam = (teamId: string, teamName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'équipe "${teamName}" ? Cette action est irréversible.`)) {
      onDeleteTeam(teamId);
    }
  };

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune équipe trouvée
          </h3>
          <p className="text-gray-600">
            Commencez par ajouter une équipe à un tournoi
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {teams.map((team) => {
        const isExpanded = expandedTeams.includes(team.id);
        
        return (
          <Card key={team.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <Badge className={getStatusColor(team.status)}>
                      {team.status === 'confirmed' ? 'Confirmée' : 'Inscrite'}
                    </Badge>
                    <Badge className={getSkillLevelColor(team.skillLevel)}>
                      {team.skillLevel === 'expert' ? 'Avancé' : 
                       team.skillLevel === 'amateur' ? 'Intermédiaire' : 'Débutant'}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mt-1">{team.tournament}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{team.contactEmail}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{team?.members?.length} joueur{team?.members?.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTeamExpansion(team.id)}
                    className="flex items-center space-x-1"
                  >
                    {isExpanded ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Masquer</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Voir joueurs</span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditTeam(team)}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Modifier</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTeam(team.id, team.name)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Supprimer</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            {isExpanded && (
              <CardContent className="pt-0">
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Joueurs de l'équipe :</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {team?.members?.map((member: Member, index: number) => (
                      <div 
                        key={index} 
                        className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.name}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center space-x-1">
                            <Mail className="w-3 h-3" />
                            <span>{member.email}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TeamsList;
