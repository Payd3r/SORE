export const loadFonts = () => {
  // Preload dei font critici
  const fontLinks = [
    {
      rel: 'preload',
      href: '/fonts/your-main-font.woff2',
      as: 'font',
      type: 'font/woff2',
      crossOrigin: 'anonymous',
    },
  ];

  // Aggiungi i link dei font al documento
  fontLinks.forEach(link => {
    const linkElement = document.createElement('link');
    Object.entries(link).forEach(([key, value]) => {
      linkElement.setAttribute(key, value);
    });
    document.head.appendChild(linkElement);
  });

  // Caricamento asincrono dei font non critici
  const loadNonCriticalFonts = async () => {
    try {
      const font = new FontFace(
        'YourFontName',
        'url(/fonts/your-font.woff2)',
        { weight: '400' }
      );
      await font.load();
      document.fonts.add(font);
    } catch (error) {
      console.error('Errore nel caricamento del font:', error);
    }
  };

  // Carica i font non critici dopo il caricamento della pagina
  if (document.readyState === 'complete') {
    loadNonCriticalFonts();
  } else {
    window.addEventListener('load', loadNonCriticalFonts);
  }
}; 