import { Link } from 'react-router-dom';
import { Plus, Trophy, Users, Bot, TrendingUp, Calendar, Play } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import StatsCard from '@/components/dashboard/StatsCard';
import TournamentCard from '@/components/tournaments/TournamentCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { TournamentDetail } from '@/types/planning';
// Icônes pour les statistiques
const statsIcons = {
  'Tournois actifs': <Trophy className="w-6 h-6" />,
  'Équipes inscrites': <Users className="w-6 h-6" />,
  'Plannings générés': <Bot className="w-6 h-6" />,
  'Taux de participation': <TrendingUp className="w-6 h-6" />
};

const Index = () => {
  const tournamentsUrl = `${import.meta.env.VITE_BDD_SERVICE_URL}/tournaments`
  const metricsUrl = `${import.meta.env.VITE_METRICS_SERVICE_URL}/metrics`
  
  const [tournaments, setTournaments] = useState<TournamentDetail[]>([])
  const [stats, setStats] = useState<Array<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    change: { value: string; trend: 'up' | 'down' };
  }>>([])

  const getTournaments = async () => {
    try {
      (tournamentsUrl)
      const response = await fetch(tournamentsUrl, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });
      const responseJson = await response.json()
      setTournaments(responseJson["data"])
    } catch (error) {
        console.error(error.message);
    }
  }

  const getMetrics = async () => {
    try {
      const response = await fetch(metricsUrl, {
        method: "GET",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json"
        }
      });
      const responseJson = await response.json()
      
      if (responseJson.success) {
        const metricsData = responseJson.data;
        const formattedStats = [
          {
            title: metricsData.tournoissActifs.title,
            value: metricsData.tournoissActifs.value,
            icon: statsIcons['Tournois actifs'],
            change: metricsData.tournoissActifs.change
          },
          {
            title: metricsData.equipesInscrites.title,
            value: metricsData.equipesInscrites.value,
            icon: statsIcons['Équipes inscrites'],
            change: metricsData.equipesInscrites.change
          },
          {
            title: metricsData.planningsGeneres.title,
            value: metricsData.planningsGeneres.value,
            icon: statsIcons['Plannings générés'],
            change: metricsData.planningsGeneres.change
          },
          {
            title: metricsData.tauxParticipation.title,
            value: metricsData.tauxParticipation.value,
            icon: statsIcons['Taux de participation'],
            change: metricsData.tauxParticipation.change
          }
        ];
        setStats(formattedStats);
      }
    } catch (error) {
        console.error("Erreur lors de la récupération des métriques:", error.message);
    }
  }
  const handleStatusChange = (tournamentId: string, newStatus: string) => {
    setTournaments(prevTournaments => 
      prevTournaments.map(tournament => 
        tournament.id === tournamentId 
          ? { ...tournament, status: newStatus as TournamentDetail['status'] }
          : tournament
      )
    );
  };
  useEffect(() => {
    getTournaments()
    getMetrics()
  }, [])
  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Gérez vos tournois de volley-ball avec l'intelligence artificielle
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Link to="/tournaments/new">
              <Button className="space-x-2">
                <Plus className="w-4 h-4" />
                <span>Nouveau tournoi</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              change={stat.change}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            />
          ))}
        </div>

        {/* Recent Tournaments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                Tournois récents
              </h2>
              <Link to="/tournaments">
                <Button variant="outline" size="sm">
                  Voir tous
                </Button>
              </Link>
            </div>
            
            <div className="space-y-4">
              {tournaments.map((tournament, index) => (
                <div
                  key={tournament.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <TournamentCard 
                    tournament={tournament}
                    onStatusChange={handleStatusChange} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Actions rapides
              </h2>
              
              <div className="space-y-4">
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <Link to="/tournaments/new" className="block">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Créer un tournoi
                        </h3>
                        <p className="text-sm text-gray-600">
                          Nouveau tournoi en 3 étapes
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
                
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <Link to="/planning" className="block">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Bot className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Générer planning IA
                        </h3>
                        <p className="text-sm text-gray-600">
                          Planning automatique optimisé
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
                
                <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <Link to="/teams" className="block">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Gérer les équipes
                        </h3>
                        <p className="text-sm text-gray-600">
                          Inscriptions et modifications
                        </p>
                      </div>
                    </div>
                  </Link>
                </Card>
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Prochains événements
              </h3>
              
              <div className="space-y-3">
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        Tournoi Été 2024
                      </p>
                      <p className="text-xs text-gray-600">
                        Dans 2 jours
                      </p>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Play className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        Championship Regional
                      </p>
                      <p className="text-xs text-gray-600">
                        Dans 1 semaine
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
