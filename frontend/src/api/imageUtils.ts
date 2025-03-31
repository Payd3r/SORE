export const resizeAndConvertToBase64 = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Verifica il formato dell'immagine
    const validFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      reject(new Error('Formato immagine non supportato. Usa JPG, PNG, GIF o WebP.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calcola le dimensioni mantenendo l'aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossibile creare il contesto del canvas'));
          return;
        }

        // Disegna l'immagine ridimensionata
        ctx.drawImage(img, 0, 0, width, height);

        // Converti in base64
        const base64String = canvas.toDataURL(file.type);
        resolve(base64String);
      };

      img.onerror = () => {
        reject(new Error('Errore durante il caricamento dell\'immagine'));
      };

      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };

    reader.onerror = () => {
      reject(new Error('Errore durante la lettura del file'));
    };

    reader.readAsDataURL(file);
  });
}; 