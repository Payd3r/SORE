import { useState } from "react";
import { updatePassword } from "../../../api/profile";

type ChangePasswordSheetProps = {
  onClose: () => void;
  onSaved?: () => void;
};

export default function ChangePasswordSheet({ onClose, onSaved }: ChangePasswordSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Le password non coincidono");
      return;
    }
    if (formData.newPassword.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }
    try {
      setIsSubmitting(true);
      await updatePassword(formData.oldPassword, formData.newPassword);
      setSuccess("Password aggiornata");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
      onSaved?.();
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante il cambio password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pwa-settings-sheet">
      <h2 className="pwa-settings-sheet-title">Cambia password</h2>

      <form onSubmit={handleSubmit} className="pwa-settings-sheet-form">
        <label className="pwa-settings-sheet-label">Password attuale</label>
        <input
          type="password"
          className="pwa-settings-sheet-input"
          value={formData.oldPassword}
          onChange={(e) => setFormData((prev) => ({ ...prev, oldPassword: e.target.value }))}
          required
          autoComplete="current-password"
        />

        <label className="pwa-settings-sheet-label">Nuova password</label>
        <input
          type="password"
          className="pwa-settings-sheet-input"
          value={formData.newPassword}
          onChange={(e) => setFormData((prev) => ({ ...prev, newPassword: e.target.value }))}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <label className="pwa-settings-sheet-label">Conferma nuova password</label>
        <input
          type="password"
          className="pwa-settings-sheet-input"
          value={formData.confirmPassword}
          onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
          required
          minLength={6}
          autoComplete="new-password"
        />

        {error && <p className="pwa-settings-sheet-error">{error}</p>}
        {success && <p className="pwa-settings-sheet-success">{success}</p>}

        <div className="pwa-settings-sheet-actions">
          <button
            type="button"
            className="pwa-idea-detail-btn pwa-idea-detail-btn-cancel"
            onClick={onClose}
          >
            Annulla
          </button>
          <button
            type="submit"
            className="pwa-idea-detail-btn pwa-idea-detail-btn-save"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvataggio..." : "Salva"}
          </button>
        </div>
      </form>
    </div>
  );
}
