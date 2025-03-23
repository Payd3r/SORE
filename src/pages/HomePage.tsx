
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookMarked, 
  Image as ImageIcon, 
  Lightbulb, 
  MapPin, 
  Plus, 
  Calendar, 
  Music2,
  MapPinned
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  
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
      color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Galleria',
      description: 'Visualizza e organizza le tue fotografie insieme',
      icon: <ImageIcon className="h-10 w-10" />,
      to: '/gallery',
      color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Idee',
      description: 'Pianifica nuove avventure e cose da fare insieme',
      icon: <Lightbulb className="h-10 w-10" />,
      to: '/ideas',
      color: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
    },
    {
      title: 'Mappa',
      description: 'Esplora i luoghi visitati e pianifica nuove mete',
      icon: <MapPin className="h-10 w-10" />,
      to: '/map',
      color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
    }
  ];

  const quickActions = [
    {
      label: 'Nuovo Ricordo',
      icon: <BookMarked className="h-5 w-5" />,
      to: '/memories/new',
      color: 'bg-blue-100 text-blue-600 hover:bg-blue-200'
    },
    {
      label: 'Carica Immagini',
      icon: <ImageIcon className="h-5 w-5" />,
      to: '/gallery/upload',
      color: 'bg-purple-100 text-purple-600 hover:bg-purple-200'
    },
    {
      label: 'Nuova Idea',
      icon: <Lightbulb className="h-5 w-5" />,
      to: '/ideas/new',
      color: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
    },
    {
      label: 'Aggiungi Luogo',
      icon: <MapPinned className="h-5 w-5" />,
      to: '/map/add',
      color: 'bg-green-100 text-green-600 hover:bg-green-200'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">
          {greeting}, <span className="text-primary">{user?.name.split(' ')[0]}</span>!
        </h1>
        <p className="text-muted-foreground mt-2 text-xl">
          Benvenuto nei tuoi ricordi speciali
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 staggered-animate">
        {features.map((feature, index) => (
          <Link to={feature.to} key={index} className="transition-transform">
            <Card className="h-full card-hover border-2 hover:border-primary">
              <CardHeader>
                <div className={`p-3 rounded-full w-fit ${feature.color}`}>
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

      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Azioni Rapide</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              asChild
              variant="outline"
              className={`${action.color} border-none`}
            >
              <Link to={action.to} className="flex items-center gap-2">
                {action.icon}
                {action.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="animate-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Eventi Imminenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Non hai eventi imminenti al momento.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm">
              <Link to="/memories/new">
                <Plus className="mr-2 h-4 w-4" />
                Aggiungi Evento
              </Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="animate-in" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music2 className="mr-2 h-5 w-5" />
              Canzoni dei Ricordi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Nessuna canzone associata ai tuoi ricordi.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" size="sm">
              <Link to="/memories">
                Esplora Ricordi
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
