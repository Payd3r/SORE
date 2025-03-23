
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/50 p-4">
      <div className="text-center max-w-md animate-in mx-auto">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <p className="text-2xl font-medium mb-6">Pagina non trovata</p>
        <p className="text-muted-foreground mb-8">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" className="flex items-center">
            <Link to="/home">
              <Home className="mr-2 h-4 w-4" />
              Torna alla Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex items-center">
            <Link to="#" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna indietro
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
