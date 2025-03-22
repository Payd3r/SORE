
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookMarked, 
  ImageIcon, 
  Lightbulb, 
  MapPinned, 
  Plus, 
  Calendar, 
  Music2,
  Camera,
  Heart,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage: React.FC = () => {
  const { user, couple } = useAuth();
  
  const currentTime = new Date().getHours();
  const greeting = 
    currentTime < 12 ? 'Buongiorno' :
    currentTime < 18 ? 'Buon pomeriggio' :
    'Buonasera';
  
  const features = [
    {
      title: 'Ricordi',
      description: 'Salva i momenti speciali con la tua persona amata',
      icon: <BookMarked className="h-10 w-10" />,
      to: '/memories',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Galleria',
      description: 'Visualizza e organizza le tue fotografie insieme',
      icon: <ImageIcon className="h-10 w-10" />,
      to: '/gallery',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Idee',
      description: 'Pianifica nuove avventure e cose da fare insieme',
      icon: <Lightbulb className="h-10 w-10" />,
      to: '/ideas',
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Mappa',
      description: 'Esplora i luoghi visitati e pianifica nuove mete',
      icon: <MapPinned className="h-10 w-10" />,
      to: '/map',
      color: 'text-green-600 dark:text-green-400'
    }
  ];

  const quickActions = [
    {
      label: 'Nuovo Ricordo',
      icon: <BookMarked className="h-5 w-5" />,
      to: '/memories/new',
      color: 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-800/30'
    },
    {
      label: 'Carica Immagini',
      icon: <Camera className="h-5 w-5" />,
      to: '/gallery/upload',
      color: 'bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/20 dark:hover:bg-purple-800/30'
    },
    {
      label: 'Nuova Idea',
      icon: <Lightbulb className="h-5 w-5" />,
      to: '/ideas/new',
      color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:hover:bg-yellow-800/30'
    },
    {
      label: 'Luoghi',
      icon: <MapPinned className="h-5 w-5" />,
      to: '/map',
      color: 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-800/30'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 space-y-12 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-8 md:p-12">
        <div className="absolute -right-20 -top-20 opacity-10">
          <Heart className="w-64 h-64 text-primary" />
        </div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {greeting}, <span className="text-primary">{user?.name.split(' ')[0]}</span>!
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-lg">
            {couple 
              ? `Benvenuto nella storia d'amore di ${couple.name}`
              : 'Benvenuto nei tuoi ricordi speciali'}
          </p>
          
          <div className="flex flex-wrap gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                asChild
                className={`${action.color}`}
              >
                <Link to={action.to} className="flex items-center gap-2">
                  {action.icon}
                  {action.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Esplora</h2>
          <Link to="/memories" className="text-primary hover:underline flex items-center gap-1">
            Vedi tutti <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 staggered-animate">
          {features.map((feature, index) => (
            <Link to={feature.to} key={index} className="transition-transform">
              <Card className="h-full card-hover border-2 hover:border-primary">
                <CardHeader>
                  <div className={`${feature.color}`}>
                    {feature.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="mt-2">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center text-xl">
              <Heart className="mr-2 h-5 w-5 text-primary" />
              La vostra storia
            </CardTitle>
            <CardDescription>
              {couple?.startDate && `Insieme da ${Math.floor((new Date().getTime() - new Date(couple.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} mesi`}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/20">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">12</div>
                <div className="text-sm text-muted-foreground">Ricordi</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg dark:bg-purple-900/20">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">48</div>
                <div className="text-sm text-muted-foreground">Foto</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg dark:bg-yellow-900/20">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">8</div>
                <div className="text-sm text-muted-foreground">Idee</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg dark:bg-green-900/20">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">5</div>
                <div className="text-sm text-muted-foreground">Luoghi</div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm">
              <Link to="/recap">
                Vedi tutte le statistiche
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Calendar className="mr-2 h-5 w-5 text-primary" />
              In evidenza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <BookMarked className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">Vacanza a Roma</h4>
                <p className="text-xs text-muted-foreground">10 - 15 Giugno</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">Weekend a Parigi</h4>
                <p className="text-xs text-muted-foreground">Idea da organizzare</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                <Music2 className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">La vostra playlist</h4>
                <p className="text-xs text-muted-foreground">10 canzoni dei ricordi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Uploads */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Foto recenti</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array(6).fill(null).map((_, idx) => (
            <div key={idx} className="aspect-square rounded-lg overflow-hidden image-hover-zoom">
              <img 
                src={`https://picsum.photos/seed/${idx+100}/300/300`}
                alt={`Recent ${idx+1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button asChild>
            <Link to="/gallery">
              Visualizza tutte le foto
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
