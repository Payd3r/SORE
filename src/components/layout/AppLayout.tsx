
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Sidebar } from './Sidebar';
import { AuthForm } from '@/components/auth/AuthForm';
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AppLayout: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Handle Escape key to close sidebar on mobile
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [sidebarOpen]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-medium">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pattern">
        <div className="w-full max-w-md px-4">
          <AuthForm />
        </div>
      </div>
    );
  }

  // If user tries to access root, redirect to home
  if (location.pathname === '/') {
    return <Navigate to="/home" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="md:block hidden">
        <Sidebar open={true} setOpen={setSidebarOpen} />
      </div>
      
      {/* Mobile Sidebar */}
      <div className="md:hidden block">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      </div>
      
      {/* Mobile Hamburger Button - Fixed at bottom left */}
      <Button
        variant="primary"
        size="icon"
        className="md:hidden fixed bottom-6 left-6 z-50 rounded-full shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <main 
        className="flex-1 overflow-y-auto transform transition-all duration-300 w-full md:ml-64 pt-4"
      >
        <div className="p-2 sm:p-4 md:p-6 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
