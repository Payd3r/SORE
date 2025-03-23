
import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  BookMarked, 
  Calendar, 
  Image as ImageIcon, 
  Lightbulb, 
  MapPin, 
  CheckCircle,
  Award,
  Users,
  Camera,
  Flag
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Stats, Memory, MemoryType, IdeaType, ImageType as ImageCategory, UserStats } from '@/types';
import { useAuth } from '@/context/auth-context';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f97316', '#8b5cf6', '#ef4444'];

// Generate comprehensive stats based on stored data
const generateStats = (): Stats => {
  // Load data from localStorage
  const memories = JSON.parse(localStorage.getItem('memories') || '[]');
  const ideas = JSON.parse(localStorage.getItem('ideas') || '[]');
  const images = JSON.parse(localStorage.getItem('images') || '[]');
  
  // Initialize stats
  const stats: Stats = {
    totalMemories: memories.length,
    memoriesByType: {
      travel: 0,
      event: 0,
      simple: 0
    },
    memoriesByUser: {},
    totalImages: images.length,
    imagesByType: {
      landscape: 0,
      singlePerson: 0,
      couple: 0
    },
    imagesByUser: {},
    totalIdeas: ideas.length,
    completedIdeas: ideas.filter((idea: any) => idea.completed).length,
    ideasByType: {
      travel: 0,
      restaurant: 0,
      general: 0,
      challenge: 0
    },
    ideasCreatedByUser: {},
    ideasCompletedByUser: {},
    locationsVisited: 0,
    userStats: []
  };
  
  // Count unique locations
  const uniqueLocations = new Set();
  
  // Process memories
  memories.forEach((memory: Memory) => {
    // Count by type
    stats.memoriesByType[memory.type]++;
    
    // Count by user
    if (!stats.memoriesByUser[memory.userId]) {
      stats.memoriesByUser[memory.userId] = 0;
    }
    stats.memoriesByUser[memory.userId]++;
    
    // Add location if exists
    if (memory.location && memory.location.name) {
      uniqueLocations.add(memory.location.name);
    }
  });
  
  // Process ideas
  ideas.forEach((idea: any) => {
    // Count by type
    if (stats.ideasByType[idea.type] !== undefined) {
      stats.ideasByType[idea.type]++;
    }
    
    // Count created by user
    if (!stats.ideasCreatedByUser[idea.userId]) {
      stats.ideasCreatedByUser[idea.userId] = 0;
    }
    stats.ideasCreatedByUser[idea.userId]++;
    
    // Count completed by user
    if (idea.completed && idea.completedById) {
      if (!stats.ideasCompletedByUser[idea.completedById]) {
        stats.ideasCompletedByUser[idea.completedById] = 0;
      }
      stats.ideasCompletedByUser[idea.completedById]++;
    }
  });
  
  // Process images
  images.forEach((image: any) => {
    // Count by type
    if (image.type && stats.imagesByType[image.type] !== undefined) {
      stats.imagesByType[image.type]++;
    }
    
    // Count by user
    if (!stats.imagesByUser[image.userId]) {
      stats.imagesByUser[image.userId] = 0;
    }
    stats.imagesByUser[image.userId]++;
    
    // Add location if exists
    if (image.location && image.location.name) {
      uniqueLocations.add(image.location.name);
    }
  });
  
  // Set locations count
  stats.locationsVisited = uniqueLocations.size;
  
  // Generate user stats
  const userIds = new Set([
    ...Object.keys(stats.memoriesByUser),
    ...Object.keys(stats.ideasCreatedByUser),
    ...Object.keys(stats.ideasCompletedByUser),
    ...Object.keys(stats.imagesByUser)
  ]);
  
  // Find names for users
  const userNames: Record<string, string> = {};
  [...memories, ...ideas, ...images].forEach(item => {
    if (item.userId && item.creatorName) {
      userNames[item.userId] = item.creatorName;
    } else if (item.userId && item.uploaderName) {
      userNames[item.userId] = item.uploaderName;
    }
  });
  
  // Create user stats
  Array.from(userIds).forEach(userId => {
    stats.userStats.push({
      userId,
      name: userNames[userId] || `Utente ${userId}`,
      memoriesCreated: stats.memoriesByUser[userId] || 0,
      ideasCreated: stats.ideasCreatedByUser[userId] || 0,
      ideasCompleted: stats.ideasCompletedByUser[userId] || 0,
      imagesUploaded: stats.imagesByUser[userId] || 0,
      locationsVisited: 0 // Difficult to compute from this data
    });
  });
  
  return stats;
};

