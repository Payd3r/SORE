import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../contexts/AuthContext";
import { getUserInfo, getCoupleInfo } from "../../api/profile";
import type { UserInfo, CoupleInfo } from "../../api/types";
import {
  getRecapData,
  getRecapConfronto,
  getRecapAttivita,
  type RecapStats,
  type RecapConfronto,
  type RecapAttivita,
} from "../../api/recap";
import { getImageUrl } from "../../api/images";
import ProfileHeader from "../components/layout/ProfileHeader";
import { ProfileSkeleton } from "../components/skeletons";

export default function ProfileMobile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: userInfo, isLoading: isLoadingUser } = useQuery<UserInfo>({
    queryKey: ["user-info", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("Utente non autenticato");
      return getUserInfo(parseInt(user.id));
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: coupleInfo, isLoading: isLoadingCouple } = useQuery<CoupleInfo>({
    queryKey: ["couple-info", userInfo?.couple_id],
    queryFn: async () => {
      if (!userInfo?.couple_id) throw new Error("Nessuna coppia associata");
      return getCoupleInfo(userInfo.couple_id);
    },
    enabled: !!userInfo?.couple_id,
    staleTime: 5 * 60 * 1000,
  });

  const { data: recapData } = useQuery<RecapStats>({
    queryKey: ["recap-data"],
    queryFn: getRecapData,
    staleTime: 5 * 60 * 1000,
  });

  const { data: confrontoData } = useQuery<RecapConfronto>({
    queryKey: ["recap-confronto"],
    queryFn: getRecapConfronto,
    staleTime: 5 * 60 * 1000,
  });

  const { data: attivitaData } = useQuery<RecapAttivita>({
    queryKey: ["recap-attivita"],
    queryFn: getRecapAttivita,
    staleTime: 5 * 60 * 1000,
  });

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  useEffect(() => {
    const firstId = confrontoData?.data?.users?.[0]?.id_utente;
    if (firstId != null) {
      setSelectedUserId((prev) => (prev === null ? firstId : prev));
    }
  }, [confrontoData]);

  const handleLogout = () => {
    logout();
    navigate("/welcome");
  };

  const isLoading = isLoadingUser || isLoadingCouple;
  const error =
    !user?.id
      ? "Utente non autenticato"
      : !userInfo?.couple_id
        ? "Nessuna coppia associata all'utente"
        : null;

  if (isLoading || !user) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <section className="pwa-page">
        <ProfileHeader />
        <div className="pwa-page-card" style={{ marginTop: "1rem" }}>
          <p style={{ color: "var(--pwa-accent-red)" }}>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pwa-page">
      <ProfileHeader />

      {/* Statistiche coppia – stile desktop riadattato */}
      {coupleInfo && (
        <div key="couple-stats" className="pwa-settings-section">
          <div className="pwa-settings-card pwa-profile-stats-card">
            <div className="pwa-profile-stats-header">
              <h2 className="pwa-profile-couple-name">{coupleInfo.name}</h2>
              {coupleInfo.anniversary_date && (
                <div className="pwa-profile-anniversary">
                  <span className="material-symbols-outlined">calendar_today</span>
                  <span>
                    Anniversario:{" "}
                    {new Date(coupleInfo.anniversary_date).toLocaleDateString(
                      "it-IT",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              )}
              <p className="pwa-profile-stats-subtitle">La vostra storia</p>
            </div>
            <div className="pwa-profile-stats">
              <div className="pwa-profile-stat-card pwa-profile-stat-ricordi">
                <span className="pwa-profile-stat-value">
                  {coupleInfo.num_ricordi ?? 0}
                </span>
                <span className="pwa-profile-stat-label">Ricordi</span>
              </div>
              <div className="pwa-profile-stat-card pwa-profile-stat-foto">
                <span className="pwa-profile-stat-value">
                  {coupleInfo.num_foto ?? 0}
                </span>
                <span className="pwa-profile-stat-label">Foto</span>
              </div>
              <div className="pwa-profile-stat-card pwa-profile-stat-idee">
                <span className="pwa-profile-stat-value">
                  {coupleInfo.num_idee ?? 0}
                </span>
                <span className="pwa-profile-stat-label">Idee</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Membri coppia */}
      {coupleInfo?.membri && coupleInfo.membri.length > 0 && userInfo && (
        <div key="couple-members" className="pwa-settings-section">
          <div className="pwa-settings-card">
            <h2 className="pwa-settings-card-title">Membri</h2>
            <div className="pwa-profile-members">
              {coupleInfo.membri.map((membro) => (
                <div
                  key={membro.id}
                  className={`pwa-profile-member-row ${
                    membro.id === userInfo.id ? "pwa-profile-member-current" : ""
                  }`}
                >
                  <div
                    className={`pwa-profile-member-avatar ${
                      membro.id === userInfo.id
                        ? "pwa-profile-member-avatar-current"
                        : ""
                    }`}
                  >
                    {membro.name[0].toUpperCase()}
                  </div>
                  <div className="pwa-profile-member-info">
                    <span className="pwa-profile-member-name">
                      {membro.name}
                    </span>
                    <span className="pwa-profile-member-email">
                      {membro.email}
                    </span>
                    {membro.id === userInfo.id && (
                      <span className="pwa-profile-member-badge">Tu</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recap – Panoramica */}
      {recapData?.data && (
        <>
          <div key="recap-stats" className="pwa-settings-section">
            <div className="pwa-settings-card">
              <h2 className="pwa-settings-card-title">Recap – La vostra storia</h2>
              <div className="pwa-recap-stats-grid">
                <div className="pwa-recap-stat-item pwa-recap-stat-ricordi">
                  <span className="material-symbols-outlined">menu_book</span>
                  <span className="pwa-recap-stat-value">{recapData.data.statistics.tot_ricordi ?? 0}</span>
                  <span className="pwa-recap-stat-label">Ricordi</span>
                </div>
                <div className="pwa-recap-stat-item pwa-recap-stat-foto">
                  <span className="material-symbols-outlined">photo_library</span>
                  <span className="pwa-recap-stat-value">{recapData.data.statistics.tot_foto ?? 0}</span>
                  <span className="pwa-recap-stat-label">Foto</span>
                </div>
                <div className="pwa-recap-stat-item pwa-recap-stat-idee">
                  <span className="material-symbols-outlined">lightbulb</span>
                  <span className="pwa-recap-stat-value">{recapData.data.statistics.tot_idee ?? 0}</span>
                  <span className="pwa-recap-stat-label">Idee</span>
                </div>
                <div className="pwa-recap-stat-item pwa-recap-stat-luoghi">
                  <span className="material-symbols-outlined">place</span>
                  <span className="pwa-recap-stat-value">{recapData.data.statistics.tot_luoghi ?? 0}</span>
                  <span className="pwa-recap-stat-label">Luoghi</span>
                </div>
              </div>
            </div>
          </div>

          <div key="recap-bars" className="pwa-settings-section">
            <div className="pwa-settings-card">
              <h2 className="pwa-settings-card-title">Ricordi per tipo</h2>
              <div className="pwa-recap-bars">
                <div className="pwa-recap-bar-row">
                  <span className="pwa-recap-bar-label">Viaggi</span>
                  <div className="pwa-recap-bar-track">
                    <div
                      className="pwa-recap-bar-fill pwa-recap-bar-blue"
                      style={{
                        width: `${((recapData.data.statistics.tot_ricordi_viaggi ?? 0) / (recapData.data.statistics.tot_ricordi || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="pwa-recap-bar-value">{recapData.data.statistics.tot_ricordi_viaggi ?? 0}</span>
                </div>
                <div className="pwa-recap-bar-row">
                  <span className="pwa-recap-bar-label">Eventi</span>
                  <div className="pwa-recap-bar-track">
                    <div
                      className="pwa-recap-bar-fill pwa-recap-bar-purple"
                      style={{
                        width: `${((recapData.data.statistics.tot_ricordi_eventi ?? 0) / (recapData.data.statistics.tot_ricordi || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="pwa-recap-bar-value">{recapData.data.statistics.tot_ricordi_eventi ?? 0}</span>
                </div>
                <div className="pwa-recap-bar-row">
                  <span className="pwa-recap-bar-label">Semplici</span>
                  <div className="pwa-recap-bar-track">
                    <div
                      className="pwa-recap-bar-fill pwa-recap-bar-green"
                      style={{
                        width: `${((recapData.data.statistics.tot_ricordi_semplici ?? 0) / (recapData.data.statistics.tot_ricordi || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="pwa-recap-bar-value">{recapData.data.statistics.tot_ricordi_semplici ?? 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div key="recap-idee" className="pwa-settings-section">
            <div className="pwa-settings-card">
              <h2 className="pwa-settings-card-title">Idee e progetti</h2>
              <div className="pwa-recap-idee-row">
                <div className="pwa-recap-idee-box pwa-recap-idee-done">
                  <span className="pwa-recap-idee-num">{recapData.data.statistics.tot_idee_checked ?? 0}</span>
                  <span className="pwa-recap-idee-label">Completate</span>
                </div>
                <div className="pwa-recap-idee-box pwa-recap-idee-todo">
                  <span className="pwa-recap-idee-num">{recapData.data.statistics.tot_idee_unchecked ?? 0}</span>
                  <span className="pwa-recap-idee-label">Da fare</span>
                </div>
              </div>
              <div className="pwa-recap-bar-track pwa-recap-progress-bar">
                <div
                  className="pwa-recap-bar-fill pwa-recap-bar-green"
                  style={{
                    width: `${((recapData.data.statistics.tot_idee_checked ?? 0) / (recapData.data.statistics.tot_idee || 1)) * 100}%`,
                  }}
                />
              </div>
              <p className="pwa-recap-progress-label">Progresso totale</p>
            </div>
          </div>

          {recapData.data.luoghi?.length > 0 && (
            <div key="recap-luoghi" className="pwa-settings-section">
              <div className="pwa-settings-card">
                <h2 className="pwa-settings-card-title">Luoghi più visitati</h2>
                <ul className="pwa-recap-list">
                  {recapData.data.luoghi.slice(0, 5).map((luogo, index) => (
                    <li key={luogo.location} className="pwa-recap-list-item">
                      <span className="pwa-recap-list-num">{index + 1}</span>
                      <span className="pwa-recap-list-text">{luogo.location}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {recapData.data.canzoni?.length > 0 && (
            <div key="recap-canzoni" className="pwa-settings-section">
              <div className="pwa-settings-card">
                <h2 className="pwa-settings-card-title">Canzoni dei ricordi</h2>
                <ul className="pwa-recap-songs">
                  {recapData.data.canzoni.slice(0, 8).map((canzone) => (
                    <li key={canzone.song} className="pwa-recap-song-item">
                      <span className="material-symbols-outlined">music_note</span>
                      <span className="pwa-recap-song-title">{canzone.song}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}

      {/* Recap – Attività */}
      {attivitaData?.data && (
        <>
          {attivitaData.data.images?.length > 0 && (
            <div key="attivita-images" className="pwa-settings-section">
              <div className="pwa-settings-card">
                <h2 className="pwa-settings-card-title">Immagini recenti</h2>
                <div className="pwa-recap-images-grid">
                  {attivitaData.data.images.slice(0, 12).map((image) => (
                    <div key={image.id} className="pwa-recap-image-cell">
                      <img
                        src={getImageUrl(image.thumb_big_path)}
                        alt=""
                        className="pwa-recap-image-img"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {attivitaData.data.memories?.length > 0 && (
            <div key="attivita-memories" className="pwa-settings-section">
              <div className="pwa-settings-card">
                <h2 className="pwa-settings-card-title">Ricordi recenti</h2>
                <div className="pwa-recap-memories">
                  {attivitaData.data.memories.slice(0, 6).map((memory) => (
                    <div key={memory.id} className="pwa-recap-memory-card">
                      <div className="pwa-recap-memory-thumb">
                        <img
                          src={getImageUrl(memory.thumb_big_path)}
                          alt=""
                          className="pwa-recap-memory-img"
                        />
                        <span className={`pwa-recap-memory-type pwa-recap-memory-type-${memory.type}`}>
                          {memory.type === "viaggio"
                            ? "Viaggio"
                            : memory.type === "evento"
                              ? "Evento"
                              : memory.type === "futuro"
                                ? "Futuro"
                                : "Semplice"}
                        </span>
                      </div>
                      <div className="pwa-recap-memory-info">
                        <span className="pwa-recap-memory-date">
                          {memory.start_date &&
                            new Date(memory.start_date).toLocaleDateString("it-IT", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                        </span>
                        <span className="pwa-recap-memory-by">di {memory.created_by_user_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Recap – Confronto */}
      {confrontoData?.data && confrontoData.data.users?.length > 0 && (
        <div key="recap-confronto" className="pwa-settings-section">
          <div className="pwa-settings-card">
            <h2 className="pwa-settings-card-title">Confronto attività</h2>
            <p className="pwa-recap-confronto-desc">Chi contribuisce di più alla vostra storia</p>
            <div className="pwa-recap-confronto-users">
              {confrontoData.data.users.map((u) => (
                <div key={u.id_utente} className="pwa-recap-confronto-user">
                  <div className="pwa-recap-confronto-user-header">
                    <span className="pwa-recap-confronto-avatar">
                      {u.nome_utente
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    <span className="pwa-recap-confronto-name">{u.nome_utente}</span>
                  </div>
                  <div className="pwa-recap-confronto-bars">
                    <div className="pwa-recap-bar-row">
                      <span className="pwa-recap-bar-label">Ricordi</span>
                      <div className="pwa-recap-bar-track">
                        <div
                          className="pwa-recap-bar-fill pwa-recap-bar-blue"
                          style={{
                            width: `${(u.tot_ricordi_creati / (confrontoData.data.totals.tot_ricordi || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="pwa-recap-bar-value">{u.tot_ricordi_creati}</span>
                    </div>
                    <div className="pwa-recap-bar-row">
                      <span className="pwa-recap-bar-label">Foto</span>
                      <div className="pwa-recap-bar-track">
                        <div
                          className="pwa-recap-bar-fill pwa-recap-bar-purple"
                          style={{
                            width: `${(u.tot_images_create / (confrontoData.data.totals.tot_images || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="pwa-recap-bar-value">{u.tot_images_create}</span>
                    </div>
                    <div className="pwa-recap-bar-row">
                      <span className="pwa-recap-bar-label">Idee</span>
                      <div className="pwa-recap-bar-track">
                        <div
                          className="pwa-recap-bar-fill pwa-recap-bar-amber"
                          style={{
                            width: `${(u.tot_idee_create / (confrontoData.data.totals.tot_idee || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="pwa-recap-bar-value">{u.tot_idee_create}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {confrontoData?.data && selectedUserId != null && (
        <div key="recap-personal" className="pwa-settings-section">
          <div className="pwa-settings-card">
            <h2 className="pwa-settings-card-title">Stats personali</h2>
            <div className="pwa-recap-tabs">
              {confrontoData.data.users.map((u) => (
                <button
                  key={u.id_utente}
                  type="button"
                  className={`pwa-recap-tab ${selectedUserId === u.id_utente ? "pwa-recap-tab-active" : ""}`}
                  onClick={() => setSelectedUserId(u.id_utente)}
                >
                  {u.nome_utente.split(" ")[0]}
                </button>
              ))}
            </div>
            {(() => {
              const selectedUser = confrontoData.data.users.find((x) => x.id_utente === selectedUserId);
              if (!selectedUser) return null;
              return (
                <div className="pwa-recap-personal-grid">
                  <div className="pwa-recap-personal-item">
                    <span className="pwa-recap-personal-value pwa-recap-personal-blue">{selectedUser.tot_ricordi_creati}</span>
                    <span className="pwa-recap-personal-label">Ricordi</span>
                  </div>
                  <div className="pwa-recap-personal-item">
                    <span className="pwa-recap-personal-value pwa-recap-personal-purple">{selectedUser.tot_images_create}</span>
                    <span className="pwa-recap-personal-label">Foto</span>
                  </div>
                  <div className="pwa-recap-personal-item">
                    <span className="pwa-recap-personal-value pwa-recap-personal-amber">{selectedUser.tot_idee_create}</span>
                    <span className="pwa-recap-personal-label">Idee</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Logout */}
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
    </section>
  );
}
