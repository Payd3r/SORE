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
  const [showMenu, setShowMenu] = useState(false);

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

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(true);
    onClick?.();
  };

  const getTypeColor = (type: string | undefined) => {
    if (!type) return {
      bg: 'bg-gray-50 dark:bg-gray-800/50',
      text: 'text-gray-700 dark:text-gray-300',
      badge: 'bg-gray-200 dark:bg-gray-700'
    };
    switch (type.toUpperCase()) {
      case 'RISTORANTI':
        return {
          bg: 'bg-orange-50/30 dark:bg-orange-900/10',
          text: 'text-orange-700 dark:text-orange-300',
          badge: 'bg-orange-500'
        };
      case 'VIAGGI':
        return {
          bg: 'bg-blue-50/30 dark:bg-blue-900/10',
          text: 'text-blue-700 dark:text-blue-300',
          badge: 'bg-blue-500'
        };
      case 'SFIDE':
        return {
          bg: 'bg-purple-50/30 dark:bg-purple-900/10',
          text: 'text-purple-700 dark:text-purple-300',
          badge: 'bg-purple-500'
        };
      default:
        return {
          bg: 'bg-gray-50/30 dark:bg-gray-800/50',
          text: 'text-gray-700 dark:text-gray-300',
          badge: 'bg-gray-400'
        };
    }
  };

  const colors = getTypeColor(idea.type);

  return (
    <div
      className={`group relative ${colors.bg} pb-0 rounded-xl backdrop-blur-sm shadow-sm border border-gray-200/50 dark:border-gray-700/50 overflow-hidden min-h-[50px] h-[50px] flex items-center px-2 pr-1 touch-manipulation active:scale-[0.98] transition-all duration-150`}
      role="button"
      tabIndex={0}
    >
      {/* Checkbox grande a sinistra */}
      <div
        className="flex-shrink-0 mr-3 mt-2"
        onClick={handleCheckboxClick}
        role="button"
        tabIndex={0}
      >
        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
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
      {/* Contenuto centrale: titolo e descrizione */}
      <div className="flex-1 flex flex-col justify-center min-w-0">
        <div className={`text-[15px] font-medium leading-tight truncate ${colors.text}`}>{idea.title}</div>
        <div className="flex items-center gap-2 mt-0.5">
          {/* Badge tipo */}
          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors.badge} text-white`}>{idea.type}</span>
          {/* Descrizione */}
          {idea.description && (
            <span className="text-xs text-gray-500 dark:text-gray-300 truncate max-w-[120px]">{idea.description}</span>
          )}
        </div>
      </div>
      {/* Tre puntini a destra */}
      <button
        className="ml-2 flex-shrink-0 p-2 rounded-full hover:bg-gray-200/60 dark:hover:bg-gray-700/60 bg-transparent"
        onClick={handleMenuClick}
        aria-label="Dettagli idea"
      >
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="5" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="19" cy="12" r="2" />
        </svg>
      </button>
    </div>
  );
} 