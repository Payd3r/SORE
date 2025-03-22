
import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/context/theme-context';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useToast } from '@/components/ui/use-toast';
import { 
  User, 
  Heart, 
  Calendar, 
  Mail, 
  Image as ImageIcon,
  Save,
  Trash2,
  Lock,
  Users
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, couple, updateUser, updateCouple } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('personal');
  
  // User form states
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [userBio, setUserBio] = useState(user?.bio || '');
  const [userAvatar, setUserAvatar] = useState(user?.avatar || '');
  
  // Couple form states
  const [coupleName, setCoupleName] = useState(couple?.name || '');
  const [coupleDescription, setCoupleDescription] = useState(couple?.description || '');
  const [coupleAnniversary, setCoupleAnniversary] = useState(
    couple?.anniversaryDate ? new Date(couple.anniversaryDate).toISOString().split('T')[0] : ''
  );
  
  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const handleUpdateUser = () => {
    if (!user) return;
    
    // Create updated user object
    const updatedUser = {
      ...user,
      name: userName,
      email: userEmail,
      bio: userBio,
      avatar: userAvatar
    };
    
    // In a real app, this would call an API
    updateUser(updatedUser);
    console.log("User profile updated:", updatedUser);
    
    toast({
      title: "Profilo aggiornato",
      description: "Le tue informazioni personali sono state aggiornate con successo.",
    });
  };
  
  const handleUpdateCouple = () => {
    if (!couple) return;
    
    // Create updated couple object
    const updatedCouple = {
      ...couple,
      name: coupleName,
      description: coupleDescription,
      anniversaryDate: coupleAnniversary ? new Date(coupleAnniversary) : undefined
    };
    
    // In a real app, this would call an API
    updateCouple(updatedCouple);
    console.log("Couple profile updated:", updatedCouple);
    
    toast({
      title: "Profilo coppia aggiornato",
      description: "Le informazioni della coppia sono state aggiornate con successo.",
    });
  };
  
  const handleChangePassword = () => {
    if (!user) return;
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
      toast({
        title: "Errore",
        description: "Le nuove password non corrispondono.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Errore",
        description: "La nuova password deve contenere almeno 8 caratteri.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, this would call an API
    console.log("Password changed");
    
    // Reset fields
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    
    toast({
      title: "Password aggiornata",
      description: "La tua password è stata modificata con successo.",
    });
  };
  
  const handleDeleteAccount = () => {
    // In a real app, this would call an API
    console.log("Account deletion requested");
    
    toast({
      title: "Richiesta inviata",
      description: "La richiesta di eliminazione dell'account è stata inviata.",
      variant: "destructive",
    });
  };
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Utente non autenticato. Effettua l'accesso per visualizzare il profilo.</p>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-4xl font-bold mb-2">Profilo</h1>
      <p className="text-muted-foreground mb-6">
        Gestisci le tue informazioni personali e le impostazioni dell'account
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personale
          </TabsTrigger>
          <TabsTrigger value="couple">
            <Heart className="h-4 w-4 mr-2" />
            Coppia
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Lock className="h-4 w-4 mr-2" />
            Sicurezza
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informazioni personali</CardTitle>
                <CardDescription>
                  Aggiorna le tue informazioni personali
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    placeholder="Il tuo nome"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="La tua email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Racconta qualcosa di te..."
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="avatar">URL Avatar (opzionale)</Label>
                  <Input
                    id="avatar"
                    placeholder="https://example.com/avatar.jpg"
                    value={userAvatar}
                    onChange={(e) => setUserAvatar(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleUpdateUser} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Salva modifiche
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Il tuo profilo</CardTitle>
                <CardDescription>
                  Riepilogo del tuo account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{user.name}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{couple?.name || 'Nessuna coppia'}</span>
                  </div>
                  
                  {couple?.members && couple.members.length > 0 && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {couple.members.filter(m => m.id !== user.id).map(m => m.name).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      Membro dal {user.createdAt instanceof Date ? 
                        format(user.createdAt, 'dd/MM/yyyy') : 
                        format(new Date(user.createdAt), 'dd/MM/yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <ImageIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">
                      {user.uploadCount || 0} immagini caricate
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="couple" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni della coppia</CardTitle>
              <CardDescription>
                Aggiorna le informazioni della tua relazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="coupleName">Nome della coppia</Label>
                <Input
                  id="coupleName"
                  placeholder="Es. Mario & Laura"
                  value={coupleName}
                  onChange={(e) => setCoupleName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="coupleDescription">Descrizione</Label>
                <Textarea
                  id="coupleDescription"
                  placeholder="Racconta la vostra storia..."
                  value={coupleDescription}
                  onChange={(e) => setCoupleDescription(e.target.value)}
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="anniversary">Data anniversario (opzionale)</Label>
                <Input
                  id="anniversary"
                  type="date"
                  value={coupleAnniversary}
                  onChange={(e) => setCoupleAnniversary(e.target.value)}
                />
              </div>
              
              {couple?.members && couple.members.length > 0 && (
                <div className="space-y-2">
                  <Label>Membri della coppia</Label>
                  <div className="border rounded-md p-4">
                    {couple.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 py-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.name} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={handleUpdateCouple} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Salva modifiche
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cambia password</CardTitle>
                <CardDescription>
                  Aggiorna la password del tuo account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Password attuale</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nuova password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Conferma nuova password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleChangePassword} 
                  disabled={!currentPassword || !newPassword || !confirmPassword}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Aggiorna password
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Zona pericolosa</CardTitle>
                <CardDescription>
                  Azioni irreversibili per il tuo account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  L'eliminazione dell'account è un'operazione irreversibile. Tutti i tuoi dati personali, ricordi e foto saranno rimossi permanentemente.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
