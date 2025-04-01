import { Fragment, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserInfo } from '../../api/profile';
import { uploadProfilePicture } from '../../api/profile';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verifica che il file sia un'immagine
      if (!file.type.startsWith('image/')) {
        setError('Il file selezionato non è un\'immagine');
        return;
      }

      // Verifica la dimensione del file (max 5MB)
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > MAX_FILE_SIZE) {
        setError('L\'immagine non può superare i 5MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      // Aggiorna i dati del profilo
      const updatedUserInfo = await updateUserInfo({
        name: formData.name,
        email: formData.email
      });

      // Converti l'ID in stringa per il formato AuthResponse['user']
      setUser({
        id: updatedUserInfo.id.toString(),
        name: updatedUserInfo.name,
        email: updatedUserInfo.email,
        profile_picture_url: updatedUserInfo.profile_picture_url
      });

      // Se è stata selezionata una nuova immagine, caricala
      if (selectedFile) {
        const updatedUser = await uploadProfilePicture(selectedFile);
        setUser(updatedUser);
      }

      setSuccess('Profilo aggiornato con successo');
      setTimeout(() => {
        onClose();
        // Pulisci il form
        setSelectedFile(null);
        setPreviewUrl(null);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore durante l\'aggiornamento del profilo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
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
                

                <div className="px-4 sm:px-6 pt-5 pb-4 sm:pt-6 sm:pb-6">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-xl sm:text-lg font-semibold leading-6 text-gray-900 dark:text-white mb-6 sm:mb-4">
                      Modifica Profilo
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-4 space-y-6 sm:space-y-4">
                      <div className="flex flex-col items-center mb-8 sm:mb-6">
                        <div 
                          className="relative w-36 h-36 sm:w-32 sm:h-32 group cursor-pointer"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {(previewUrl || user?.profile_picture_url) ? (
                            <img 
                              src={previewUrl || user?.profile_picture_url || ''} 
                              alt="Profile" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                              <PhotoIcon className="w-14 h-14 sm:w-12 sm:h-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-base sm:text-sm font-medium">Cambia foto</span>
                          </div>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome
                          </label>
                          <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 sm:py-2 rounded-xl sm:rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 sm:py-2 rounded-xl sm:rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
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
                          className="w-full sm:w-auto px-5 py-3 sm:py-2 rounded-xl sm:rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-base sm:text-sm font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
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
    </Transition.Root>
  );
} 