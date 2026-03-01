import { useState, useEffect } from "react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Memory } from "../../../api/memory";

type MemoryDetailSheetFuturoProps = {
  memory: Memory;
  onClose: () => void;
  onSave: (data: Partial<Memory>) => Promise<void>;
  onDelete: () => void;
  onShare?: () => void;
};

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "d MMM yyyy", { locale: it });
  } catch {
    return "";
  }
}

function toInputDate(dateString: string | null) {
  if (!dateString) return "";
  try {
    return format(new Date(dateString), "yyyy-MM-dd", { locale: it });
  } catch {
    return "";
  }
}

export default function MemoryDetailSheetFuturo({
  memory,
  onSave,
  onDelete,
  onShare,
}: MemoryDetailSheetFuturoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState(memory.title);
  const [editStartDate, setEditStartDate] = useState(toInputDate(memory.start_date));
  const [editEndDate, setEditEndDate] = useState(toInputDate(memory.end_date));
  const [editLocation, setEditLocation] = useState(memory.location ?? "");
  const [editSong, setEditSong] = useState(memory.song ?? "");

  useEffect(() => {
    setEditTitle(memory.title);
    setEditStartDate(toInputDate(memory.start_date));
    setEditEndDate(toInputDate(memory.end_date));
    setEditLocation(memory.location ?? "");
    setEditSong(memory.song ?? "");
    if (!memory.id) setIsEditing(false);
  }, [memory.id, memory.title, memory.start_date, memory.end_date, memory.location, memory.song]);

  const startStr = formatDate(memory.start_date);
  const endStr = memory.end_date ? formatDate(memory.end_date) : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Partial<Memory> = {
        title: editTitle.trim(),
        start_date: editStartDate || null,
        end_date: editEndDate || null,
        location: editLocation.trim() || undefined,
        song: editSong.trim() || undefined,
      };
      if (!payload.end_date) delete payload.end_date;
      await onSave(payload);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(memory.title);
    setEditStartDate(toInputDate(memory.start_date));
    setEditEndDate(toInputDate(memory.end_date));
    setEditLocation(memory.location ?? "");
    setEditSong(memory.song ?? "");
    setIsEditing(false);
  };

  return (
    <div className="pwa-idea-detail-sheet">
      <div className="pwa-idea-detail-badges-row">
        <span className="pwa-idea-detail-type-badge">Futuro</span>
        {startStr && (
          <span className="pwa-idea-detail-date-badge">
            {startStr}
            {endStr && endStr !== startStr ? ` – ${endStr}` : ""}
          </span>
        )}
      </div>

      {isEditing ? (
        <>
          <input
            type="text"
            className="pwa-idea-detail-input pwa-idea-detail-title-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Titolo"
            aria-label="Titolo"
          />
          <label className="pwa-memory-detail-futuro-edit-label">
            Data (opzionale)
            <input
              type="date"
              className="pwa-idea-detail-input"
              value={editStartDate}
              onChange={(e) => setEditStartDate(e.target.value)}
              aria-label="Data"
            />
          </label>
          <label className="pwa-memory-detail-futuro-edit-label">
            Data fine (opzionale)
            <input
              type="date"
              className="pwa-idea-detail-input"
              value={editEndDate}
              onChange={(e) => setEditEndDate(e.target.value)}
              min={editStartDate || undefined}
              aria-label="Data fine"
            />
          </label>
          <input
            type="text"
            className="pwa-idea-detail-input"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
            placeholder="Luogo"
            aria-label="Luogo"
          />
          <input
            type="text"
            className="pwa-idea-detail-input"
            value={editSong}
            onChange={(e) => setEditSong(e.target.value)}
            placeholder="Canzone"
            aria-label="Canzone"
          />
          <div className="pwa-idea-detail-actions">
            <button
              type="button"
              className="pwa-idea-detail-btn pwa-idea-detail-btn-cancel"
              onClick={handleCancelEdit}
            >
              Annulla
            </button>
            <button
              type="button"
              className="pwa-idea-detail-btn pwa-idea-detail-btn-save"
              onClick={handleSave}
              disabled={saving || !editTitle.trim()}
            >
              {saving ? "Salvataggio..." : "Conferma"}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="pwa-idea-detail-title">{memory.title}</h2>
          <p className="pwa-idea-detail-desc pwa-memory-detail-meta">
            <span className="material-symbols-outlined pwa-memory-detail-meta-icon">calendar_today</span>
            {startStr
              ? (endStr && endStr !== startStr ? `${startStr} – ${endStr}` : startStr)
              : "Non impostata"}
          </p>
          {memory.location && (
            <p className="pwa-idea-detail-desc pwa-memory-detail-meta">
              <span className="material-symbols-outlined pwa-memory-detail-meta-icon">location_on</span>
              {memory.location}
            </p>
          )}
          {memory.song && (
            <p className="pwa-idea-detail-desc pwa-memory-detail-meta">
              <span className="material-symbols-outlined pwa-memory-detail-meta-icon">music_note</span>
              {memory.song.split(" - ").slice(0, 2).join(" - ")}
            </p>
          )}
          <div className="pwa-idea-detail-actions pwa-memory-detail-futuro-actions">
            <button
              type="button"
              className="pwa-memory-detail-futuro-btn-elimina"
              onClick={onDelete}
              aria-label="Elimina"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
            <button
              type="button"
              className="pwa-memory-detail-futuro-btn-condividi"
              onClick={onShare}
              aria-label="Condividi"
            >
              <span className="material-symbols-outlined">share</span>
            </button>
            <button
              type="button"
              className="pwa-memory-detail-futuro-btn-modifica"
              onClick={() => setIsEditing(true)}
              aria-label="Modifica"
            >
              <span className="material-symbols-outlined">edit</span>
              Modifica
            </button>
          </div>
        </>
      )}
    </div>
  );
}
