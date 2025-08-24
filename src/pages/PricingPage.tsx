
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Check, ArrowLeft } from 'lucide-react';

const PricingPage = () => {
  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      period: '/mois',
      description: 'Parfait pour débuter',
      features: [
        'Jusqu\'à 2 tournois',
        'Jusqu\'à 8 équipes par tournoi',
        'Gestion de base des équipes',
        'Planning manuel',
        'Support par email'
      ],
      cta: 'Commencer gratuitement',
      popular: false
    },
    {
      name: 'Pro',
      price: '29€',
      period: '/mois',
      description: 'Pour les organisateurs sérieux',
      features: [
        'Tournois illimités',
        'Équipes illimitées',
        'Planning IA automatique',
        'Vue calendrier avancée',
        'Statistiques détaillées',
        'Support prioritaire',
        'Export des données'
      ],
      cta: 'Essayer 14 jours gratuits',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '99€',
      period: '/mois',
      description: 'Pour les grandes organisations',
      features: [
        'Tout du plan Pro',
        'Multi-utilisateurs',
        'API personnalisée',
        'Intégrations avancées',
        'Formation dédiée',
        'Support 24/7',
        'Serveur dédié'
      ],
      cta: 'Contactez-nous',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/landing" className="flex items-center space-x-3">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Tournoi Manager
              </h1>
            </Link>
            <Link to="/">
              <Button>Accéder à l'app</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Des tarifs transparents pour tous les types d'organisateurs
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative border-2 ${
                  plan.popular 
                    ? 'border-primary shadow-xl scale-105' 
                    : 'border-gray-200 shadow-lg'
                }`}
              >
                {plan.popular && (
                  <Badge 
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                  >
                    Plus populaire
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="text-4xl font-bold text-primary mb-2">
                    {plan.price}
                    <span className="text-lg text-gray-600 font-normal">
                      {plan.period}
                    </span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-6">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Puis-je changer de plan à tout moment ?
              </h3>
              <p className="text-gray-600">
                Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. 
                Les changements prennent effet immédiatement.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Y a-t-il des frais cachés ?
              </h3>
              <p className="text-gray-600">
                Non, nos tarifs sont transparents. Pas de frais d'installation, 
                de configuration ou cachés.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Que se passe-t-il si j'annule ?
              </h3>
              <p className="text-gray-600">
                Vous pouvez annuler à tout moment. Vos données restent accessibles 
                jusqu'à la fin de votre période de facturation.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">
                Proposez-vous un support technique ?
              </h3>
              <p className="text-gray-600">
                Oui, tous nos plans incluent un support technique. 
                Les plans payants bénéficient d'un support prioritaire.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Prêt à essayer ?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Commencez votre essai gratuit de 14 jours, aucune carte bancaire requise
          </p>
          <Link to="/">
            <Button size="lg" className="text-lg px-8 py-3">
              Commencer gratuitement
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
