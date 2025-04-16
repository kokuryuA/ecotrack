import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Gratuit',
    price: 0,
    features: [
      'Jusqu\'à 10 prédictions d\'énergie par mois',
      'Analyses de consommation basiques',
      'Support par email',
      'Précision standard des prédictions',
      'Historique des prédictions sur 7 jours',
      'Rapports mensuels',
      'Comparaison avec la moyenne nationale'
    ]
  },
  {
    id: 'pro',
    name: 'Professionnel',
    price: 1999,
    features: [
      'Prédictions d\'énergie illimitées',
      'Analyses de consommation avancées',
      'Support prioritaire',
      'Haute précision des prédictions',
      'Historique des prédictions sur 30 jours',
      'Tendances d\'utilisation d\'énergie',
      'Exportation des données en CSV',
      'Alertes de consommation élevée',
      'Comparaison avec les voisins',
      'Conseils d\'économie d\'énergie personnalisés'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Entreprise',
    price: 4999,
    features: [
      'Prédictions d\'énergie illimitées',
      'Tableau de bord d\'analyses personnalisé',
      'Support 24/7',
      'Précision maximale des prédictions',
      'Historique illimité des prédictions',
      'Modèles d\'utilisation d\'énergie avancés',
      'Accès API pour intégration',
      'Métriques d\'énergie personnalisées',
      'Fonctionnalités de collaboration en équipe',
      'Rapports détaillés par site',
      'Analyse comparative avec les entreprises similaires',
      'Optimisation des coûts énergétiques'
    ]
  }
];

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<string>('pro');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
  });
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please log in to access subscription plans');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubscribe = async (planId: string) => {
    try {
      if (!user) {
        toast.error('Veuillez vous connecter pour souscrire à un abonnement');
        return;
      }

      if (planId === 'basic') {
        // For basic (free) tier, just update the user's subscription in the database
        const { error } = await supabase
          .from('user_profiles')
          .update({
            subscription_plan: planId,
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: null // Free tier doesn't expire
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating subscription:', error);
          toast.error('Erreur lors de la mise à jour de l\'abonnement');
          return;
        }

        toast.success('Abonnement gratuit activé avec succès!');
        navigate('/dashboard');
        return;
      }

      // For paid plans, continue with existing payment logic
      setSelectedPlan(planId);
      setShowPaymentForm(true);
    } catch (error) {
      console.error('Error in subscription process:', error);
      toast.error('Une erreur est survenue lors de la souscription');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically integrate with a payment processor like Stripe
    toast.success('Payment processed successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Choisissez Votre Abonnement</h2>
          <p className="mt-2 text-gray-600">Sélectionnez le plan qui correspond le mieux à vos besoins</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden ${
                plan.popular ? 'ring-2 ring-purple-500' : ''
              }`}
            >
              {plan.popular && (
                <div className="bg-purple-500 text-white text-center py-1 text-sm font-medium">
                  Le Plus Populaire
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price} DZD</span>
                  <span className="text-gray-500">/mois</span>
                </div>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`mt-8 w-full py-2 px-4 rounded-lg font-medium ${
                    plan.id === selectedPlan
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.id === selectedPlan ? 'Sélectionné' : 'Sélectionner'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {showPaymentForm && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Détails de Paiement</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom sur la Carte
                </label>
                <input
                  type="text"
                  id="name"
                  value={paymentDetails.name}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                  Numéro de Carte
                </label>
                <input
                  type="text"
                  id="cardNumber"
                  value={paymentDetails.cardNumber}
                  onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                    Date d'Expiration
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    value={paymentDetails.expiryDate}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, expiryDate: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="MM/AA"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    value={paymentDetails.cvv}
                    onChange={(e) => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Plan Sélectionné</span>
                  <span className="font-semibold">
                    {plans.find(p => p.id === selectedPlan)?.name} - {plans.find(p => p.id === selectedPlan)?.price} DZD/mois
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                S'abonner Maintenant
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage; 