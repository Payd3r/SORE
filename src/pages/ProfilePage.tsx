
import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Users, 
  Edit, 
  UserPlus, 
  Save,
  Heart,
  LogOut,
  UserX
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { user, couple, updateUser, updateCouple, createCouple, inviteToCouple, leaveCouple } = useAuth();
  
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingCouple, setEditingCouple] = useState(false);
  const [showCreateCoupleDialog, setShowCreateCoupleDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  // Form values
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [coupleName, setCoupleName] = useState(couple?.name || '');
  const [coupleDescription, setCoupleDescription] = useState(couple?.description || '');
  const [newCoupleName, setNewCoupleName] = useState('');
  const [newCoupleDescription, setNewCoupleDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  
  // Handle user profile update
  const handleUpdateProfile = async () => {
    try {
      await updateUser({ name, email });
      setEditingProfile(false);
      console.log('Profile updated:', { name, email });
      toast.success('Profilo aggiornato con successo!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Errore nell\'aggiornamento del profilo');
    }
  };
  
  // Handle couple update
  const handleUpdateCouple = async () => {
    try {
      await updateCouple({ name: coupleName, description: coupleDescription });
      setEditingCouple(false);
      console.log('Couple updated:', { name: coupleName, description: coupleDescription });
    } catch (error) {
      console.error('Error updating couple:', error);
    }
  };
  
  // Handle create couple
  const handleCreateCouple = async () => {
    try {
      await createCouple(newCoupleName, newCoupleDescription);
      setShowCreateCoupleDialog(false);
      console.log('Couple created:', { name: newCoupleName, description: newCoupleDescription });
    } catch (error) {
      console.error('Error creating couple:', error);
    }
  };
  
  // Handle invite
  const handleInvite = async () => {
    try {
      await inviteToCouple(inviteEmail);
      setShowInviteDialog(false);
      setInviteEmail('');
      console.log('Invitation sent to:', inviteEmail);
    } catch (error) {
      console.error('Error sending invitation:', error);
    }
  };
  
  // Handle leave couple
  const handleLeaveCouple = async () => {
    if (window.confirm('Sei sicuro di voler abbandonare la coppia?')) {
      try {
        await leaveCouple();
        console.log('Left couple');
      } catch (error) {
        console.error('Error leaving couple:', error);
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Profilo</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci le tue informazioni personali e quelle della coppia
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profilo
          </TabsTrigger>
          <TabsTrigger value="couple" className="flex items-center">
            <Heart className="mr-2 h-4 w-4" />
            Coppia
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Impostazioni
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="animate-in">
          <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
            <CardHeader className="flex flex-row items-center">
              <div className="flex-1">
                <CardTitle className="text-2xl">Informazioni Personali</CardTitle>
                <CardDescription>
                  Visualizza e modifica le tue informazioni personali
                </CardDescription>
              </div>
              <Button 
                variant={editingProfile ? "default" : "outline"} 
                size="sm"
                onClick={() => setEditingProfile(!editingProfile)}
              >
                {editingProfile ? (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salva
                  </>
                ) : (
                  <>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifica
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-lg">{user?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user?.name}</h3>
                  <p className="text-muted-foreground">{user?.email}</p>
                  {couple && (
                    <Badge variant="outline" className="mt-2 flex items-center w-fit">
                      <Heart className="mr-1 h-3 w-3 text-pink-500" />
                      {couple.name}
                    </Badge>
                  )}
                </div>
              </div>
              
              {editingProfile ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nome</label>
                    <Input 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="max-w-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="max-w-md"
                    />
                  </div>
                  <Button onClick={handleUpdateProfile}>
                    Aggiorna Profilo
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Nome</h4>
                    <p>{user?.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Email</h4>
                    <p>{user?.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Account creato il</h4>
                    <p>{user?.createdAt.toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="couple" className="animate-in">
          {couple ? (
            <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
              <CardHeader className="flex flex-row items-center">
                <div className="flex-1">
                  <CardTitle className="text-2xl flex items-center">
                    <Heart className="mr-2 h-5 w-5 text-pink-500" />
                    {couple.name}
                  </CardTitle>
                  <CardDescription>
                    Gestisci la tua coppia e i membri
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invita
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invita nella coppia</DialogTitle>
                        <DialogDescription>
                          Inserisci l'email della persona che vuoi invitare nella tua coppia.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email</label>
                          <Input 
                            value={inviteEmail} 
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="nome@esempio.com"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Annulla</Button>
                        <Button onClick={handleInvite}>Invia Invito</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  
                  <Button 
                    variant={editingCouple ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setEditingCouple(!editingCouple)}
                  >
                    {editingCouple ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Salva
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" />
                        Modifica
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {editingCouple ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nome della Coppia</label>
                      <Input 
                        value={coupleName} 
                        onChange={(e) => setCoupleName(e.target.value)} 
                        className="max-w-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Descrizione</label>
                      <Textarea 
                        value={coupleDescription} 
                        onChange={(e) => setCoupleDescription(e.target.value)} 
                        className="max-w-md"
                        placeholder="Scrivi qualcosa sulla vostra storia..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleUpdateCouple}>
                      Aggiorna Informazioni Coppia
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Nome</h4>
                      <p>{couple.name}</p>
                    </div>
                    {couple.description && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Descrizione</h4>
                        <p>{couple.description}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium mb-1">Creata il</h4>
                      <p>{couple.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-medium mb-3">Membri della Coppia</h4>
                  <div className="space-y-3">
                    {couple.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-3 p-3 rounded-md bg-background/50">
                        <Avatar>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                        {member.id === user?.id && (
                          <Badge>Tu</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="destructive" 
                  onClick={handleLeaveCouple}
                  className="flex items-center"
                >
                  <UserX className="mr-2 h-4 w-4" />
                  Abbandona Coppia
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Heart className="h-16 w-16 text-muted-foreground mb-6" />
              <h2 className="text-2xl font-bold mb-2">Non fai ancora parte di una coppia</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Crea una nuova coppia e invita il tuo partner per iniziare a condividere ricordi insieme.
              </p>
              
              <Dialog open={showCreateCoupleDialog} onOpenChange={setShowCreateCoupleDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Heart className="mr-2 h-4 w-4" />
                    Crea una Coppia
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crea una nuova Coppia</DialogTitle>
                    <DialogDescription>
                      Inserisci le informazioni per creare una nuova coppia.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Nome della Coppia</label>
                      <Input 
                        value={newCoupleName} 
                        onChange={(e) => setNewCoupleName(e.target.value)}
                        placeholder="es. Mario & Lucia"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Descrizione (opzionale)</label>
                      <Textarea 
                        value={newCoupleDescription} 
                        onChange={(e) => setNewCoupleDescription(e.target.value)}
                        placeholder="Raccontaci qualcosa sulla vostra storia..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateCoupleDialog(false)}>Annulla</Button>
                    <Button onClick={handleCreateCouple}>Crea Coppia</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="settings" className="animate-in">
          <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
            <CardHeader>
              <CardTitle>Impostazioni</CardTitle>
              <CardDescription>
                Gestisci le impostazioni del tuo account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Preferenze di Privacy</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Gestisci chi può vedere le tue informazioni e attività.
                </p>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Visibilità Profilo</p>
                    <p className="text-sm text-muted-foreground">Chi può vedere il tuo profilo</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Solo membri della coppia
                  </Button>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <h3 className="font-medium mb-2">Notifiche</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Gestisci come e quando ricevere notifiche.
                </p>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">Notifiche Email</p>
                    <p className="text-sm text-muted-foreground">Ricevi notifiche via email</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Attiva
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Account</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left"
                    disabled
                  >
                    <User className="mr-2 h-4 w-4" />
                    Cambia password
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-left text-destructive hover:text-destructive"
                    disabled
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Elimina account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
