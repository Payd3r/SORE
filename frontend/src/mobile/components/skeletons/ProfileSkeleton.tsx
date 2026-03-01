import PwaSkeleton from "./PwaSkeleton";

export default function ProfileSkeleton() {
  return (
    <section className="pwa-page" aria-hidden="true">
      <header className="pwa-home-header">
        <div className="pwa-home-intro">
          <PwaSkeleton style={{ width: 98, height: 30 }} />
        </div>
        <PwaSkeleton style={{ width: 44, height: 44, borderRadius: "9999px" }} />
      </header>

      <div className="pwa-settings-section">
        <div className="pwa-settings-card">
          <PwaSkeleton style={{ width: 180, height: 24, marginBottom: 8 }} />
          <PwaSkeleton style={{ width: 140, height: 14, marginBottom: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="pwa-skeleton-card" style={{ padding: 10 }}>
                <PwaSkeleton style={{ width: "75%", height: 20, marginBottom: 8 }} />
                <PwaSkeleton style={{ width: "60%", height: 12 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pwa-settings-section">
        <div className="pwa-settings-card">
          <PwaSkeleton style={{ width: 90, height: 20, marginBottom: 12 }} />
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <PwaSkeleton style={{ width: 40, height: 40, borderRadius: "9999px" }} />
              <div style={{ flex: 1 }}>
                <PwaSkeleton style={{ width: "60%", height: 14, marginBottom: 8 }} />
                <PwaSkeleton style={{ width: "78%", height: 12 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pwa-settings-section">
        <div className="pwa-settings-card">
          <PwaSkeleton style={{ width: 170, height: 20, marginBottom: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 14 }}>
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="pwa-skeleton-card" style={{ padding: 10 }}>
                <PwaSkeleton style={{ width: "45%", height: 18, marginBottom: 8 }} />
                <PwaSkeleton style={{ width: "70%", height: 12 }} />
              </div>
            ))}
          </div>
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} style={{ marginBottom: 10 }}>
              <PwaSkeleton style={{ width: "28%", height: 12, marginBottom: 6 }} />
              <PwaSkeleton style={{ width: "100%", height: 8, borderRadius: 9999 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
