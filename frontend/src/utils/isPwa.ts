import { useEffect, useState } from 'react';

/**
 * Controlla se l'applicazione è in esecuzione come PWA installata
 * o come normale sito web nel browser
 */
export const isPwa = (): boolean => {
  // Controllo se presente il parametro mode=pwa nell'URL
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('mode') === 'pwa') {
    return true;
  }

  // Controllo se l'app è in modalità standalone o fullscreen (PWA installata)
  if (window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone) {
    return true;
  }

  // Su iOS Safari, controlliamo la proprietà standalone
  if ('standalone' in window.navigator && (window.navigator as any).standalone === true) {
    return true;
  }

  return false;
};

/**
 * Hook React che restituisce se l'app è in modalità PWA e si aggiorna 
 * se lo stato cambia (ad esempio se l'utente installa la PWA)
 */
export const useIsPwa = (): boolean => {
  const [isPwaMode, setIsPwaMode] = useState<boolean>(isPwa());

  useEffect(() => {
    const checkPwaMode = () => {
      setIsPwaMode(isPwa());
    };

    // Controlla quando la modalità display cambia
    const mediaQuery = window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)');
    mediaQuery.addEventListener('change', checkPwaMode);

    return () => {
      mediaQuery.removeEventListener('change', checkPwaMode);
    };
  }, []);

  return isPwaMode;
}; 