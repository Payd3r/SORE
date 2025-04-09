import React from 'react';

export type LoaderSize = 'sm' | 'md' | 'lg';
export type LoaderType = 'spinner' | 'circle';

interface LoaderProps {
  size?: LoaderSize;
  type?: LoaderType;
  text?: string;
  subText?: string;
  fullScreen?: boolean;
  className?: string;
}

/**
 * Componente loader unificato che può essere utilizzato in tutta l'applicazione.
 * Supporta diversi tipi di loader, dimensioni e testi personalizzati.
 */
const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  type = 'spinner',
  text,
  subText,
  fullScreen = false,
  className = '',
}) => {
  // Dimensioni basate sulla proprietà size
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  // Stile del contenitore esterno
  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center z-50'
    : 'flex flex-col items-center justify-center';

  // Rendering del loader in base al tipo
  const renderLoader = () => {
    switch (type) {
      case 'circle':
        return (
          <div className={`relative ${sizeClasses[size]}`}>
            <div className="absolute inset-0 rounded-full border-[3px] border-blue-200 dark:border-blue-900/30"></div>
            <div className="absolute inset-0 rounded-full border-[3px] border-blue-500 dark:border-blue-400 border-t-transparent animate-spin"></div>
          </div>
        );
      case 'spinner':
      default:
        return (
          <div className={sizeClasses[size]}>
            <svg className="animate-spin w-full h-full text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        );
    }
  };

  return (
    <div className={`${containerClasses} ${className}`}>
      {renderLoader()}
      
      {text && (
        <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-300">
          {text}
        </p>
      )}
      
      {subText && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {subText}
        </p>
      )}
    </div>
  );
};

export default Loader; 