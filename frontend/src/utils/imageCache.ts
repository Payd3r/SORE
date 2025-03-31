class ImageCache {
  private static instance: ImageCache;
  private cache: Map<string, string>;
  private maxSize: number;
  private keys: string[];

  private constructor() {
    this.cache = new Map();
    this.maxSize = 50; // Numero massimo di immagini in cache
    this.keys = [];
  }

  public static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  public async getImage(url: string): Promise<string> {
    if (this.cache.has(url)) {
      const cachedUrl = this.cache.get(url);
      if (cachedUrl) {
        return cachedUrl;
      }
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      // Gestione della dimensione della cache
      if (this.cache.size >= this.maxSize) {
        const firstKey = Array.from(this.cache.keys())[0];
        if (firstKey) {
          const firstValue = this.cache.get(firstKey);
          if (firstValue) {
            URL.revokeObjectURL(firstValue);
          }
          this.cache.delete(firstKey);
        }
      }

      this.cache.set(url, objectUrl);
      this.keys.push(url);
      return objectUrl;
    } catch (error) {
      console.error('Errore nel caricamento dell\'immagine:', error);
      return url; // Fallback all'URL originale in caso di errore
    }
  }

  public clearCache(): void {
    this.cache.forEach((objectUrl) => {
      URL.revokeObjectURL(objectUrl);
    });
    this.cache.clear();
  }
}

export const imageCache = ImageCache.getInstance(); 