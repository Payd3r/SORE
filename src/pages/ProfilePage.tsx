
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from '@/context/auth-context';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon, Camera, CheckCircle, LogOut, Mail, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { User } from '@/types';

const ProfilePage: React.FC = () => {
  const { user, couple, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState<User | null>(null);
  
  // Couple edit state
  const [editingCouple, setEditingCouple] = useState(false);
  const [coupleFormData, setcoupleFormData] = useState(couple);
  const [anniversaryDate, setAnniversaryDate] = useState<Date | undefined>(
    couple?.anniversaryDate ? new Date(couple.anniversaryDate) : undefined
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  // Start editing profile
  const handleEditProfile = () => {
    setProfileFormData(user);
    setEditingProfile(true);
  };
  
  // Save profile changes
  const handleSaveProfile = () => {
    if (!profileFormData) return;
    
    // In a real app, you would call an API to update the user profile
    console.log('Saving user profile:', profileFormData);
    
    toast.success('Profilo aggiornato con successo');
    setEditingProfile(false);
  };
  
  // Start editing couple info
  const handleEditCouple = () => {
    setcoupleFormData(couple);
    setEditingCouple(true);
  };
  
  // Save couple changes
  const handleSaveCouple = () => {
    if (!coupleFormData) return;
    
    const updatedCouple = {
      ...coupleFormData,
      anniversaryDate: anniversaryDate,
    };
    
    // In a real app, you would call an API to update the couple data
    console.log('Saving couple data:', updatedCouple);
    
    toast.success('Informazioni della coppia aggiornate');
    setEditingCouple(false);
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingProfile(false);
    setEditingCouple(false);
  };
  
  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profileFormData) return;
    
    const { name, value } = e.target;
    setProfileFormData({
      ...profileFormData,
      [name]: value,
    });
  };
  
  // Handle couple form changes
  const handleCoupleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!coupleFormData) return;
    
    const { name, value } = e.target;
    setcoupleFormData({
      ...coupleFormData,
      [name]: value,
    });
  };
  
  // Handle logout
  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };
  
  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Profilo</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci il tuo profilo e le impostazioni dell'account
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-2">
          <TabsTrigger value="profile">Profilo</TabsTrigger>
          <TabsTrigger value="couple">Coppia</TabsTrigger>
        </TabsList>
        
        {/* PROFILE TAB */}
        <TabsContent value="profile" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni personali</CardTitle>
              <CardDescription>
                Gestisci le tue informazioni personali
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingProfile ? (
                // Edit profile form
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center space-y-3">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={profileFormData?.avatar} alt={profileFormData?.name} />
                        <AvatarFallback className="text-xl">{profileFormData?.name ? getInitials(profileFormData.name) : 'U'}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Cambia foto
                      </Button>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome e Cognome</Label>
                          <Input 
                            id="name" 
                            name="name" 
                            value={profileFormData?.name || ''} 
                            onChange={handleProfileChange}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            name="email" 
                            type="email" 
                            value={profileFormData?.email || ''} 
                            onChange={handleProfileChange}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio">Biografia</Label>
                        <Textarea 
                          id="bio" 
                          name="bio" 
                          value={profileFormData?.bio || ''} 
                          onChange={handleProfileChange}
                          rows={4}
                          placeholder="Scrivi qualcosa su di te..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Display profile info
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-3">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="text-xl">{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{user?.name}</h3>
                        <div className="flex items-center text-muted-foreground">
                          <Mail className="h-4 w-4 mr-1" />
                          {user?.email}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Biografia</h4>
                        <p>
                          {user?.bio || 'Nessuna biografia disponibile.'}
                        </p>
                      </div>
                      
                      <div className="pt-2">
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Statistiche</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <div className="text-xl font-bold">12</div>
                            <div className="text-xs text-muted-foreground">Ricordi</div>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <div className="text-xl font-bold">{user?.uploadCount || 0}</div>
                            <div className="text-xs text-muted-foreground">Foto</div>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <div className="text-xl font-bold">5</div>
                            <div className="text-xs text-muted-foreground">Idee</div>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg text-center">
                            <div className="text-xl font-bold">4</div>
                            <div className="text-xs text-muted-foreground">Luoghi</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {editingProfile ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Annulla
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    Salva
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleEditProfile}>
                    <UserIcon className="h-4 w-4 mr-2" />
                    Modifica profilo
                  </Button>
                  <Button variant="destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Privacy e sicurezza</CardTitle>
              <CardDescription>
                Gestisci le impostazioni di privacy e sicurezza
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-medium">Cambia password</h4>
                    <p className="text-sm text-muted-foreground">Aggiorna la tua password per maggiore sicurezza</p>
                  </div>
                  <Button variant="outline">Cambia</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-medium">Autenticazione a due fattori</h4>
                    <p className="text-sm text-muted-foreground">Aumenta la sicurezza del tuo account</p>
                  </div>
                  <Button variant="outline">Attiva</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-medium">Elimina account</h4>
                    <p className="text-sm text-muted-foreground">Elimina definitivamente il tuo account</p>
                  </div>
                  <Button variant="destructive">Elimina</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* COUPLE TAB */}
        <TabsContent value="couple" className="space-y-6 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>La vostra storia</CardTitle>
              <CardDescription>
                Gestisci le informazioni della vostra coppia
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingCouple ? (
                // Edit couple form
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center space-y-3">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={coupleFormData?.avatar} alt={coupleFormData?.name} />
                        <AvatarFallback className="text-xl">{coupleFormData?.name ? coupleFormData.name[0].toUpperCase() : 'C'}</AvatarFallback>
                      </Avatar>
                      <Button variant="outline" size="sm">
                        <Camera className="h-4 w-4 mr-2" />
                        Cambia foto
                      </Button>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="coupleName">Nome della coppia</Label>
                        <Input 
                          id="coupleName" 
                          name="name" 
                          value={coupleFormData?.name || ''} 
                          onChange={handleCoupleChange}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data di inizio</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                coupleFormData?.startDate ? 
                                format(new Date(coupleFormData.startDate), 'dd MMMM yyyy', { locale: it }) : 
                                "Seleziona una data"
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cannot-change">Non modificabile</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Data anniversario</Label>
                          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {anniversaryDate ? (
                                  format(anniversaryDate, 'dd MMMM yyyy', { locale: it })
                                ) : (
                                  <span>Seleziona una data</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={anniversaryDate}
                                onSelect={(date) => {
                                  setAnniversaryDate(date);
                                  setCalendarOpen(false);
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrizione</Label>
                        <Textarea 
                          id="description" 
                          name="description" 
                          value={coupleFormData?.description || ''} 
                          onChange={handleCoupleChange}
                          rows={4}
                          placeholder="Descrivete la vostra storia d'amore..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Display couple info
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center space-y-3">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={couple?.avatar} alt={couple?.name} />
                      <AvatarFallback className="text-xl">{couple?.name ? couple.name[0].toUpperCase() : 'C'}</AvatarFallback>
                    </Avatar>
                    <Badge className="font-medium">
                      {couple?.members?.length === 2 ? 'Coppia' : 'Gruppo'}
                    </Badge>
                  </div>
                  
                  <div className="flex-1">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold">{couple?.name}</h3>
                        <div className="flex items-center text-muted-foreground">
                          {couple?.startDate && (
                            <>
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              Insieme dal {format(new Date(couple.startDate), 'dd MMMM yyyy', { locale: it })}
                            </>
                          )}
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {couple?.description && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">La vostra storia</h4>
                          <p>{couple.description}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-2">Membri</h4>
                        <div className="space-y-2">
                          {couple?.members.map((member, idx) => (
                            <div key={idx} className="flex items-center py-2 pl-2 pr-4 rounded-lg bg-muted/50">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={member.avatar} alt={member.name} />
                                <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium">{member.name}</div>
                                <div className="text-xs text-muted-foreground">{member.email}</div>
                              </div>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {couple?.anniversaryDate && (
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">Data importante</h4>
                          <div className="flex items-center text-primary">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span>Anniversario: {format(new Date(couple.anniversaryDate), 'dd MMMM', { locale: it })}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {editingCouple ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Annulla
                  </Button>
                  <Button onClick={handleSaveCouple}>
                    Salva
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={handleEditCouple}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
              )}
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Inviti e gestione</CardTitle>
              <CardDescription>
                Gestisci gli inviti e i membri della coppia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Invita un nuovo membro</h4>
                  <div className="flex gap-2">
                    <Input placeholder="Email della persona" className="flex-1" />
                    <Button>Invita</Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-medium">Codice di invito</h4>
                    <p className="text-sm text-muted-foreground">Condividi questo codice per permettere ad altri di unirsi</p>
                  </div>
                  <Button variant="outline">Genera codice</Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="font-medium">Abbandona la coppia</h4>
                    <p className="text-sm text-muted-foreground">Esci da questa coppia</p>
                  </div>
                  <Button variant="destructive">Abbandona</Button>
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
