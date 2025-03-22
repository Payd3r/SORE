
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookMarked, Calendar, Lightbulb, Map, Camera, Music2, BarChart3, ChevronRight, PieChart, User } from 'lucide-react';
import { Idea, Memory, Image, User as UserType } from '@/types';
import { useAuth } from '@/context/auth-context';
import { formatDistanceToNow, format, differenceInDays, differenceInMonths, addMonths, isSameMonth, getMonth } from 'date-fns';
import { it } from 'date-fns/locale';

// Mock data for the RecapPage
const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'Viaggio a Parigi',
    description: 'Un weekend romantico a Parigi',
    type: 'travel',
    completed: true,
    completedAt: new Date('2023-05-15'),
    completedById: '1',
    completedByName: 'Mario Rossi',
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date('2023-03-01')
  },
  {
    id: '2',
    title: 'Cena al ristorante stellato',
    description: 'Provare il nuovo ristorante italiano in centro',
    type: 'restaurant',
    completed: false,
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date('2023-06-10')
  },
  {
    id: '3',
    title: 'Imparare a ballare insieme',
    description: 'Prendere lezioni di ballo',
    type: 'general',
    completed: true,
    completedAt: new Date('2023-04-20'),
    completedById: '2',
    completedByName: 'Giulia Bianchi',
    userId: '2',
    creatorName: 'Giulia Bianchi',
    coupleId: 'couple1',
    createdAt: new Date('2023-02-15')
  },
  {
    id: '4',
    title: 'Fare un picnic nel parco',
    description: 'Organizzare un picnic al parco cittadino',
    type: 'general',
    completed: false,
    userId: '2',
    creatorName: 'Giulia Bianchi',
    coupleId: 'couple1',
    createdAt: new Date('2023-06-20')
  },
  {
    id: '5',
    title: 'Maratona di 10km insieme',
    description: 'Allenarsi e partecipare alla maratona cittadina',
    type: 'challenge',
    completed: true,
    completedAt: new Date('2023-05-28'),
    completedById: '1',
    completedByName: 'Mario Rossi',
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date('2023-01-10')
  }
];

// Create mock memories (simplified from MemoriesPage)
const mockMemories: Memory[] = [
  {
    id: '1',
    type: 'travel',
    title: 'Vacanza a Roma',
    description: 'Una settimana nella città eterna',
    startDate: new Date('2023-06-10'),
    endDate: new Date('2023-06-15'),
    song: 'Perfect - Ed Sheeran',
    location: { latitude: 41.9028, longitude: 12.4964, name: 'Roma, Italia' },
    eventTag: 'anniversary',
    images: [],
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date('2023-05-15'),
    updatedAt: new Date('2023-05-15')
  },
  {
    id: '2',
    type: 'event',
    title: 'Compleanno di Sara',
    description: 'Festa a sorpresa',
    startDate: new Date('2023-04-15'),
    eventTag: 'birthday',
    location: { latitude: 45.4642, longitude: 9.1900, name: 'Milano, Italia' },
    images: [],
    userId: '2',
    creatorName: 'Giulia Bianchi',
    coupleId: 'couple1',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-10')
  },
  {
    id: '3',
    type: 'simple',
    title: 'Passeggiata al Parco',
    description: 'Una bella giornata di primavera',
    startDate: new Date('2023-05-20'),
    location: { latitude: 45.4773, longitude: 9.1815, name: 'Parco Sempione, Milano' },
    images: [],
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date('2023-05-20'),
    updatedAt: new Date('2023-05-20')
  },
  {
    id: '4',
    type: 'travel',
    title: 'Weekend a Firenze',
    description: 'Visita ai musei e buon cibo',
    startDate: new Date('2023-07-22'),
    endDate: new Date('2023-07-24'),
    song: 'Volare - Gipsy Kings',
    location: { latitude: 43.7696, longitude: 11.2558, name: 'Firenze, Italia' },
    images: [],
    userId: '2',
    creatorName: 'Giulia Bianchi',
    coupleId: 'couple1',
    createdAt: new Date('2023-07-15'),
    updatedAt: new Date('2023-07-15')
  },
  {
    id: '5',
    type: 'event',
    title: 'Concerto insieme',
    description: 'Concerto dei Queen',
    startDate: new Date('2023-08-15'),
    song: 'Bohemian Rhapsody - Queen',
    location: { latitude: 45.4785, longitude: 9.1217, name: 'San Siro, Milano' },
    eventTag: 'gift',
    images: [],
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2023-08-01')
  }
];

