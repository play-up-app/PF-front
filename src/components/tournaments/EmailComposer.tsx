import { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Team, TournamentDetail } from '@/types/planning';

interface EmailComposerProps {
  tournament: TournamentDetail;
  teams: Team[];
}

const EmailComposer = ({ tournament, teams }: EmailComposerProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [subject, setSubject] = useState(`Confirmation d'inscription - Tournoi - ${tournament.name}`);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    // Formater l'heure au format HH:MM
    const formatTimeToHHMM = (timeString: string) => {
        if (!timeString) return "09:00";
        
        // Si c'est déjà au format HH:MM, retourner tel quel
        if (/^\d{2}:\d{2}$/.test(timeString)) {
          return timeString;
        }
        
        // Si c'est un format avec secondes HH:MM:SS, extraire HH:MM
        if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
          return timeString.slice(0, 5);
        }
        
        // Si c'est un format avec microsecondes HH:MM:SS.xxx ou HH:MM:SS.xxxxxx
        if (/^\d{2}:\d{2}:\d{2}\.\d+$/.test(timeString)) {
          return timeString.slice(0, 5);
        }
        
        // Essayer d'extraire HH:MM depuis n'importe quel format qui commence par HH:MM
        const match = timeString.match(/^(\d{2}:\d{2})/);
        if (match) {
          return match[1];
        }
        
        return "09:00";
    };

    const defaultMessage = `Bonjour,

Nous avons le plaisir de vous confirmer votre inscription au tournoi "${tournament.name}".

Détails du tournoi :
- Date : ${new Date(tournament.start_date).toLocaleDateString('fr-FR')}
- Heure : ${formatTimeToHHMM(tournament.start_time)}
- Lieu : À confirmer
- Durée des matchs : ${tournament.match_duration_minutes} minutes
- Nombre de terrains : ${tournament.courts_available}

Votre équipe a été enregistrée avec succès. Nous vous contacterons prochainement avec plus d'informations sur le déroulement du tournoi.

Cordialement,
L'équipe d'organisation`;

    // Formater la date au format ISO 8601
    const formatDateToISO = (dateString: string) => {
        if (!dateString) return new Date().toISOString();
        try {
            const date = new Date(dateString);
            return date.toISOString();
        } catch {
            return new Date().toISOString();
        }
    };

    const getAllPlayerEmails = () => {
        const emails: string[] = [];
        teams.forEach(team => {
        team.members.forEach(member => {
            if (member.email && !emails.includes(member.email)) {
                emails.push(member.email);
            }
        });
        });
        return emails;
    };

    const handleSendEmail = async () => {
        const playerEmails = getAllPlayerEmails();
        
        if (playerEmails.length === 0) {
        toast({
            title: "Aucun email trouvé",
            description: "Aucune adresse email de joueur n'a été trouvée.",
            variant: "destructive",
        });
        return;
        }

        // Validation du message retirée - le message sert uniquement d'aperçu

        setIsSending(true);
        
        try {

        // Construire le body selon les spécifications
        const emailData = {
            to: playerEmails,
            tournament: {
            name: tournament.name,
            start_date: formatDateToISO(tournament.start_date),
            start_time: formatTimeToHHMM(tournament.start_time),
            match_duration_minutes: tournament.match_duration_minutes,
            courts_available: tournament.courts_available
            }
            // customMessage retiré - sert uniquement pour information utilisateur
        };

              // Appel API pour envoyer l'email
        const response = await fetch(`${import.meta.env.VITE_EMAIL_SERVICE_URL}/email/send`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            "accept": "application/json"
            },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        toast({
            title: "Emails envoyés",
            description: `${playerEmails.length} emails ont été envoyés avec succès.`,
        });
        
        setIsOpen(false);
        } catch (error) {
        console.error('Erreur lors de l\'envoi des emails:', error);
        toast({
            title: "Erreur",
            description: `Une erreur est survenue lors de l'envoi des emails: ${error.message}`,
            variant: "destructive",
        });
        } finally {
        setIsSending(false);
        }
    };

    const handleOpenDialog = () => {
        setMessage(defaultMessage);
        setIsOpen(true);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
            <Button onClick={handleOpenDialog} className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Envoyer un email aux joueurs
            </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
            <DialogTitle>Envoyer un email aux joueurs</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
            <div>
                <Label htmlFor="recipients">Destinataires</Label>
                <div className="text-sm text-gray-600 mt-1">
                {getAllPlayerEmails().length} joueurs recevront cet email
                </div>
            </div>
            
            <div>
                <Label htmlFor="subject">Objet</Label>
                <Input
                id="subject"
                value={subject}
                readOnly
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Objet de l'email"
                className="resize-none bg-gray-50 border-gray-200 text-gray-700 cursor-default"
                />
            </div>
            
            <div>
                <Label htmlFor="message">Message (aperçu uniquement)</Label>
                <Textarea
                id="message"
                value={message}
                readOnly
                placeholder="Aperçu du message qui sera envoyé..."
                rows={12}
                className="resize-none bg-gray-50 border-gray-200 text-gray-700 cursor-default"
                />
            </div>
            
            <div className="flex justify-end gap-2">
                <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSending}
                >
                Annuler
                </Button>
                <Button
                onClick={handleSendEmail}
                disabled={isSending}
                >
                {isSending ? 'Envoi en cours...' : 'Envoyer'}
                </Button>
            </div>
            </div>
        </DialogContent>
        </Dialog>
    );
};

export default EmailComposer;
