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
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex justify-between items-center"
                                >
                                    Cambia Password
                                </Dialog.Title>

                                <form onSubmit={handleSubmit} className="mt-4">
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="oldPassword" className="form-label">
                                                Password attuale
                                            </label>
                                            <input
                                                type="password"
                                                id="oldPassword"
                                                value={formData.oldPassword}
                                                onChange={(e) => setFormData(prev => ({ ...prev, oldPassword: e.target.value }))}
                                                className="input-base"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="newPassword" className="form-label">
                                                Nuova password
                                            </label>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="input-base"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="form-label">
                                                Conferma nuova password
                                            </label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                className="input-base"
                                                required
                                            />
                                        </div>

                                        {error && (
                                            <div className="badge-danger">
                                                {error}
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="inline-flex justify-center rounded-md border border-gray-300 bg-transparent dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                        >
                                            Annulla
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="inline-flex justify-center rounded-md border border-transparent bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isSubmitting ? 'Salvataggio...' : 'Salva'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}; 