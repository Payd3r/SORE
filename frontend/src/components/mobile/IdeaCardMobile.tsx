import React, { useState } from 'react';
import type { Idea } from '../../api/ideas';
import { checkIdea } from '../../api/ideas';

interface IdeaCardMobileProps {
  idea: Idea;
  onCheckChange?: (ideaId: number, checked: boolean) => void;
  onClick?: () => void;
}

export default function IdeaCardMobile({ idea: initialIdea, onCheckChange, onClick }: IdeaCardMobileProps) {
  const [idea, setIdea] = useState(initialIdea);
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckboxClick = async (e: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isChecking) return;

    setIsChecking(true);
    try {
      const updatedIdea = await checkIdea(idea.id, idea.checked !== 1);
      setIdea(updatedIdea);
      onCheckChange?.(idea.id, updatedIdea.checked === 1);
    } catch (error) {
      console.error('Errore durante l\'aggiornamento:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick?.();
  };

  const getTypeColor = (type: string | undefined) => {
    if (!type) return {
      bg: 'bg-gray-50 dark:bg-gray-800/50',
      text: 'text-gray-700 dark:text-gray-300'
    };

    switch (type.toUpperCase()) {
      case 'RISTORANTI':
        return {
          bg: 'bg-orange-50/30 dark:bg-orange-900/10',
          text: 'text-orange-700 dark:text-orange-300'
        };
      case 'VIAGGI':
        return {
          bg: 'bg-blue-50/30 dark:bg-blue-900/10',
          text: 'text-blue-700 dark:text-blue-300'
        };
      case 'SFIDE':
        return {
          bg: 'bg-purple-50/30 dark:bg-purple-900/10',
          text: 'text-purple-700 dark:text-purple-300'
        };
      default:
        return {
          bg: 'bg-gray-50/30 dark:bg-gray-800/50',
          text: 'text-gray-700 dark:text-gray-300'
        };
    }
  };

  const colors = getTypeColor(idea.type);

  return (
    <div 
      className={`group relative ${colors.bg} rounded-xl backdrop-blur-sm shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden h-[70px] touch-manipulation active:scale-[0.98] transition-all duration-150`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
    >
      {/* Contenuto principale */}
      <div className="p-3 h-full flex items-center justify-center">
        <div className="flex items-center gap-3 w-full">
          {/* Checkbox di grandi dimensioni a sinistra */}
          <div 
            className="flex-shrink-0 mt-3"
            onClick={handleCheckboxClick}
            role="button"
            tabIndex={0}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              idea.checked === 1
                ? 'bg-blue-500 shadow-sm'
                : 'bg-white/80 dark:bg-gray-800/80 border-2 border-gray-300 dark:border-gray-600'
            } ${isChecking ? 'opacity-50' : ''}`}>
              {idea.checked === 1 && (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${colors.text} line-clamp-2`}>
              {idea.title}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
} 