import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Calendar, Check, Edit, LogOut, Plus, X } from 'lucide-react';
import { format, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';
import { it } from 'date-fns/locale';

const ProfilePage: React.FC = () => {
  const { user, couple, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingCouple, setIsEditingCouple] = useState(false);
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  const startDate = couple?.startDate ? new Date(couple.startDate) : null;
  
  const daysTogether = startDate ? differenceInDays(new Date(), startDate) : 0;
  const monthsTogether = startDate ? differenceInMonths(new Date(), startDate) : 0;
  const yearsTogether = startDate ? differenceInYears(new Date(), startDate) : 0;
  
  const handleLogout = async () => {
    await signOut();
  };
  
  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Il tuo profilo</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci le tue informazioni personali e della coppia
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni personali</CardTitle>
            <CardDescription>
              Dettagli del tuo account
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold">{user.name}</h4>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="space-y-1">
                <p className="text-sm font-medium">Nome</p>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              {user.bio && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Bio</p>
                  <p className="text-sm text-muted-foreground">{user.bio}</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifica profilo
            </Button>
          </CardFooter>
        </Card>
        
        {/* Couple Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni della coppia</CardTitle>
            <CardDescription>
              Dettagli della vostra relazione
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {couple ? (
              <div className="space-y-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Nome della coppia</p>
                  <p className="text-sm text-muted-foreground">{couple.name}</p>
                </div>
                {couple.description && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Descrizione</p>
                    <p className="text-sm text-muted-foreground">{couple.description}</p>
                  </div>
                )}
                {startDate && (
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Data di inizio</p>
                    <p className="text-sm text-muted-foreground">
                      {format(startDate, 'PPP', { locale: it })}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="col-span-1">
                    <CardHeader className="p-2">
                      <CardTitle className="text-sm font-medium">Giorni</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center p-2">
                      <p className="text-2xl font-bold">{daysTogether}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1">
                    <CardHeader className="p-2">
                      <CardTitle className="text-sm font-medium">Mesi</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center p-2">
                      <p className="text-2xl font-bold">{monthsTogether}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1">
                    <CardHeader className="p-2">
                      <CardTitle className="text-sm font-medium">Anni</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center p-2">
                      <p className="text-2xl font-bold">{yearsTogether}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Non fai ancora parte di una coppia.
                </p>
                <Button variant="link">
                  <Plus className="h-4 w-4 mr-2" />
                  Crea una coppia
                </Button>
                <Button variant="link">
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi ID coppia
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            {couple ? (
              <Button onClick={() => setIsEditingCouple(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica coppia
              </Button>
            ) : (
              <Button onClick={() => setIsEditingCouple(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crea una coppia
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <Separator className="my-6" />
      
      <div className="flex justify-end">
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default ProfilePage;
