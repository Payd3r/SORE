import { useState, useEffect } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onClick?: () => void;
}

export default function LazyImage({ src, alt, className = '', placeholderClassName = '', onClick }: LazyImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError(true);
      setIsLoading(false);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (error) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <span className="text-sm text-gray-500 dark:text-gray-400">Errore</span>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`bg-gray-200 dark:bg-gray-800 animate-pulse ${placeholderClassName || className}`} />
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`${className} ${isLoading ? 'hidden' : 'block'}`}
          onClick={onClick}
          loading="lazy"
        />
      )}
    </>
  );
} 