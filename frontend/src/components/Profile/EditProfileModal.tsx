import { Fragment, useState, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Chiudi</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                      Modifica Profilo
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                      <div className="flex flex-col items-center mb-6">
                        <div 
                          className="relative w-32 h-32 group cursor-pointer"
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
                              <PhotoIcon className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-sm">Cambia foto</span>
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
                      <div>
                        <label htmlFor="name" className="form-label">
                          Nome
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="input-base"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="input-base"
                          required
                        />
                      </div>
                      {error && (
                        <div className="badge-danger">{error}</div>
                      )}
                      {success && (
                        <div className="badge-success">{success}</div>
                      )}
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Salvataggio...' : 'Salva'}
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 sm:mt-0 sm:w-auto"
                          onClick={onClose}
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