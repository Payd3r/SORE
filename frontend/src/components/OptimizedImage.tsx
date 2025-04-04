import React, { useEffect, useState } from 'react';
import { imageCache } from '../utils/imageCache';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
}) => {
  const [imageUrl, setImageUrl] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        const cachedUrl = await imageCache.getImage(src);
        if (isMounted) {
          setImageUrl(cachedUrl);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Errore nel caricamento dell\'immagine:', error);
        if (isMounted) {
          setImageUrl(src);
          setIsLoading(false);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [src]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      <img
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading="lazy"
      />
    </div>
  );
}; 