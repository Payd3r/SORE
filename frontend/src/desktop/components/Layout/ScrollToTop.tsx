import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Trova il contenitore principale con overflow-y-auto
    const mainContent = document.querySelector('main[class*="flex-1"]');
    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: 'instant'
      });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop; 