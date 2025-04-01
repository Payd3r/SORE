import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { updatePassword } from '../../api/profile';

interface ChangePassModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ChangePassModal: React.FC<ChangePassModalProps> = ({ isOpen, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

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
            onClose();
            setFormData({
                oldPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Errore durante il cambio password');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center sm:items-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-t-2xl sm:rounded-lg bg-white dark:bg-gray-800 w-full sm:w-full sm:max-w-lg shadow-xl transition-all pb-6 sm:pb-0">
                                <div className="absolute right-0 top-0 pr-4 pt-4 sm:block">
                                    <button
                                        type="button"
                                        className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        <span className="sr-only">Chiudi</span>
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="px-4 sm:px-6 pt-5 pb-4 sm:pt-6 sm:pb-6">
                                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                        <Dialog.Title as="h3" className="text-xl sm:text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-6 sm:mb-4">
                                            Cambia Password
                                        </Dialog.Title>

                                        <form onSubmit={handleSubmit} className="mt-4 space-y-6 sm:space-y-4">
                                            <div className="space-y-4">
                                                <div>
                                                    <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        Password attuale
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="oldPassword"
                                                        value={formData.oldPassword}
                                                        onChange={(e) => setFormData(prev => ({ ...prev, oldPassword: e.target.value }))}
                                                        className="w-full px-4 py-3 sm:py-2 rounded-xl sm:rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
                                                        className="w-full px-4 py-3 sm:py-2 rounded-xl sm:rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
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
                                                        className="w-full px-4 py-3 sm:py-2 rounded-xl sm:rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    />
                                                </div>

                                                {error && (
                                                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 text-sm">
                                                        {error}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="mt-6 sm:mt-4 flex flex-col sm:flex-row-reverse gap-3 sm:gap-2">
                                                <button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full sm:w-auto px-5 py-3 sm:py-2 rounded-xl sm:rounded-lg bg-blue-600 text-white text-base sm:text-sm font-semibold shadow-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSubmitting ? 'Salvataggio...' : 'Salva'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={onClose}
                                                    className="w-full sm:w-auto px-5 py-3 sm:py-2 rounded-xl sm:rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-base sm:text-sm font-semibold border border-gray-300 dark:border-gray-600 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    Annulla
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}; 