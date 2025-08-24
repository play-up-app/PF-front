
import { useState } from 'react';
import { X, Plus, Trash2, Mail, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Member } from '@/types/planning';

interface Tournament {
  id: string;
  name: string;
}

interface TeamFormProps {
  tournaments: Tournament[];
  onSubmit: (teamData: any) => void;
  onCancel: () => void;
  initialData?: any;
  isLoading?: boolean;
}

const TeamForm = ({ tournaments, onSubmit, onCancel, initialData, isLoading = false }: TeamFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    tournamentId: initialData?.tournament_id || '',
    captainId: initialData?.captain_id || '',
    contactEmail: initialData?.contact_email || '',
    contactPhone: initialData?.contact_phone || '',
    skillLevel: initialData?.skill_level || 'amateur',
    description: initialData?.description || '',
    members: initialData?.members || [{ name: '', email: '', role: 'player', position: '', status: 'active' }]
  });

  const [errors, setErrors] = useState<any>({});

  const addPlayer = () => {
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, { name: '', email: '', role: 'player', position: '', status: 'active' }]
    }));
  };

  const removePlayer = (index: number) => {
    if (formData.members.length > 1) {
      setFormData(prev => ({
        ...prev,
        members: prev.members.filter((_, i) => i !== index)
      }));
    }
  };

  const updateMember = (index: number, field: 'name' | 'email' | 'role' | 'position' | 'status', value: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((player, i) => 
        i === index ? { ...player, [field]: value } : player
      )
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'équipe est requis';
    }

    if (!formData.tournamentId) {
      newErrors.tournamentId = 'Veuillez sélectionner un tournoi';
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'L\'email de contact est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Format d\'email invalide';
    }

          // Validation des membres
      const memberErrors: any[] = [];
      formData.members.forEach((member, index) => {
        const memberError: any = {};
        if (!member.name.trim()) {
          memberError.name = 'Le nom du membre est requis';
        }
        if (!member.email.trim()) {
          memberError.email = 'L\'email du membre est requis';
        } else if (!/\S+@\S+\.\S+/.test(member.email)) {
          memberError.email = 'Format d\'email invalide';
        }
        memberErrors[index] = memberError;
      });

      if (memberErrors.some(error => Object.keys(error).length > 0)) {
        newErrors.members = memberErrors;
      }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-2xl">
            {initialData ? 'Modifier l\'équipe' : 'Nouvelle équipe'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informations de l'équipe</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom de l'équipe *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Les Spikeurs"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="tournament">Tournoi *</Label>
                  <select
                    id="tournament"
                    value={formData.tournamentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, tournamentId: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.tournamentId ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <option value="">Sélectionner un tournoi</option>
                    {tournaments.map(tournament => (
                      <option key={tournament.id} value={tournament.id}>
                        {tournament.name}
                      </option>
                    ))}
                  </select>
                  {errors.tournamentId && <p className="text-red-500 text-sm mt-1">{errors.tournamentId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Email de contact *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                    placeholder="capitaine@exemple.com"
                    className={errors.contactEmail ? 'border-red-500' : ''}
                  />
                  {errors.contactEmail && <p className="text-red-500 text-sm mt-1">{errors.contactEmail}</p>}
                </div>

                <div>
                  <Label htmlFor="contactPhone">Téléphone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="skillLevel">Niveau de l'équipe</Label>
                <select
                  id="skillLevel"
                  value={formData.skillLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, skillLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="debutant">Débutant</option>
                  <option value="amateur">Amateur</option>
                  <option value="confirme">Confirmé</option>
                  <option value="expert">Expert</option>
                  <option value="professionnel">Professionnel</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Informations supplémentaires sur l'équipe..."
                  rows={3}
                />
              </div>
            </div>

            {/* Joueurs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Joueurs de l'équipe</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPlayer}
                  className="flex items-center space-x-1"
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter un joueur</span>
                </Button>
              </div>
              
              {!isLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    ℹ️ <strong>Info :</strong> Si un email n'existe pas dans le système, une invitation sera automatiquement envoyée.
                  </p>
                </div>
              )}

              {isLoading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    ⏳ <strong>Traitement en cours :</strong> Vérification des emails et création de l'équipe...
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {formData.members.map((member, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        Joueur {index + 1}
                      </h4>
                      {formData.members.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label>Nom complet *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            value={member.name}
                            onChange={(e) => updateMember(index, 'name', e.target.value)}
                            placeholder="Prénom Nom"
                            className={`pl-10 ${errors.players?.[index]?.name ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.players?.[index]?.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.players[index].name}</p>
                        )}
                      </div>
                      
                      <div>
                        <Label>Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateMember(index, 'email', e.target.value)}
                            placeholder="joueur@exemple.com"
                            className={`pl-10 ${errors.players?.[index]?.email ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.players?.[index]?.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.players[index].email}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {initialData ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  initialData ? 'Modifier l\'équipe' : 'Créer l\'équipe'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamForm;
