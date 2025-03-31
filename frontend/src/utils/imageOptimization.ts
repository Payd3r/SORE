export const optimizeImage = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossibile creare il contesto del canvas'));
          return;
        }

        // Calcola le dimensioni ottimizzate mantenendo l'aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1920; // Dimensione massima per lato
        const quality = 0.8; // Qualità JPEG

        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;

        // Disegna l'immagine ridimensionata
        ctx.drawImage(img, 0, 0, width, height);

        // Converti in blob con compressione
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Impossibile convertire l\'immagine in blob'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Errore nel caricamento dell\'immagine'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Errore nella lettura del file'));
    reader.readAsDataURL(file);
  });
};

export const getImageSize = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = () => reject(new Error('Errore nel caricamento dell\'immagine'));
    img.src = URL.createObjectURL(file);
  });
}; 