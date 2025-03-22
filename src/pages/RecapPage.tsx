
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookMarked, CalendarDays, MapPin, Image as ImageIcon, Heart, Star, Music2, Users } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockMemories } from './MemoriesPage';
import { Memory, Idea, Image, ImageType } from '@/types';
import { useAuth } from '@/context/auth-context';

// Mock data for ideas
const mockIdeas: Idea[] = [
  { 
    id: '1', 
    title: 'Weekend a Venezia', 
    type: 'travel', 
    completed: true, 
    completedAt: new Date('2023-09-15'), 
    completedById: '1',
    completedByName: 'Mario Rossi',
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date('2023-08-10')
  },
  { 
    id: '2', 
    title: 'Cena al ristorante stellato', 
    type: 'restaurant', 
    completed: false,
    userId: '2',
    creatorName: 'Laura Bianchi',
    coupleId: 'couple1',
    createdAt: new Date('2023-08-15')
  },
  { 
    id: '3', 
    title: 'Concerto di Ed Sheeran', 
    type: 'general', 
    completed: true, 
    completedAt: new Date('2023-09-10'), 
    completedById: '2',
    completedByName: 'Laura Bianchi',
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date('2023-08-05')
  },
  { 
    id: '4', 
    title: 'Escursione in montagna', 
    type: 'general', 
    completed: false,
    userId: '1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date('2023-08-20')
  },
  { 
    id: '5', 
    title: 'Visita al museo', 
    type: 'challenge', 
    completed: true, 
    completedAt: new Date('2023-09-05'), 
    completedById: '1',
    completedByName: 'Mario Rossi',
    userId: '2',
    creatorName: 'Laura Bianchi',
    coupleId: 'couple1',
    createdAt: new Date('2023-07-25')
  }
];

