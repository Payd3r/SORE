import React, { useState } from 'react';
import type { Idea } from '../../api/ideas';
import { checkIdea } from '../../api/ideas';
import DetailIdeaModal from './DetailIdeaModal';

interface IdeaCardProps {
  idea: Idea;
  onCheckChange?: (ideaId: number, checked: boolean) => void;
  onClick?: () => void;
}

export default function IdeaCard({ idea: initialIdea, onCheckChange, onClick }: IdeaCardProps) {
  const [idea, setIdea] = useState(initialIdea);
  const [isChecking, setIsChecking] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCheckboxClick = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const getTypeColor = (type: string | undefined) => {
    if (!type) return {
      badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
      border: 'border-gray-500/20'
    };

    switch (type.toUpperCase()) {
      case 'RISTORANTI':
        return {
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
          border: 'border-orange-500/20'
        };
      case 'VIAGGI':
        return {
          badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
          border: 'border-blue-500/20'
        };
      case 'SFIDE':
        return {
          badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
          border: 'border-purple-500/20'
        };
      default:
        return {
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
          border: 'border-gray-500/20'
        };
    }
  };

  const colors = getTypeColor(idea.type);

  return (
    <>
      <div 
        className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-2 ${colors.border} min-h-[120px]`}
      >
        {/* Badge tipo */}
        <div className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
          {idea.type === 'RISTORANTI' && 'Ristorante'}
          {idea.type === 'VIAGGI' && 'Viaggio'}
          {idea.type === 'SFIDE' && 'Sfida'}
          {idea.type === 'SEMPLICI' && 'Semplice'}
        </div>

        {/* Checkbox */}
        <div 
          className="absolute top-2 right-2 z-10 checkbox-container cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handleCheckboxClick(e as any);
          }}
        >
          <input
            type="checkbox"
            checked={idea.checked === 1}
            onChange={handleCheckboxClick}
            disabled={isChecking}
            className="sr-only peer"
          />
          <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            idea.checked === 1
              ? 'bg-primary-500 border-primary-500'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-500 group-hover:scale-110'
          } ${isChecking ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {idea.checked === 1 && (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>

        {/* Contenuto principale */}
        <div 
          className="p-4 pt-12 cursor-pointer"
          onClick={onClick}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">
                {idea.title}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{idea.created_by_name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DetailIdeaModal
        idea={idea}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
} 