// Top locations data
const mockTopLocations = [
  { name: 'Roma, Italia', count: 15 },
  { name: 'Milano, Italia', count: 12 },
  { name: 'Firenze, Italia', count: 8 },
  { name: 'Lago di Como, Italia', count: 5 },
  { name: 'Amalfi, Italia', count: 3 }
];

const RecapPage: React.FC = () => {
  const { couple } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [timelineData, setTimelineData] = useState([]);
  
  useEffect(() => {
    // Generate stats
    const generatedStats = generateStats();
    setStats(generatedStats);
    
    // Create mock timeline data
    const mockTimelineData = [
      { name: 'Gen', memories: 3, images: 15 },
      { name: 'Feb', memories: 2, images: 8 },
      { name: 'Mar', memories: 1, images: 5 },
      { name: 'Apr', memories: 4, images: 20 },
      { name: 'Mag', memories: 2, images: 12 },
      { name: 'Giu', memories: 5, images: 18 },
    ];
    setTimelineData(mockTimelineData);
  }, []);
  
  if (!stats) {
    return <div className="flex justify-center items-center h-[50vh]">Caricamento statistiche...</div>;
  }
  
  // Calculations for percentages
  const completedIdeasPercentage = Math.round((stats.completedIdeas / stats.totalIdeas) * 100) || 0;
  
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
  
  // Image type display names
  const imageTypeNames: Record<ImageCategory, string> = {
    landscape: 'Paesaggio',
    singlePerson: 'Persona singola',
    couple: 'Coppia'
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
  
  // Image type colors
  const imageTypeColors: Record<ImageCategory, string> = {
    landscape: 'bg-cyan-400',
    singlePerson: 'bg-indigo-400',
    couple: 'bg-pink-400'
  };
  
  // Prepare chart data
  const memoryTypeData = Object.entries(stats.memoriesByType).map(([type, count]) => ({
    name: memoryTypeNames[type as MemoryType],
    value: count
  }));
  
  const ideaTypeData = Object.entries(stats.ideasByType).map(([type, count]) => ({
    name: ideaTypeNames[type as IdeaType],
    value: count
  }));
  
  const imageTypeData = Object.entries(stats.imagesByType).map(([type, count]) => ({
    name: imageTypeNames[type as ImageCategory],
    value: count
  }));
  
  // Prepare user comparison data
  const userComparisonMemories = stats.userStats.map(user => ({
    name: user.name,
    value: user.memoriesCreated
  }));
  
  const userComparisonIdeas = stats.userStats.map(user => ({
    name: user.name,
    created: user.ideasCreated,
    completed: user.ideasCompleted
  }));
  
  const userComparisonImages = stats.userStats.map(user => ({
    name: user.name,
    value: user.imagesUploaded
  }));
  
  const userComparisonTotal = stats.userStats.map(user => ({
    name: user.name,
    memories: user.memoriesCreated,
    ideas: user.ideasCreated,
    images: user.imagesUploaded
  }));

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
        <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ricordi Totali</CardTitle>
            <BookMarked className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalMemories}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Momenti catturati insieme
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Immagini</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalImages}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fotografie dei vostri momenti
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Idee</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalIdeas}</div>
            <div className="flex items-center mt-1">
              <Progress value={completedIdeasPercentage} className="h-2" />
              <span className="text-xs ml-2">{completedIdeasPercentage}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedIdeas} completate, {stats.totalIdeas - stats.completedIdeas} in attesa
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Luoghi Visitati</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.locationsVisited}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Posti esplorati insieme
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full justify-start mb-8">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Panoramica
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Confronto
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Memory type distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="animate-in backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg" style={{ animationDelay: "100ms" }}>
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
                  {Object.entries(stats.memoriesByType).map(([type, count]) => {
                    const typeName = memoryTypeNames[type as MemoryType];
                    const percentage = Math.round((count / stats.totalMemories) * 100) || 0;
                    
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
                
                <div className="mt-6 h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={memoryTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {memoryTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Ricordi']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-in backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg" style={{ animationDelay: "150ms" }}>
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
                  {Object.entries(stats.ideasByType).map(([type, count]) => {
                    const typeName = ideaTypeNames[type as IdeaType];
                    const percentage = Math.round((count / stats.totalIdeas) * 100) || 0;
                    
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
                
                <div className="mt-6 h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ideaTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {ideaTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Idee']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Idea completion */}
                <div className="p-4 bg-muted rounded-md">
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

          {/* Image types and Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="animate-in backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg" style={{ animationDelay: "200ms" }}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Distribuzione Immagini
                </CardTitle>
                <CardDescription>
                  Tipi di immagini caricate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.imagesByType).map(([type, count]) => {
                    const typeName = imageTypeNames[type as ImageCategory];
                    const percentage = Math.round((count / stats.totalImages) * 100) || 0;
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${imageTypeColors[type as ImageCategory]} mr-2`}></div>
                            <span className="text-sm">{typeName}</span>
                          </div>
                          <div className="text-sm">
                            {count} ({percentage}%)
                          </div>
                        </div>
                        <Progress value={percentage} className={`h-2 ${imageTypeColors[type as ImageCategory]} bg-muted`} />
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={imageTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {imageTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Immagini']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="animate-in backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg" style={{ animationDelay: "250ms" }}>
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
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={timelineData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="memories" name="Ricordi" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="images" name="Immagini" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Locations */}
          <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
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
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 mr-2 text-primary" />
            <h2 className="text-2xl font-bold">Confronto tra {couple?.name || 'Membri'}</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            Confronta i contributi e le statistiche tra i membri della coppia
          </p>
          
          {/* Overall Contributions */}
          <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Flag className="mr-2 h-5 w-5" />
                Contributi Totali
              </CardTitle>
              <CardDescription>
                Confronto dei contributi totali tra i membri
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={userComparisonTotal}
                    layout="vertical"
                    margin={{
                      top: 20,
                      right: 30,
                      left: 40,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="memories" name="Ricordi" fill="#8884d8" />
                    <Bar dataKey="ideas" name="Idee" fill="#82ca9d" />
                    <Bar dataKey="images" name="Immagini" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Grid of comparison stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Memories Comparison */}
            <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookMarked className="mr-2 h-5 w-5" />
                  Ricordi Creati
                </CardTitle>
                <CardDescription>
                  Chi ha creato più ricordi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userComparisonMemories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userComparisonMemories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Ricordi']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4 mt-4">
                  {userComparisonMemories.map((user, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full bg-${COLORS[index % COLORS.length].substring(1)} mr-2`} 
                               style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-sm">{user.name}</span>
                        </div>
                        <div className="text-sm">{user.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Ideas Comparison */}
            <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5" />
                  Idee
                </CardTitle>
                <CardDescription>
                  Idee create e completate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userComparisonIdeas}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="created" name="Create" fill="#8884d8" />
                      <Bar dataKey="completed" name="Completate" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4 mt-4">
                  {userComparisonIdeas.map((user, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{user.name}</span>
                        <div className="text-sm flex gap-2">
                          <span className="text-purple-600">{user.created} create</span>
                          <span className="text-green-600">{user.completed} completate</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Images Comparison */}
            <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="mr-2 h-5 w-5" />
                  Foto Caricate
                </CardTitle>
                <CardDescription>
                  Chi ha caricato più foto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userComparisonImages}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {userComparisonImages.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, 'Immagini']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4 mt-4">
                  {userComparisonImages.map((user, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full bg-${COLORS[index % COLORS.length].substring(1)} mr-2`} 
                               style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-sm">{user.name}</span>
                        </div>
                        <div className="text-sm">{user.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Achievements */}
          <Card className="backdrop-blur-sm bg-white/40 dark:bg-black/40 border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Risultati e Traguardi
              </CardTitle>
              <CardDescription>
                Traguardi raggiunti dai membri della coppia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.userStats.map(user => (
                  <div key={user.userId} className="border rounded-lg p-4">
                    <h3 className="text-lg font-bold mb-3">{user.name}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Ricordi creati</span>
                        <Badge>{user.memoriesCreated}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Idee proposte</span>
                        <Badge>{user.ideasCreated}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Idee completate</span>
                        <Badge>{user.ideasCompleted}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Foto caricate</span>
                        <Badge>{user.imagesUploaded}</Badge>
                      </div>
                      <div className="mt-4">
                        <Badge className="bg-primary/20 text-primary" variant="outline">
                          {getAchievementTitle(user)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to get achievement title based on user stats
function getAchievementTitle(user: UserStats): string {
  if (user.imagesUploaded > user.memoriesCreated && user.imagesUploaded > user.ideasCreated) {
    return "Fotografo Esperto";
  } else if (user.memoriesCreated > user.imagesUploaded && user.memoriesCreated > user.ideasCreated) {
    return "Custode dei Ricordi";
  } else if (user.ideasCreated > user.memoriesCreated && user.ideasCreated > user.imagesUploaded) {
    return "Fonte di Ispirazione";
  } else if (user.ideasCompleted > user.ideasCreated) {
    return "Completatore";
  } else {
    return "Collaboratore Equilibrato";
  }
}

export default RecapPage;
