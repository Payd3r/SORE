import React, { useState } from 'react';
import { updatePassword } from '../../api/profile';
import { createPortal } from 'react-dom';
import { useQueryClient } from '@tanstack/react-query';

interface ChangePassModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePassModal: React.FC<ChangePassModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Le password non coincidono');
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('La password deve essere di almeno 6 caratteri');
            return;
        }

        try {
            setIsSubmitting(true);
            await updatePassword(formData.oldPassword, formData.newPassword);
            
            // Invalida le query per forzare l'aggiornamento dei dati
            queryClient.invalidateQueries({ queryKey: ['user-info'] });
            
            // Mostra un messaggio di successo prima di chiudere
            setSuccess('Password aggiornata con successo');
            
            // Reset del form
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            
            // Chiudi il modal dopo un breve ritardo
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Errore durante il cambio password');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div 
            className="fixed inset-0 z-[9999]"
            style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                height: '100vh',
                width: '100vw',
                position: 'fixed',
                top: 0,
                left: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-[90vw] sm:w-[30vw] max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
                style={{
                    position: 'relative',
                    margin: 'auto',
                    maxHeight: '90vh'
                }}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Cambia Password</h2>                        
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password attuale
                            </label>
                            <input
                                type="password"
                                id="oldPassword"
                                value={formData.oldPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, oldPassword: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nuova password
                            </label>
                            <input
                                type="password"
                                id="newPassword"
                                value={formData.newPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Conferma nuova password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 text-sm">
                                {error}
                            </div>
                        )}
                        
                        {success && (
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-200 text-sm">
                                {success}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                            >
                                Annulla
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Salvataggio...' : 'Salva'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}; 