// Mock images for gallery stats
const mockImages: Image[] = [
  ...mockMemories.flatMap(memory => memory.images)
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const RecapPage: React.FC = () => {
  const { user, couple } = useAuth();
  const [timeRange, setTimeRange] = useState<'all' | 'year' | 'month' | 'week'>('all');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Generate statistics based on the data
  const stats = {
    totalMemories: mockMemories.length,
    totalIdeas: mockIdeas.length,
    completedIdeas: mockIdeas.filter(i => i.completed).length,
    totalPhotos: mockImages.length,
    totalLocations: [...new Set(mockMemories.map(m => m.location?.name).filter(Boolean))].length,
    totalSongs: [...new Set(mockMemories.filter(m => m.song).map(m => m.song))].length,
  };

  // User comparison stats
  const userStats = {
    'user1': {
      name: 'Mario Rossi',
      id: '1',
      memoriesCreated: mockMemories.filter(m => m.userId === '1').length,
      ideasCreated: mockIdeas.filter(i => i.userId === '1').length,
      ideasCompleted: mockIdeas.filter(i => i.completedById === '1').length,
      photosUploaded: mockImages.filter(i => i.userId === '1').length,
    },
    'user2': {
      name: 'Laura Bianchi',
      id: '2',
      memoriesCreated: mockMemories.filter(m => m.userId === '2').length,
      ideasCreated: mockIdeas.filter(i => i.userId === '2').length,
      ideasCompleted: mockIdeas.filter(i => i.completedById === '2').length,
      photosUploaded: mockImages.filter(i => i.userId === '2').length,
    }
  };

  // Prepare chart data
  const memoryTypeData = [
    { name: 'Viaggi', value: mockMemories.filter(m => m.type === 'travel').length },
    { name: 'Eventi', value: mockMemories.filter(m => m.type === 'event').length },
    { name: 'Semplici', value: mockMemories.filter(m => m.type === 'simple').length },
  ];

  const ideaTypeData = [
    { name: 'Viaggi', value: mockIdeas.filter(i => i.type === 'travel').length },
    { name: 'Ristoranti', value: mockIdeas.filter(i => i.type === 'restaurant').length },
    { name: 'Generiche', value: mockIdeas.filter(i => i.type === 'general').length },
    { name: 'Sfide', value: mockIdeas.filter(i => i.type === 'challenge').length },
  ];

  const imageTypeData = [
    { name: 'Paesaggi', value: mockImages.filter(i => i.type === 'landscape').length },
    { name: 'Persona singola', value: mockImages.filter(i => i.type === 'singlePerson').length },
    { name: 'Coppia', value: mockImages.filter(i => i.type === 'couple').length },
  ];

  const eventTagData = [
    { name: 'Compleanno', value: mockMemories.filter(m => m.eventTag === 'birthday').length },
    { name: 'Regalo', value: mockMemories.filter(m => m.eventTag === 'gift').length },
    { name: 'Anniversario', value: mockMemories.filter(m => m.eventTag === 'anniversary').length },
    { name: 'Vacanza', value: mockMemories.filter(m => m.eventTag === 'holiday').length },
    { name: 'Altro', value: mockMemories.filter(m => m.eventTag === 'other').length },
  ];

  // Timeline data by month
  const timelineData = (() => {
    const months: Record<string, { memories: number; ideas: number; photos: number }> = {};
    
    // Get start and end dates
    const now = new Date();
    const startDate = new Date(now);
    startDate.setFullYear(startDate.getFullYear() - 1);
    
    // Initialize all months
    for (let d = new Date(startDate); d <= now; d.setMonth(d.getMonth() + 1)) {
      const monthKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      months[monthKey] = { memories: 0, ideas: 0, photos: 0 };
    }
    
    // Count items by month
    mockMemories.forEach(memory => {
      const date = memory.createdAt;
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (months[monthKey]) {
        months[monthKey].memories += 1;
        months[monthKey].photos += memory.images.length;
      }
    });
    
    mockIdeas.forEach(idea => {
      const date = idea.createdAt;
      const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (months[monthKey]) {
        months[monthKey].ideas += 1;
      }
    });
    
    // Format for chart
    return Object.entries(months).map(([month, counts]) => {
      const [year, monthNum] = month.split('-');
      return {
        month: `${monthNum}/${year.slice(2)}`,
        ...counts
      };
    });
  })();

  // Comparison chart data
  const comparisonData = [
    { name: 'Ricordi creati', user1: userStats.user1.memoriesCreated, user2: userStats.user2.memoriesCreated },
    { name: 'Idee proposte', user1: userStats.user1.ideasCreated, user2: userStats.user2.ideasCreated },
    { name: 'Idee completate', user1: userStats.user1.ideasCompleted, user2: userStats.user2.ideasCompleted },
    { name: 'Foto caricate', user1: userStats.user1.photosUploaded, user2: userStats.user2.photosUploaded },
  ];

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold">Recap</h1>
          <p className="text-muted-foreground mt-1">
            Statistiche e riassunto della vostra storia d'amore
          </p>
        </div>
        <Select 
          value={timeRange} 
          onValueChange={(value: 'all' | 'year' | 'month' | 'week') => setTimeRange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutto il tempo</SelectItem>
            <SelectItem value="year">Ultimo anno</SelectItem>
            <SelectItem value="month">Ultimo mese</SelectItem>
            <SelectItem value="week">Ultima settimana</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full grid grid-cols-2 mb-6">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="comparison">Confronto</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center">
                  <BookMarked className="mr-2 h-6 w-6 text-primary" />
                  {stats.totalMemories}
                </CardTitle>
                <CardDescription>Ricordi totali</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                    {mockMemories.filter(m => m.type === 'travel').length} viaggi
                  </Badge>
                  <Badge variant="outline" className="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300">
                    {mockMemories.filter(m => m.type === 'event').length} eventi
                  </Badge>
                  <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300">
                    {mockMemories.filter(m => m.type === 'simple').length} semplici
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center">
                  <Star className="mr-2 h-6 w-6 text-primary" />
                  {stats.totalIdeas}
                </CardTitle>
                <CardDescription>Idee totali</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300">
                    {stats.completedIdeas} completate
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300">
                    {stats.totalIdeas - stats.completedIdeas} da fare
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center">
                  <ImageIcon className="mr-2 h-6 w-6 text-primary" />
                  {stats.totalPhotos}
                </CardTitle>
                <CardDescription>Foto totali</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                    {mockImages.filter(i => i.type === 'landscape').length} paesaggi
                  </Badge>
                  <Badge variant="outline" className="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
                    {mockImages.filter(i => i.type === 'singlePerson').length} singole
                  </Badge>
                  <Badge variant="outline" className="bg-pink-50 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300">
                    {mockImages.filter(i => i.type === 'couple').length} coppia
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center">
                  <MapPin className="mr-2 h-6 w-6 text-primary" />
                  {stats.totalLocations}
                </CardTitle>
                <CardDescription>Luoghi visitati</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Avete visitato {stats.totalLocations} posti diversi insieme.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center">
                  <Music2 className="mr-2 h-6 w-6 text-primary" />
                  {stats.totalSongs}
                </CardTitle>
                <CardDescription>Canzoni collegate</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Avete {stats.totalSongs} canzoni che vi ricordano momenti speciali.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl flex items-center">
                  <Heart className="mr-2 h-6 w-6 text-primary" />
                  {couple ? couple.anniversaryDate ? 
                    Math.floor((new Date().getTime() - new Date(couple.anniversaryDate).getTime()) / (1000 * 60 * 60 * 24)) : 
                    '?' : '?'}
                </CardTitle>
                <CardDescription>Giorni insieme</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  State costruendo i vostri ricordi insieme da {couple ? couple.anniversaryDate ? 
                    Math.floor((new Date().getTime() - new Date(couple.anniversaryDate).getTime()) / (1000 * 60 * 60 * 24)) : 
                    '?' : '?'} giorni.
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tipi di ricordi</CardTitle>
                <CardDescription>
                  Distribuzione dei ricordi per tipologia
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={memoryTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {memoryTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tipi di idee</CardTitle>
                <CardDescription>
                  Distribuzione delle idee per tipologia
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ideaTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {ideaTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tipi di immagini</CardTitle>
                <CardDescription>
                  Distribuzione delle immagini per tipologia
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={imageTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={90}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {imageTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Crescita nel tempo</CardTitle>
                <CardDescription>
                  Andamento di ricordi, idee e foto negli ultimi 12 mesi
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timelineData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="memories" name="Ricordi" fill="#0088FE" />
                    <Bar dataKey="ideas" name="Idee" fill="#00C49F" />
                    <Bar dataKey="photos" name="Foto" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Comparison tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Confronto tra partner</CardTitle>
              <CardDescription>
                Chi contribuisce di più alla vostra storia?
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparisonData}
                  layout="vertical"
                  margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="user1" name={userStats.user1.name} fill="#8884d8" />
                  <Bar dataKey="user2" name={userStats.user2.name} fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  {userStats.user1.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <dt className="text-muted-foreground">Ricordi creati:</dt>
                  <dd className="font-medium">{userStats.user1.memoriesCreated}</dd>
                  
                  <dt className="text-muted-foreground">Idee proposte:</dt>
                  <dd className="font-medium">{userStats.user1.ideasCreated}</dd>
                  
                  <dt className="text-muted-foreground">Idee realizzate:</dt>
                  <dd className="font-medium">{userStats.user1.ideasCompleted}</dd>
                  
                  <dt className="text-muted-foreground">Foto caricate:</dt>
                  <dd className="font-medium">{userStats.user1.photosUploaded}</dd>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  {userStats.user2.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                  <dt className="text-muted-foreground">Ricordi creati:</dt>
                  <dd className="font-medium">{userStats.user2.memoriesCreated}</dd>
                  
                  <dt className="text-muted-foreground">Idee proposte:</dt>
                  <dd className="font-medium">{userStats.user2.ideasCreated}</dd>
                  
                  <dt className="text-muted-foreground">Idee realizzate:</dt>
                  <dd className="font-medium">{userStats.user2.ideasCompleted}</dd>
                  
                  <dt className="text-muted-foreground">Foto caricate:</dt>
                  <dd className="font-medium">{userStats.user2.photosUploaded}</dd>
                </dl>
              </CardContent>
            </Card>
          </div>
          
          {/* Winner card */}
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-center">
                {userStats.user1.memoriesCreated + userStats.user1.ideasCreated + 
                 userStats.user1.ideasCompleted + userStats.user1.photosUploaded >
                 userStats.user2.memoriesCreated + userStats.user2.ideasCreated + 
                 userStats.user2.ideasCompleted + userStats.user2.photosUploaded
                 ? userStats.user1.name : userStats.user2.name} vince!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p>
                {userStats.user1.memoriesCreated + userStats.user1.ideasCreated + 
                 userStats.user1.ideasCompleted + userStats.user1.photosUploaded >
                 userStats.user2.memoriesCreated + userStats.user2.ideasCreated + 
                 userStats.user2.ideasCompleted + userStats.user2.photosUploaded
                 ? userStats.user1.name : userStats.user2.name} contribuisce di più alla vostra storia d'amore!
              </p>
              <p className="mt-2 text-sm opacity-80">Ma ricorda, l'amore non è una competizione... o forse sì? 😉</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecapPage;
