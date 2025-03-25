
import React from 'react';
import { 
  BarChart3, 
  BookMarked, 
  Calendar, 
  Image as ImageIcon, 
  Lightbulb, 
  MapPin, 
  CheckCircle,
  Award
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stats, Memory, MemoryType, IdeaType } from '@/types';
import { Progress } from '@/components/ui/progress';

// Mock data for statistics
const mockStats: Stats = {
  totalMemories: 5,
  memoriesByType: {
    travel: 2,
    event: 2,
    simple: 1
  },
  totalImages: 50,
  totalIdeas: 8,
  completedIdeas: 3,
  ideasByType: {
    travel: 2,
    restaurant: 2,
    general: 2,
    challenge: 2
  },
  locationsVisited: 8
};

// Mock data for top locations
const mockTopLocations = [
  { name: 'Roma, Italia', count: 15 },
  { name: 'Milano, Italia', count: 12 },
  { name: 'Firenze, Italia', count: 8 },
  { name: 'Lago di Como, Italia', count: 5 },
  { name: 'Amalfi, Italia', count: 3 }
];

const RecapPage: React.FC = () => {
  // Calculations for percentages
  const completedIdeasPercentage = Math.round((mockStats.completedIdeas / mockStats.totalIdeas) * 100) || 0;
  
  // Memory type display names
  const memoryTypeNames: Record<MemoryType, string> = {
    travel: 'Viaggi',
    event: 'Eventi',
    simple: 'Semplici'
  };
  
  // Idea type display names
  const ideaTypeNames: Record<IdeaType, string> = {
    travel: 'Viaggi',
    restaurant: 'Ristoranti',
    general: 'Generiche',
    challenge: 'Sfide'
  };
  
  // Memory type colors
  const memoryTypeColors: Record<MemoryType, string> = {
    travel: 'bg-blue-500',
    event: 'bg-pink-500',
    simple: 'bg-green-500'
  };
  
  // Idea type colors
  const ideaTypeColors: Record<IdeaType, string> = {
    travel: 'bg-blue-400',
    restaurant: 'bg-orange-400',
    general: 'bg-purple-400',
    challenge: 'bg-red-400'
  };

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Riepilogo</h1>
        <p className="text-muted-foreground mt-1">
          Statistiche dei vostri ricordi e momenti insieme
        </p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 staggered-animate">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ricordi Totali</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.totalMemories}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Momenti catturati insieme
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Immagini</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.totalImages}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fotografie dei vostri momenti
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Idee</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.totalIdeas}</div>
            <div className="flex items-center mt-1">
              <Progress value={completedIdeasPercentage} className="h-2" />
              <span className="text-xs ml-2">{completedIdeasPercentage}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockStats.completedIdeas} completate, {mockStats.totalIdeas - mockStats.completedIdeas} in attesa
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Luoghi Visitati</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.locationsVisited}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Posti esplorati insieme
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Memory type distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="animate-in" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookMarked className="mr-2 h-5 w-5" />
              Distribuzione Ricordi
            </CardTitle>
            <CardDescription>
              Tipi di ricordi creati insieme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(mockStats.memoriesByType).map(([type, count]) => {
                const typeName = memoryTypeNames[type as MemoryType];
                const percentage = Math.round((count / mockStats.totalMemories) * 100) || 0;
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${memoryTypeColors[type as MemoryType]} mr-2`}></div>
                        <span className="text-sm">{typeName}</span>
                      </div>
                      <div className="text-sm">
                        {count} ({percentage}%)
                      </div>
                    </div>
                    <Progress value={percentage} className={`h-2 ${memoryTypeColors[type as MemoryType]} bg-muted`} />
                  </div>
                );
              })}
            </div>
            
            {/* Placeholder for a chart */}
            <div className="mt-6 h-40 bg-muted rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Qui verrà visualizzato un grafico a torta
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-in" style={{ animationDelay: "150ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="mr-2 h-5 w-5" />
              Distribuzione Idee
            </CardTitle>
            <CardDescription>
              Tipi di idee pianificate insieme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(mockStats.ideasByType).map(([type, count]) => {
                const typeName = ideaTypeNames[type as IdeaType];
                const percentage = Math.round((count / mockStats.totalIdeas) * 100) || 0;
                
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full ${ideaTypeColors[type as IdeaType]} mr-2`}></div>
                        <span className="text-sm">{typeName}</span>
                      </div>
                      <div className="text-sm">
                        {count} ({percentage}%)
                      </div>
                    </div>
                    <Progress value={percentage} className={`h-2 ${ideaTypeColors[type as IdeaType]} bg-muted`} />
                  </div>
                );
              })}
            </div>
            
            {/* Idea completion */}
            <div className="mt-6 p-4 bg-muted rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  <span className="text-sm font-medium">Tasso di completamento</span>
                </div>
                <span className="text-sm font-medium">{completedIdeasPercentage}%</span>
              </div>
              <Progress value={completedIdeasPercentage} className="h-2 bg-muted-foreground/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline and Top Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-in" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Momenti nel Tempo
            </CardTitle>
            <CardDescription>
              Storia dei vostri ricordi insieme
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for a timeline chart */}
            <div className="h-60 bg-muted rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                Qui verrà visualizzato un grafico a linee temporale dei ricordi
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="animate-in" style={{ animationDelay: "250ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Luoghi più Visitati
            </CardTitle>
            <CardDescription>
              I vostri posti preferiti
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTopLocations.map((location, index) => {
                const maxCount = mockTopLocations[0].count;
                const percentage = Math.round((location.count / maxCount) * 100);
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {index < 3 && (
                          <Award className={`h-4 w-4 mr-2 ${
                            index === 0 ? 'text-yellow-500' : 
                            index === 1 ? 'text-gray-400' : 'text-amber-600'
                          }`} />
                        )}
                        <span className="text-sm">{location.name}</span>
                      </div>
                      <div className="text-sm">
                        {location.count} {location.count === 1 ? 'visita' : 'visite'}
                      </div>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecapPage;