// Mock images
const mockImages = Array(50).fill(null).map((_, index) => {
  const users = [
    { id: '1', name: 'Mario Rossi' },
    { id: '2', name: 'Giulia Bianchi' }
  ];
  const types = ['landscape', 'singlePerson', 'couple'];
  const userIndex = index % 2;
  const date = new Date();
  date.setDate(date.getDate() - (index * 3));
  
  return {
    id: `img-${index}`,
    name: `Immagine ${index+1}`,
    url: `https://picsum.photos/seed/${index+100}/800/600`,
    thumbnailUrl: `https://picsum.photos/seed/${index+100}/200/200`,
    date,
    type: types[index % 3] as any,
    location: index % 4 === 0 ? undefined : {
      latitude: 45.4642 + (Math.random() * 0.1 - 0.05),
      longitude: 9.1900 + (Math.random() * 0.1 - 0.05),
      name: 'Milano, Italia'
    },
    userId: users[userIndex].id,
    uploaderName: users[userIndex].name,
    coupleId: 'couple1',
    createdAt: date,
    isFavorite: index % 5 === 0
  };
});

// Mock users
const mockUsers: UserType[] = [
  {
    id: '1',
    name: 'Mario Rossi',
    email: 'mario.rossi@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Mario+Rossi&background=random',
    bio: 'Amante dei viaggi e della fotografia',
    uploadCount: 25
  },
  {
    id: '2',
    name: 'Giulia Bianchi',
    email: 'giulia.bianchi@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Giulia+Bianchi&background=random',
    bio: 'Appassionata di musica e cucina',
    uploadCount: 25
  }
];

