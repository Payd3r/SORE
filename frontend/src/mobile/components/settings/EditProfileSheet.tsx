import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { updateUserInfo, uploadProfilePicture } from "../../../api/profile";
import { getImageUrl } from "../../../api/images";

type EditProfileSheetProps = {
  onClose: () => void;
  onSaved?: () => void;
};

export default function EditProfileSheet({ onClose, onSaved }: EditProfileSheetProps) {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    theme_preference: (user?.theme_preference as "light" | "dark" | "system") || "system",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      theme_preference: (user?.theme_preference as "light" | "dark" | "system") || "system",
    });
    setSuccess(null);
    setError(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);
    try {
      let profilePictureUrl = user?.profile_picture_url;
      if (selectedFile) {
        const response = await uploadProfilePicture(selectedFile);
        profilePictureUrl = response.profile_picture_url;
      }
      await updateUserInfo({
        name: formData.name,
        email: formData.email,
        profile_picture_url: profilePictureUrl ?? undefined,
        theme_preference: formData.theme_preference,
      });
      const updatedUser = {
        ...user!,
        name: formData.name,
        email: formData.email,
        profile_picture_url: profilePictureUrl ?? null,
        theme_preference: formData.theme_preference,
      };
      updateUser(updatedUser);
      setSuccess("Profilo aggiornato");
      onSaved?.();
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante l'aggiornamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarUrl = previewUrl || (user?.profile_picture_url ? getImageUrl(user.profile_picture_url) : "");
  const displayInitial = (user?.name || "U").charAt(0).toUpperCase();

  return (
    <div className="pwa-settings-sheet">
      <h2 className="pwa-settings-sheet-title">Modifica profilo</h2>

      <form onSubmit={handleSubmit} className="pwa-settings-sheet-form">
        <div className="pwa-settings-sheet-avatar-wrap">
          <button
            type="button"
            className="pwa-settings-sheet-avatar-btn"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Cambia foto"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="pwa-settings-sheet-avatar-img" />
            ) : (
              <span className="pwa-settings-sheet-avatar-initial">{displayInitial}</span>
            )}
            <span className="pwa-settings-sheet-avatar-edit">
              <span className="material-symbols-outlined">photo_camera</span>
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="pwa-settings-sheet-file-input"
            aria-hidden
          />
        </div>

        <label className="pwa-settings-sheet-label">Nome</label>
        <input
          type="text"
          className="pwa-settings-sheet-input"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          autoComplete="name"
        />

        <label className="pwa-settings-sheet-label">Email</label>
        <input
          type="email"
          className="pwa-settings-sheet-input"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          autoComplete="email"
        />

        <label className="pwa-settings-sheet-label">Tema</label>
        <select
          className="pwa-settings-sheet-input pwa-settings-sheet-select"
          value={formData.theme_preference}
          onChange={(e) =>
            setFormData({
              ...formData,
              theme_preference: e.target.value as "light" | "dark" | "system",
            })
          }
        >
          <option value="system">Sistema</option>
          <option value="light">Chiaro</option>
          <option value="dark">Scuro</option>
        </select>

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
