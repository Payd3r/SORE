
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { AppLayout } from '@/components/layout/AppLayout';
import HomePage from './pages/HomePage';
import MemoriesPage from './pages/MemoriesPage';
import MemoryDetailPage from './pages/MemoryDetailPage';
import GalleryPage from './pages/GalleryPage';
import IdeasPage from './pages/IdeasPage';
import MapPage from './pages/MapPage';
import RecapPage from './pages/RecapPage';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<HomePage />} />
                <Route path="memories" element={<MemoriesPage />} />
                <Route path="memories/:id" element={<MemoryDetailPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="ideas" element={<IdeasPage />} />
                <Route path="map" element={<MapPage />} />
                <Route path="recap" element={<RecapPage />} />
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