const RecapPage: React.FC = () => {
  const { couple } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Mock data for charts
  const completedIdeas = mockIdeas.filter(idea => idea.completed);
  const pendingIdeas = mockIdeas.filter(idea => !idea.completed);
  const totalImages = mockImages.length;
  const favoriteImages = mockImages.filter(img => img.isFavorite).length;
  
  // Calculate stats by user
  const userStats = mockUsers.map(user => {
    const userMemories = mockMemories.filter(memory => memory.userId === user.id);
    const userIdeasCreated = mockIdeas.filter(idea => idea.userId === user.id);
    const userIdeasCompleted = mockIdeas.filter(idea => idea.completedById === user.id);
    const userImages = mockImages.filter(img => img.userId === user.id);
    
    return {
      user,
      memories: userMemories.length,
      ideasCreated: userIdeasCreated.length,
      ideasCompleted: userIdeasCompleted.length,
      images: userImages.length,
      favoriteImages: userImages.filter(img => img.isFavorite).length
    };
  });
  
  // Calculate location stats
  const locationStats = {} as Record<string, number>;
  mockMemories.forEach(memory => {
    if (memory.location?.name) {
      const locationName = memory.location.name.split(',')[0].trim();
      locationStats[locationName] = (locationStats[locationName] || 0) + 1;
    }
  });
  
  const topLocations = Object.entries(locationStats)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5);
  
  // Calculate memories by type
  const memoriesByType = {
    travel: mockMemories.filter(m => m.type === 'travel').length,
    event: mockMemories.filter(m => m.type === 'event').length,
    simple: mockMemories.filter(m => m.type === 'simple').length
  };

  // Calculate images by type
  const imagesByType = {
    landscape: mockImages.filter(img => img.type === 'landscape').length,
    singlePerson: mockImages.filter(img => img.type === 'singlePerson').length,
    couple: mockImages.filter(img => img.type === 'couple').length
  };
  
  // Calculate activity by month (past 6 months)
  const getActivityByMonth = () => {
    const now = new Date();
    const months = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = addMonths(now, -i);
      const monthName = format(monthDate, 'MMM', { locale: it });
      
      const memoriesInMonth = mockMemories.filter(m => 
        isSameMonth(new Date(m.createdAt), monthDate)
      ).length;
      
      const imagesInMonth = mockImages.filter(img => 
        isSameMonth(new Date(img.createdAt), monthDate)
      ).length;
      
      const ideasInMonth = mockIdeas.filter(idea => 
        isSameMonth(new Date(idea.createdAt), monthDate)
      ).length;
      
      months.push({
        month: monthName,
        memories: memoriesInMonth,
        images: imagesInMonth,
        ideas: ideasInMonth
      });
    }
    
    return months;
  };
  
  const activityByMonth = getActivityByMonth();
  
  // Relationship duration
  const getCoupleStats = () => {
    if (!couple || !couple.startDate) {
      return {
        days: 0,
        months: 0,
        anniversaryDate: undefined
      };
    }
    
    const startDate = new Date(couple.startDate);
    const today = new Date();
    
    return {
      days: differenceInDays(today, startDate),
      months: differenceInMonths(today, startDate),
      anniversaryDate: couple.anniversaryDate
    };
  };
  
  const coupleStats = getCoupleStats();

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-4xl font-bold">Recap</h1>
        <p className="text-muted-foreground mt-1">
          Statistiche e analisi dei vostri ricordi insieme
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="activities">Attività</TabsTrigger>
          <TabsTrigger value="comparison">Confronto</TabsTrigger>
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6 animate-fade-in">
          {/* Hero stats card */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="text-xl">La vostra storia</CardTitle>
              <CardDescription>
                Insieme da {coupleStats.days} giorni ({coupleStats.months} mesi)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card p-4 rounded-lg text-center shadow-sm">
                  <div className="text-3xl font-bold text-primary">{mockMemories.length}</div>
                  <div className="text-sm text-muted-foreground">Ricordi</div>
                </div>
                
                <div className="bg-card p-4 rounded-lg text-center shadow-sm">
                  <div className="text-3xl font-bold text-primary">{mockImages.length}</div>
                  <div className="text-sm text-muted-foreground">Foto</div>
                </div>
                
                <div className="bg-card p-4 rounded-lg text-center shadow-sm">
                  <div className="text-3xl font-bold text-primary">{mockIdeas.length}</div>
                  <div className="text-sm text-muted-foreground">Idee</div>
                </div>
                
                <div className="bg-card p-4 rounded-lg text-center shadow-sm">
                  <div className="text-3xl font-bold text-primary">
                    {Object.keys(locationStats).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Luoghi</div>
                </div>
              </div>
              
              {coupleStats.anniversaryDate && (
                <div className="mt-6 p-4 bg-card rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <span className="font-medium">Prossimo anniversario</span>
                    </div>
                    <Badge>{format(coupleStats.anniversaryDate, 'dd/MM/yyyy')}</Badge>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {formatDistanceToNow(coupleStats.anniversaryDate, { addSuffix: true, locale: it })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Stats grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Memories by type */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BookMarked className="h-5 w-5 mr-2 text-primary" />
                  Ricordi per tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Viaggi</span>
                      <span className="font-medium">{memoriesByType.travel}</span>
                    </div>
                    <Progress value={(memoriesByType.travel / mockMemories.length) * 100} className="h-2 bg-blue-100" indicatorClassName="bg-blue-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Eventi</span>
                      <span className="font-medium">{memoriesByType.event}</span>
                    </div>
                    <Progress value={(memoriesByType.event / mockMemories.length) * 100} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Semplici</span>
                      <span className="font-medium">{memoriesByType.simple}</span>
                    </div>
                    <Progress value={(memoriesByType.simple / mockMemories.length) * 100} className="h-2 bg-green-100" indicatorClassName="bg-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Ideas stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                  Idee e progetti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-40">
                  <div className="grid grid-cols-2 gap-6 w-full">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-500">{completedIdeas.length}</div>
                      <div className="text-sm text-muted-foreground">Completate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-amber-500">{pendingIdeas.length}</div>
                      <div className="text-sm text-muted-foreground">Da fare</div>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-sm text-muted-foreground mb-2">Progresso totale</div>
                  <Progress 
                    value={(completedIdeas.length / mockIdeas.length) * 100} 
                    className="h-2"
                  />
                  <div className="text-right text-xs text-muted-foreground mt-1">
                    {Math.round((completedIdeas.length / mockIdeas.length) * 100)}%
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Photos stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Camera className="h-5 w-5 mr-2 text-primary" />
                  Fotografie
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold">{totalImages}</div>
                      <div className="text-xs text-muted-foreground">Totali</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-500">{favoriteImages}</div>
                      <div className="text-xs text-muted-foreground">Preferite</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm mb-2">Tipo di foto</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Paesaggi</span>
                        <span>{imagesByType.landscape}</span>
                      </div>
                      <Progress value={(imagesByType.landscape / totalImages) * 100} className="h-1.5 bg-cyan-100" indicatorClassName="bg-cyan-500" />
                      
                      <div className="flex justify-between text-xs">
                        <span>Persone</span>
                        <span>{imagesByType.singlePerson}</span>
                      </div>
                      <Progress value={(imagesByType.singlePerson / totalImages) * 100} className="h-1.5 bg-indigo-100" indicatorClassName="bg-indigo-500" />
                      
                      <div className="flex justify-between text-xs">
                        <span>Coppia</span>
                        <span>{imagesByType.couple}</span>
                      </div>
                      <Progress value={(imagesByType.couple / totalImages) * 100} className="h-1.5 bg-rose-100" indicatorClassName="bg-rose-500" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Top locations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Map className="h-5 w-5 mr-2 text-primary" />
                  Luoghi più visitati
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topLocations.map(([location, count], index) => (
                    <div key={location} className="flex items-center">
                      <div className="bg-muted w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{location}</span>
                          <span className="text-sm text-muted-foreground">{count} ricordi</span>
                        </div>
                        <Progress 
                          value={(count / topLocations[0][1]) * 100} 
                          className="h-1.5"
                        />
                      </div>
                    </div>
                  ))}
                  
                  {topLocations.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      Nessun luogo visitato ancora.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Songs */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Music2 className="h-5 w-5 mr-2 text-primary" />
                  Canzoni dei ricordi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMemories
                    .filter(m => m.song)
                    .slice(0, 5)
                    .map((memory, idx) => (
                      <div key={idx} className="flex items-center p-2 rounded-md hover:bg-muted/50">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-3 text-primary">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium">{memory.song}</div>
                          <div className="text-xs text-muted-foreground">{memory.title}</div>
                        </div>
                      </div>
                    ))}
                  
                  {mockMemories.filter(m => m.song).length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      Nessuna canzone nei ricordi.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Monthly activity */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Attività mensile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-end justify-between gap-1">
                  {activityByMonth.map((data, idx) => {
                    const total = data.memories + data.images + data.ideas;
                    const maxTotal = Math.max(...activityByMonth.map(m => m.memories + m.images + m.ideas));
                    const height = total > 0 ? (total / maxTotal) * 100 : 0;
                    
                    return (
                      <div key={idx} className="flex flex-col items-center w-full">
                        <div className="w-full flex flex-col-reverse h-40">
                          {data.ideas > 0 && (
                            <div 
                              className="w-full bg-amber-400 rounded-t-sm" 
                              style={{ height: `${(data.ideas / total) * height}%` }}
                            ></div>
                          )}
                          {data.memories > 0 && (
                            <div 
                              className="w-full bg-blue-400" 
                              style={{ height: `${(data.memories / total) * height}%` }}
                            ></div>
                          )}
                          {data.images > 0 && (
                            <div 
                              className="w-full bg-purple-400 rounded-t-sm" 
                              style={{ height: `${(data.images / total) * height}%` }}
                            ></div>
                          )}
                        </div>
                        <div className="text-xs mt-1">{data.month}</div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-center mt-2 gap-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-sm mr-1"></div>
                    <span className="text-xs">Ricordi</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-purple-400 rounded-sm mr-1"></div>
                    <span className="text-xs">Foto</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-400 rounded-sm mr-1"></div>
                    <span className="text-xs">Idee</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* ACTIVITIES TAB */}
        <TabsContent value="activities" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Attività recenti</CardTitle>
                <CardDescription>
                  Le ultime attività della coppia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recent activities would be listed here */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    Implementazione in arrivo...
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
                <CardDescription>
                  La vostra storia nel tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/50">
                  Implementazione in arrivo...
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* COMPARISON TAB */}
        <TabsContent value="comparison" className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2 text-primary" />
                  Confronto attività
                </CardTitle>
                <CardDescription>
                  Chi contribuisce di più alla vostra storia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {userStats.map((stat, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src={stat.user.avatar}
                            alt={stat.user.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{stat.user.name}</div>
                          <div className="text-sm text-muted-foreground">{stat.user.bio}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Ricordi creati</div>
                          <div className="flex items-end gap-2">
                            <div className="text-2xl font-bold">{stat.memories}</div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {Math.round((stat.memories / mockMemories.length) * 100)}%
                            </div>
                          </div>
                          <Progress 
                            value={(stat.memories / mockMemories.length) * 100} 
                            className="h-1.5"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Foto caricate</div>
                          <div className="flex items-end gap-2">
                            <div className="text-2xl font-bold">{stat.images}</div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {Math.round((stat.images / mockImages.length) * 100)}%
                            </div>
                          </div>
                          <Progress 
                            value={(stat.images / mockImages.length) * 100} 
                            className="h-1.5"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Idee proposte</div>
                          <div className="flex items-end gap-2">
                            <div className="text-2xl font-bold">{stat.ideasCreated}</div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {Math.round((stat.ideasCreated / mockIdeas.length) * 100)}%
                            </div>
                          </div>
                          <Progress 
                            value={(stat.ideasCreated / mockIdeas.length) * 100} 
                            className="h-1.5"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Idee completate</div>
                          <div className="flex items-end gap-2">
                            <div className="text-2xl font-bold">{stat.ideasCompleted}</div>
                            <div className="text-xs text-muted-foreground mb-1">
                              {completedIdeas.length > 0 ? Math.round((stat.ideasCompleted / completedIdeas.length) * 100) : 0}%
                            </div>
                          </div>
                          <Progress 
                            value={completedIdeas.length > 0 ? (stat.ideasCompleted / completedIdeas.length) * 100 : 0} 
                            className="h-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary" />
                  Stats personali
                </CardTitle>
                <CardDescription>
                  Statistiche dettagliate per utente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="user-1">
                  <TabsList className="w-full">
                    {userStats.map((stat, idx) => (
                      <TabsTrigger key={idx} value={`user-${idx+1}`}>
                        {stat.user.name.split(' ')[0]}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {userStats.map((stat, idx) => (
                    <TabsContent key={idx} value={`user-${idx+1}`} className="mt-4 space-y-6">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-primary">{stat.memories}</div>
                          <div className="text-xs text-muted-foreground">Ricordi</div>
                        </div>
                        
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-primary">{stat.images}</div>
                          <div className="text-xs text-muted-foreground">Foto</div>
                        </div>
                        
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-primary">{stat.ideasCreated}</div>
                          <div className="text-xs text-muted-foreground">Idee</div>
                        </div>
                        
                        <div className="bg-muted/50 p-3 rounded-lg text-center">
                          <div className="text-xl font-bold text-primary">{stat.favoriteImages}</div>
                          <div className="text-xs text-muted-foreground">Preferiti</div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Contributi</h3>
                        
                        <div className="space-y-2">
                          <div className="text-sm">Percentuale ricordi creati</div>
                          <div className="flex items-center gap-4">
                            <Progress 
                              value={(stat.memories / mockMemories.length) * 100}
                              className="h-2.5 flex-grow"
                            />
                            <span className="text-sm font-medium">
                              {Math.round((stat.memories / mockMemories.length) * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">Percentuale foto caricate</div>
                          <div className="flex items-center gap-4">
                            <Progress 
                              value={(stat.images / mockImages.length) * 100}
                              className="h-2.5 flex-grow"
                            />
                            <span className="text-sm font-medium">
                              {Math.round((stat.images / mockImages.length) * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm">Percentuale idee proposte</div>
                          <div className="flex items-center gap-4">
                            <Progress 
                              value={(stat.ideasCreated / mockIdeas.length) * 100}
                              className="h-2.5 flex-grow"
                            />
                            <span className="text-sm font-medium">
                              {Math.round((stat.ideasCreated / mockIdeas.length) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-muted/50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium mb-3">Attività recente</h3>
                        <div className="text-center text-muted-foreground p-4">
                          Implementazione in arrivo...
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecapPage;
