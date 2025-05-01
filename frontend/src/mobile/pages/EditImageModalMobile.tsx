import { useState, useEffect, useRef } from 'react';
import { it } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { updateImageMetadata } from '../../api/images';

interface EditImageModalMobileProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: string;
    type: string;
    created_at: string;
    display_order?: number | null;
  } | null;
  onSave?: (updated: { type: string; created_at: string; display_order?: number | null }) => void;
}

export default function EditImageModalMobile({ isOpen, onClose, image, onSave }: EditImageModalMobileProps) {
  const [editData, setEditData] = useState({
    type: image?.type || 'cibo',
    created_at: image?.created_at && !isNaN(Date.parse(image.created_at)) ? new Date(image.created_at) : new Date(),
    display_order: image?.display_order ?? ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const orderInputRef = useRef<HTMLInputElement>(null);
  const [showOrderMenu, setShowOrderMenu] = useState(false);
  const orderMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (image) {
      setEditData({
        type: image.type || 'cibo',
        created_at: image.created_at && !isNaN(Date.parse(image.created_at)) ? new Date(image.created_at) : new Date(),
        display_order: image.display_order ?? ''
      });
    }
  }, [image]);

  useEffect(() => {
    if (isOpen && orderInputRef.current) {
      setTimeout(() => {
        orderInputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Chiudi il menu custom se clicchi fuori
  useEffect(() => {
    if (!showOrderMenu) return;
    const handleClick = (e: MouseEvent) => {
      if (orderMenuRef.current && !orderMenuRef.current.contains(e.target as Node)) {
        setShowOrderMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showOrderMenu]);

  if (!isOpen || !image) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const date = editData.created_at instanceof Date && !isNaN(editData.created_at.getTime()) ? new Date(editData.created_at) : new Date();
      date.setHours(12, 0, 0, 0);
      const newOrder = editData.display_order === '' ? null : Number(editData.display_order);
      await updateImageMetadata(image.id, {
        type: editData.type,
        created_at: date.toISOString(),
        display_order: newOrder
      });
      if (onSave) {
        onSave({
          type: editData.type,
          created_at: date.toISOString(),
          display_order: newOrder
        });
      }
      onClose();
    } catch (error) {
      alert('Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center"
      style={{ touchAction: 'auto', pointerEvents: 'auto' }}
      onTouchStart={e => e.stopPropagation()}
      onTouchMove={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <div
        className="bg-white rounded-xl p-5 w-[90vw] max-w-md mx-auto"
        style={{ pointerEvents: 'auto' }}
        onTouchStart={e => e.stopPropagation()}
        onTouchMove={e => e.stopPropagation()}
        onTouchEnd={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 text-center">Modifica immagine</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select
              value={editData.type}
              onChange={e => setEditData({ ...editData, type: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
            >
              <option value="cibo">CIBO</option>
              <option value="coppia">COPPIA</option>
              <option value="singolo">SINGOLO</option>
              <option value="paesaggio">LUOGO</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <DatePicker
              selected={editData.created_at instanceof Date && !isNaN(editData.created_at.getTime()) ? editData.created_at : new Date()}
              onChange={date => setEditData({ ...editData, created_at: date || new Date() })}
              dateFormat="dd/MM/yyyy"
              locale={it}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50"
            />
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Ordine (1-8)</label>
            <button
              type="button"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-left"
              onClick={e => { e.stopPropagation(); setShowOrderMenu(true); }}
            >
              {editData.display_order === '' || editData.display_order === null
                ? 'Nessun ordine'
                : `Ordine ${editData.display_order}`}
            </button>
            {showOrderMenu && (
              <div ref={orderMenuRef} className="absolute left-0 right-0 top-14 z-50 bg-white border rounded-xl shadow-lg mt-1 overflow-hidden">
                <button
                  className={`block w-full px-4 py-0 text-left hover:bg-gray-100 bg-transparent ${editData.display_order === '' ? 'font-semibold text-blue-600' : ''}`}
                  onClick={e => { e.stopPropagation(); setEditData({ ...editData, display_order: '' }); setShowOrderMenu(false); }}
                >Nessun ordine</button>
                {[1,2,3,4,5,6,7,8].map(n => (
                  <button
                    key={n}
                    className={`block w-full px-4 py-0 text-left hover:bg-gray-100 bg-transparent ${editData.display_order === String(n) ? 'font-semibold text-blue-600' : ''}`}
                    onClick={e => { e.stopPropagation(); setEditData({ ...editData, display_order: String(n) }); setShowOrderMenu(false); }}
                  >{n}</button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium"
            disabled={isSaving}
          >
            Annulla
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-medium"
          >
            {isSaving ? 'Salvando...' : 'Salva'}
          </button>
        </div>
      </div>
    </div>
  );
} 