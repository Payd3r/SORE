class ImageCache {
  private static instance: ImageCache;
  private cache: Map<string, string>;
  private maxSize: number;
  private readonly cacheName: string;

  private constructor() {
    this.cache = new Map();
    this.maxSize = 50; // Numero massimo di immagini in cache
    this.cacheName = "memory-grove-images-v1";
  }

  public static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  public async getImage(url: string): Promise<string> {
    try {
      const memoryUrl = this.cache.get(url);
      if (memoryUrl) {
        return memoryUrl;
      }

      const cacheApi = await this.openBrowserCache();
      if (cacheApi) {
        const cachedResponse = await cacheApi.match(url);
        if (cachedResponse) {
          const blob = await cachedResponse.blob();
          const objectUrl = URL.createObjectURL(blob);
          this.setInMemory(url, objectUrl);
          return objectUrl;
        }
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      this.setInMemory(url, objectUrl);

      if (cacheApi && response.ok) {
        await cacheApi.put(url, response.clone());
      }

      return objectUrl;
    } catch (error) {
      console.error('Errore nel caricamento dell\'immagine:', error);
      return url; // Fallback all'URL originale in caso di errore
    }
  }

  private setInMemory(url: string, objectUrl: string): void {
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
  }

  private async openBrowserCache(): Promise<Cache | null> {
    if (typeof window === "undefined" || !("caches" in window)) {
      return null;
    }
    try {
      return await window.caches.open(this.cacheName);
    } catch {
      return null;
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