import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Github, Loader2 } from 'lucide-react';
import GoogleIcon from '@/components/auth/GoogleIcon';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/api';

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState('joueur');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleGoogleAuth = () => {
    ('Google OAuth triggered');
    // Redirection directe vers l'endpoint d'authentification Google
    window.location.href = import.meta.env.VITE_GOOGLE_AUTH_URL;
  };

  const handleGithubAuth = () => {
    ('GitHub OAuth triggered');
    // Redirection directe vers l'endpoint d'authentification GitHub
    window.location.href = import.meta.env.VITE_GITHUB_AUTH_URL;
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation côté client
    if (!email || !password) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    if (!isSignIn && password !== confirmPassword) {
      toast({
        title: "Erreur de validation",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isSignIn) {
        // Connexion
        const response = await authService.login(email, password);
        console.log("connexion", response);
        if (response) {
          toast({
            title: "Connexion réussie",
            description: "Vous êtes maintenant connecté",
          });
          // Redirection vers le dashboard
          navigate('/dashboard');
        } else {
          toast({
            title: "Erreur de connexion",
            description: response.message || "Email ou mot de passe incorrect",
            variant: "destructive"
          });
        }
      } else {
        // Inscription
        const response = await authService.register(email, password, userRole);
        console.log("inscription", response);
        if (response) {
          toast({
            title: "Inscription réussie",
            description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
          });

          // Basculer vers la connexion après inscription réussie
          setIsSignIn(true);
          setPassword('');
          setConfirmPassword('');
          navigate('/auth');
        } else {
          toast({
            title: "Erreur d'inscription",
            description: response.message || "Une erreur est survenue lors de l'inscription",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      toast({
        title: "Erreur de connexion",
        description: "Impossible de se connecter au serveur",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">T</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Tournoi Manager</h1>
          </div>
          <p className="text-gray-600">
            {isSignIn ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{isSignIn ? 'Connexion' : 'Inscription'}</CardTitle>
            <CardDescription>
              {isSignIn 
                ? 'Choisissez votre méthode de connexion' 
                : 'Choisissez votre méthode d\'inscription'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-2"
                onClick={handleGoogleAuth}
              >
                <GoogleIcon className="w-5 h-5" />
                <span>Continuer avec Google</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center space-x-2"
                onClick={handleGithubAuth}
              >
                <Github className="w-5 h-5" />
                <span>Continuer avec GitHub</span>
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">
                  Ou continuer avec
                </span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required 
                />
              </div>

              {!isSignIn && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required 
                  />
                  <Label htmlFor="userRole">Rôle</Label>
                  <select
                    id="userRole"
                    value={userRole}
                    onChange={(e) => {
                      setUserRole(e.target.value);
                      console.log(userRole);
                    }}
                    disabled={isLoading}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="joueur">Joueur</option>
                    <option value="organisateur">Organisateur</option>
                    <option value="spectateur">Spectateur</option>
                  </select>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSignIn ? 'Connexion...' : 'Inscription...'}
                  </>
                ) : (
                  isSignIn ? 'Se connecter' : 'S\'inscrire'
                )}
              </Button>
            </form>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                {isSignIn ? "Pas encore de compte ?" : "Déjà un compte ?"}
              </span>
              <Button 
                variant="link" 
                className="p-0 ml-1 h-auto"
                onClick={() => {
                  setIsSignIn(!isSignIn);
                  // Vider les champs lors du changement de mode
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                }}
              >
                {isSignIn ? "S'inscrire" : "Se connecter"}
              </Button>
            </div>

            {isSignIn && (
              <div className="text-center">
                <Link to="/forgot-password">
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Mot de passe oublié ?
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-muted-foreground">
          En continuant, vous acceptez nos{' '}
          <Link to="/terms" className="underline hover:text-foreground">
            Conditions d'utilisation
          </Link>{' '}
          et notre{' '}
          <Link to="/privacy" className="underline hover:text-foreground">
            Politique de confidentialité
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;