import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { uploadImages, pollImageStatus } from "../../../api/images";
import { invalidateOnMemoryChange } from "../../utils/queryInvalidations";

type DetailGalleryUploadSheetProps = {
  memoryId: number;
  onClose: () => void;
};

const MAX_IMAGES = 100;

export default function DetailGalleryUploadSheet({
  memoryId,
  onClose,
}: DetailGalleryUploadSheetProps) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (!inputFiles) return;
    const list = Array.from(inputFiles);
    const next = [...files, ...list];
    if (next.length > MAX_IMAGES) {
      setError(`Massimo ${MAX_IMAGES} immagini.`);
      return;
    }
    setError(null);
    setFiles(next);
    e.target.value = "";
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Seleziona almeno un'immagine.");
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await uploadImages(files, memoryId);
      for (const { jobId } of res.data) {
        await new Promise<void>((resolve) => {
          pollImageStatus(jobId, (status) => {
            if (status.state === "completed") {
              void invalidateOnMemoryChange(queryClient, memoryId);
              resolve();
            } else if (status.state === "failed") {
              resolve();
            }
          });
        });
      }
      setFiles([]);
      onClose();
    } catch (err) {
      console.error(err);
      setError("Caricamento fallito. Riprova.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pwa-idea-detail-sheet">
      <div className="pwa-memory-edit-sheet-header">
        <h2 className="pwa-memory-edit-sheet-title">Aggiungi foto</h2>
        <button
          type="button"
          className="pwa-memory-detail-futuro-close"
          onClick={onClose}
          aria-label="Chiudi"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      {error && (
        <p className="pwa-detail-gallery-upload-error" role="alert">
          {error}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="pwa-detail-gallery-upload-input"
        onChange={onSelect}
        aria-label="Seleziona immagini"
      />
      <button
        type="button"
        className="pwa-detail-gallery-upload-trigger"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        <span className="material-symbols-outlined">add_photo_alternate</span>
        Seleziona immagini
      </button>
      {files.length > 0 && (
        <>
          <p className="pwa-detail-gallery-upload-count">
            {files.length} {files.length === 1 ? "file selezionato" : "file selezionati"}
          </p>
          <button
            type="button"
            className="pwa-idea-detail-btn pwa-idea-detail-btn-cancel"
            onClick={() => setFiles([])}
          >
            Svuota
          </button>
        </>
      )}
      <div className="pwa-idea-detail-actions">
        <button
          type="button"
          className="pwa-idea-detail-btn pwa-idea-detail-btn-cancel"
          onClick={onClose}
        >
          Annulla
        </button>
        <button
          type="button"
          className="pwa-idea-detail-btn pwa-idea-detail-btn-save"
          disabled={uploading || files.length === 0}
          onClick={handleUpload}
        >
          {uploading ? "Caricamento..." : "Carica"}
        </button>
      </div>
    </div>
  );
}
