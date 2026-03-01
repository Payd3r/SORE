import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { getUserInfo, updateUserInfo } from "../../api/profile";
import type { UserInfo } from "../../api/types";
import { getImageUrl } from "../../api/images";
import { usePushNotifications } from "../../hooks/usePushNotifications";
import { useIsPwa } from "../../utils/isPwa";
import DeleteAccountModal from "../../desktop/components/Profile/DeleteAccountModal";
import PwaBottomSheet from "../components/ui/BottomSheet";
import EditProfileSheet from "../components/settings/EditProfileSheet";
import ChangePasswordSheet from "../components/settings/ChangePasswordSheet";
import { SettingsSkeleton } from "../components/skeletons";

export default function SettingsMobile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isPwaMode = useIsPwa();
  const { state: pushState, enablePush, disablePush } = usePushNotifications(isPwaMode);

  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangePassSheetOpen, setIsChangePassSheetOpen] = useState(false);
  const [isThemeUpdating, setIsThemeUpdating] = useState(false);

  const { data: userInfo, isLoading } = useQuery<UserInfo>({
    queryKey: ["user-info", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Utente non autenticato");
      return getUserInfo(parseInt(user.id));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const handleLogout = () => {
    logout();
    navigate("/welcome");
  };

  if (isLoading || !user) {
    return <SettingsSkeleton />;
  }

  const isDarkTheme =
    userInfo?.theme_preference === "dark" ||
    (userInfo?.theme_preference === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleThemeToggle = async () => {
    if (!user || isThemeUpdating) return;
    const nextTheme: "light" | "dark" = isDarkTheme ? "light" : "dark";
    setIsThemeUpdating(true);
    const el = document.documentElement;
    el.classList.remove("dark", "light");
    el.classList.add(nextTheme);
    try {
      const updated = await updateUserInfo({ theme_preference: nextTheme });
      updateUser({ ...user, theme_preference: updated.theme_preference });
      queryClient.invalidateQueries({ queryKey: ["user-info", user?.id] });
    } catch {
      updateUser({ ...user, theme_preference: nextTheme });
    } finally {
      setIsThemeUpdating(false);
    }
  };

  const navItems: { label: string; icon: string; path: string }[] = [
    { label: "Profilo", icon: "person", path: "/profilo" },
    { label: "Coppia", icon: "favorite", path: "/profilo/coppia" },
    { label: "Privacy e sicurezza", icon: "shield", path: "/profilo/privacy" },
    { label: "Condivisione", icon: "share", path: "/profilo/condivisione" },
    { label: "Centro assistenza", icon: "help", path: "/profilo/aiuto" },
  ];

  return (
    <section className="pwa-page">
      <header className="pwa-page-header">
        <h1 className="pwa-page-title">Impostazioni</h1>
        <p className="pwa-page-subtitle">
          Gestisci il tuo account, privacy e preferenze.
        </p>
      </header>

      {/* 1. Account */}
      {userInfo && (
        <div className="pwa-settings-section">
          <div className="pwa-settings-card">
            <h2 className="pwa-settings-card-title">Account</h2>
            <div className="pwa-settings-account-head">
              <div className="pwa-settings-account-avatar">
                {userInfo.profile_picture_url ? (
                  <img
                    src={getImageUrl(userInfo.profile_picture_url)}
                    alt=""
                  />
                ) : (
                  <span className="pwa-settings-account-avatar-initial">
                    {(userInfo.name || "U").charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="pwa-settings-account-info">
                <div className="pwa-settings-info-grid">
                  {userInfo.created_at && (
                    <div className="pwa-settings-info-item">
                      <span className="material-symbols-outlined">calendar_today</span>
                      <span>
                        Membro dal{" "}
                        {new Date(userInfo.created_at).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="pwa-gallery-filters-row" style={{ marginTop: "var(--pwa-spacing-md, 12px)" }}>
              <span className="pwa-gallery-filters-label">Tema scuro</span>
              <button
                type="button"
                role="switch"
                aria-checked={isDarkTheme}
                aria-label={isDarkTheme ? "Disattiva tema scuro" : "Attiva tema scuro"}
                disabled={isThemeUpdating}
                className={`pwa-gallery-filters-toggle ${isDarkTheme ? "pwa-gallery-filters-toggle-on" : ""}`}
                onClick={handleThemeToggle}
              >
                <span className="pwa-gallery-filters-toggle-thumb" />
              </button>
            </div>
            <button
              type="button"
              className="pwa-settings-btn pwa-settings-btn-primary"
              onClick={() => setIsEditSheetOpen(true)}
            >
              <span className="material-symbols-outlined">edit</span>
              Modifica profilo
            </button>
          </div>
        </div>
      )}

      {/* 2. Navigazione rapida */}
      <div className="pwa-settings-section">
        <div className="pwa-settings-card">
          <h2 className="pwa-settings-card-title">Naviga</h2>
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className="pwa-settings-row"
              onClick={() => navigate(item.path)}
            >
              <span className="pwa-settings-row-left">
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </span>
              <span className="material-symbols-outlined pwa-settings-row-arrow">
                chevron_right
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Privacy e sicurezza */}
      <div className="pwa-settings-section">
        <div className="pwa-settings-card">
          <h2 className="pwa-settings-card-title">Privacy e sicurezza</h2>

          <div className="pwa-settings-block">
            <h3 className="pwa-settings-block-title">Cambia password</h3>
            <p className="pwa-settings-block-desc">
              Aggiorna la tua password per maggiore sicurezza.
            </p>
            <button
              type="button"
              className="pwa-settings-btn pwa-settings-btn-primary"
              onClick={() => setIsChangePassSheetOpen(true)}
            >
              Cambia password
            </button>
          </div>

          <div className="pwa-settings-block">
            <h3 className="pwa-settings-block-title">Notifiche push</h3>
            <p className="pwa-settings-block-desc">
              {pushState.supported
                ? `Stato: ${pushState.permission}`
                : "Questo browser non supporta le notifiche push."}
            </p>
            {pushState.requiresPwaOnIOS && (
              <p className="pwa-settings-block-warn">
                Installa la PWA da Safari con &quot;Aggiungi a Home&quot; per
                le push su iPhone.
              </p>
            )}
            {pushState.error && (
              <p className="pwa-settings-block-error">{pushState.error}</p>
            )}
            <button
              type="button"
              className="pwa-settings-btn pwa-settings-btn-secondary"
              onClick={() => {
                if (pushState.enabled) void disablePush();
                else void enablePush();
              }}
              disabled={pushState.loading}
            >
              {pushState.loading
                ? "Aggiornamento..."
                : pushState.enabled
                  ? "Disattiva notifiche push"
                  : "Attiva notifiche push"}
            </button>
          </div>

          <div className="pwa-settings-block">
            <h3 className="pwa-settings-block-title">Elimina account</h3>
            <p className="pwa-settings-block-desc">
              Elimina definitivamente il tuo account e tutti i dati. Questa
              azione non è reversibile.
            </p>
            <button
              type="button"
              className="pwa-settings-btn pwa-settings-btn-danger"
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Elimina account
            </button>
          </div>
        </div>
      </div>

      {/* 4. Logout */}
      <div className="pwa-settings-section pwa-settings-logout-wrap">
        <button
          type="button"
          className="pwa-settings-logout-btn"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined">logout</span>
          Esci dall&apos;account
        </button>
      </div>

      <PwaBottomSheet
        open={isEditSheetOpen}
        onClose={() => setIsEditSheetOpen(false)}
      >
        <EditProfileSheet
          onClose={() => setIsEditSheetOpen(false)}
          onSaved={() => {
            if (user?.id) {
              queryClient.invalidateQueries({ queryKey: ["user-info", user.id] });
            }
          }}
        />
      </PwaBottomSheet>
      <PwaBottomSheet
        open={isChangePassSheetOpen}
        onClose={() => setIsChangePassSheetOpen(false)}
      >
        <ChangePasswordSheet onClose={() => setIsChangePassSheetOpen(false)} />
      </PwaBottomSheet>
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </section>
  );
}
