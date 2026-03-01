import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolla il contenuto principale in alto al cambio route.
 * Deve essere renderizzato come primo figlio di <Router> in App.tsx.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const mainContent = document.querySelector('main[class*="flex-1"]');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop; 