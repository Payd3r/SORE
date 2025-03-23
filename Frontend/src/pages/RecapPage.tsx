import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, ImageIcon, Lightbulb, MapPin, BookMarked } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { format, formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { Progress } from "@/components/ui/progress"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MOCK_MEMORIES = [
  {
    id: '1',
    type: 'travel',
    title: 'Viaggio a Roma',
    description: 'Un fantastico viaggio a Roma con la mia dolce metà.',
    startDate: new Date('2023-05-10'),
    endDate: new Date('2023-05-15'),
    userId: 'user1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date(),
    images: [],
  },
  {
    id: '2',
    type: 'event',
    title: 'Compleanno di Maria',
    description: 'Festa di compleanno a sorpresa per Maria.',
    startDate: new Date('2023-07-20'),
    userId: 'user2',
    creatorName: 'Luisa Verdi',
    coupleId: 'couple1',
    createdAt: new Date(),
    images: [],
  },
  {
    id: '3',
    type: 'simple',
    title: 'Serata al cinema',
    description: 'Una piacevole serata al cinema insieme.',
    startDate: new Date('2023-09-05'),
    userId: 'user1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date(),
    images: [],
  },
  {
    id: '4',
    type: 'travel',
    title: 'Weekend a Firenze',
    description: 'Un romantico weekend nella splendida Firenze.',
    startDate: new Date('2023-11-01'),
    endDate: new Date('2023-11-03'),
    userId: 'user2',
    creatorName: 'Luisa Verdi',
    coupleId: 'couple1',
    createdAt: new Date(),
    images: [],
  },
];

const MOCK_IDEAS = [
  {
    id: '1',
    type: 'travel',
    title: 'Pianificare un viaggio esotico',
    description: 'Organizzare un viaggio in un\'isola tropicale.',
    userId: 'user1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date(),
    completed: true,
  },
  {
    id: '2',
    type: 'restaurant',
    title: 'Provare un nuovo ristorante',
    description: 'Cenare in un ristorante etnico mai provato prima.',
    userId: 'user2',
    creatorName: 'Luisa Verdi',
    coupleId: 'couple1',
    createdAt: new Date(),
    completed: false,
  },
  {
    id: '3',
    type: 'general',
    title: 'Fare un picnic al parco',
    description: 'Organizzare un picnic all\'aperto in una bella giornata.',
    userId: 'user1',
    creatorName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date(),
    completed: false,
  },
];

const MOCK_IMAGES = [
  {
    id: '1',
    name: 'Tramonto a Roma',
    url: '/placeholder.svg',
    thumbnailUrl: '/placeholder.svg',
    date: new Date('2023-05-12'),
    type: 'landscape',
    userId: 'user1',
    uploaderName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: true,
  },
  {
    id: '2',
    name: 'Torta di compleanno',
    url: '/placeholder.svg',
    thumbnailUrl: '/placeholder.svg',
    date: new Date('2023-07-20'),
    type: 'singlePerson',
    userId: 'user2',
    uploaderName: 'Luisa Verdi',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: false,
  },
  {
    id: '3',
    name: 'Cinema di sera',
    url: '/placeholder.svg',
    thumbnailUrl: '/placeholder.svg',
    date: new Date('2023-09-05'),
    type: 'couple',
    userId: 'user1',
    uploaderName: 'Mario Rossi',
    coupleId: 'couple1',
    createdAt: new Date(),
    isFavorite: true,
  },
];

const MOCK_LOCATIONS = [
  {
    latitude: 41.9028,
    longitude: 12.4964,
    name: 'Roma',
  },
  {
    latitude: 43.7696,
    longitude: 11.2558,
    name: 'Firenze',
  },
];

interface RecapPageProps {
}

const RecapPage: React.FC<RecapPageProps> = () => {
  const { user, couple } = useAuth();

  // Mock data for demonstration
  const totalMemories = MOCK_MEMORIES.length;
  const totalIdeas = MOCK_IDEAS.length;
  const totalImages = MOCK_IMAGES.length;
  const totalLocations = MOCK_LOCATIONS.length;

  const memoriesByType = MOCK_MEMORIES.reduce((acc, memory) => {
    acc[memory.type] = (acc[memory.type] || 0) + 1;
    return acc;
  }, {});

  const ideasByType = MOCK_IDEAS.reduce((acc, idea) => {
    acc[idea.type] = (acc[idea.type] || 0) + 1;
    return acc;
  }, {});

  const imagesByType = MOCK_IMAGES.reduce((acc, image) => {
    acc[image.type] = (acc[image.type] || 0) + 1;
    return acc;
  }, {});

  const completedIdeas = MOCK_IDEAS.filter(idea => idea.completed).length;

  const userStats = [
    {
      userId: 'user1',
      name: 'Mario Rossi',
      memoriesCreated: MOCK_MEMORIES.filter(memory => memory.userId === 'user1').length,
      ideasCreated: MOCK_IDEAS.filter(idea => idea.userId === 'user1').length,
      ideasCompleted: MOCK_IDEAS.filter(idea => idea.userId === 'user1' && idea.completed).length,
      imagesUploaded: MOCK_IMAGES.filter(image => image.userId === 'user1').length,
      locationsVisited: 2,
    },
    {
      userId: 'user2',
      name: 'Luisa Verdi',
      memoriesCreated: MOCK_MEMORIES.filter(memory => memory.userId === 'user2').length,
      ideasCreated: MOCK_IDEAS.filter(idea => idea.userId === 'user2').length,
      ideasCompleted: MOCK_IDEAS.filter(idea => idea.userId === 'user2' && idea.completed).length,
      imagesUploaded: MOCK_IMAGES.filter(image => image.userId === 'user2').length,
      locationsVisited: 1,
    },
  ];

  // Chart data
  const chartData = {
    labels: ['Ricordi', 'Idee', 'Immagini'],
    datasets: [
      {
        label: 'Totale',
        data: [totalMemories, totalIdeas, totalImages],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Statistiche generali',
      },
    },
  };

  // Progress bar components
  const ProgressBar = ({ value, className }: { value: number, className?: string }) => {
    return (
      <Progress 
        value={value} 
        className={className || "h-2"} 
      />
    );
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
    <div className="container mx-auto p-6 animate-fade-in">
      <h1 className="text-3xl font-bold mb-4">Recap della coppia</h1>
      <p className="text-muted-foreground">
        Ecco una panoramica dei vostri momenti più belli e dei vostri progetti futuri.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {/* General Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiche generali</CardTitle>
            <CardDescription>Panoramica delle attività della coppia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Ricordi creati</span>
                <Badge variant="secondary">{totalMemories}</Badge>
              </div>
              <ProgressBar value={(totalMemories / 50) * 100} />

              <div className="flex items-center justify-between">
                <span>Idee aggiunte</span>
                <Badge variant="secondary">{totalIdeas}</Badge>
              </div>
              <ProgressBar value={(totalIdeas / 30) * 100} />

              <div className="flex items-center justify-between">
                <span>Immagini caricate</span>
                <Badge variant="secondary">{totalImages}</Badge>
              </div>
              <ProgressBar value={(totalImages / 100) * 100} />

              <div className="flex items-center justify-between">
                <span>Luoghi visitati</span>
                <Badge variant="secondary">{totalLocations}</Badge>
              </div>
              <ProgressBar value={(totalLocations / 10) * 100} />
            </div>
          </CardContent>
        </Card>

        {/* Memories by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Ricordi per tipo</CardTitle>
            <CardDescription>Distribuzione dei ricordi per categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Viaggi</span>
                <Badge variant="secondary">{memoriesByType['travel'] || 0}</Badge>
              </div>
              <ProgressBar value={((memoriesByType['travel'] || 0) / totalMemories) * 100} />

              <div className="flex items-center justify-between">
                <span>Eventi</span>
                <Badge variant="secondary">{memoriesByType['event'] || 0}</Badge>
              </div>
              <ProgressBar value={((memoriesByType['event'] || 0) / totalMemories) * 100} />

              <div className="flex items-center justify-between">
                <span>Semplici</span>
                <Badge variant="secondary">{memoriesByType['simple'] || 0}</Badge>
              </div>
              <ProgressBar value={((memoriesByType['simple'] || 0) / totalMemories) * 100} />
            </div>
          </CardContent>
        </Card>

        {/* Ideas by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Idee per tipo</CardTitle>
            <CardDescription>Distribuzione delle idee per categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Viaggi</span>
                <Badge variant="secondary">{ideasByType['travel'] || 0}</Badge>
              </div>
              <ProgressBar value={((ideasByType['travel'] || 0) / totalIdeas) * 100} />

              <div className="flex items-center justify-between">
                <span>Ristoranti</span>
                <Badge variant="secondary">{ideasByType['restaurant'] || 0}</Badge>
              </div>
              <ProgressBar value={((ideasByType['restaurant'] || 0) / totalIdeas) * 100} />

              <div className="flex items-center justify-between">
                <span>Generali</span>
                <Badge variant="secondary">{ideasByType['general'] || 0}</Badge>
              </div>
              <ProgressBar value={((ideasByType['general'] || 0) / totalIdeas) * 100} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Couple Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni sulla coppia</CardTitle>
            <CardDescription>Dettagli sulla vostra relazione</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src={couple?.avatar} alt={couple?.name} />
                <AvatarFallback>{couple?.name ? couple.name[0].toUpperCase() : 'C'}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{couple?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Insieme dal {couple?.startDate ? format(new Date(couple.startDate), 'dd MMMM yyyy', { locale: it }) : 'Data sconosciuta'}
                </p>
              </div>
            </div>
            <p>
              {couple?.description || 'Nessuna descrizione disponibile.'}
            </p>
            {couple?.anniversaryDate && (
              <div className="mt-2">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Prossimo anniversario</h4>
                <p className="text-primary">
                  {format(new Date(couple.anniversaryDate), 'dd MMMM', { locale: it })} (
                  {formatDistanceToNow(new Date(couple.anniversaryDate), { addSuffix: true, locale: it })}
                  )
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiche utente</CardTitle>
            <CardDescription>Contributi individuali alla coppia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userStats.map((userStat) => (
              <div key={userStat.userId} className="space-y-2">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user?.avatar} alt={userStat.name} />
                    <AvatarFallback>{getInitials(userStat.name)}</AvatarFallback>
                  </Avatar>
                  <h4 className="text-sm font-semibold">{userStat.name}</h4>
                </div>
                <div className="ml-12 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Ricordi creati</span>
                    <Badge variant="secondary">{userStat.memoriesCreated}</Badge>
                  </div>
                  <ProgressBar value={(userStat.memoriesCreated / totalMemories) * 100} />

                  <div className="flex items-center justify-between">
                    <span>Idee aggiunte</span>
                    <Badge variant="secondary">{userStat.ideasCreated}</Badge>
                  </div>
                  <ProgressBar value={(userStat.ideasCreated / totalIdeas) * 100} />

                  <div className="flex items-center justify-between">
                    <span>Idee completate</span>
                    <Badge variant="secondary">{userStat.ideasCompleted}</Badge>
                  </div>
                  <ProgressBar value={(userStat.ideasCompleted / completedIdeas) * 100} />

                  <div className="flex items-center justify-between">
                    <span>Immagini caricate</span>
                    <Badge variant="secondary">{userStat.imagesUploaded}</Badge>
                  </div>
                  <ProgressBar value={(userStat.imagesUploaded / totalImages) * 100} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Grafico riassuntivo</CardTitle>
          <CardDescription>Visualizzazione grafica delle statistiche</CardDescription>
        </CardHeader>
        <CardContent>
          <Bar options={chartOptions} data={chartData} />
        </CardContent>
      </Card>

      {/* Latest Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Ultima attività</CardTitle>
          <CardDescription>I vostri momenti più recenti</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium">Nuova immagine caricata</h4>
              <p className="text-xs text-muted-foreground">
                {user?.name} ha caricato una nuova immagine il {format(new Date(), 'dd MMMM yyyy', { locale: it })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Lightbulb className="w-5 h-5 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium">Nuova idea aggiunta</h4>
              <p className="text-xs text-muted-foreground">
                {user?.name} ha aggiunto una nuova idea il {format(new Date(), 'dd MMMM yyyy', { locale: it })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <BookMarked className="w-5 h-5 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium">Nuovo ricordo creato</h4>
              <p className="text-xs text-muted-foreground">
                {user?.name} ha creato un nuovo ricordo il {format(new Date(), 'dd MMMM yyyy', { locale: it })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <div>
              <h4 className="text-sm font-medium">Nuovo luogo visitato</h4>
              <p className="text-xs text-muted-foreground">
                {user?.name} ha visitato un nuovo luogo il {format(new Date(), 'dd MMMM yyyy', { locale: it })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecapPage;
