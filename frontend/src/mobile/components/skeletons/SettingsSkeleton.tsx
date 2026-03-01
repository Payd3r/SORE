import PwaSkeleton from "./PwaSkeleton";

export default function SettingsSkeleton() {
  return (
    <section className="pwa-page" aria-hidden="true">
      <header className="pwa-page-header">
        <PwaSkeleton style={{ width: 150, height: 30, marginBottom: 8 }} />
        <PwaSkeleton style={{ width: "82%", height: 14 }} />
      </header>

      <div className="pwa-settings-section">
        <div className="pwa-settings-card">
          <PwaSkeleton style={{ width: 90, height: 20, marginBottom: 12 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PwaSkeleton style={{ width: 56, height: 56, borderRadius: 9999 }} />
            <div style={{ flex: 1 }}>
              <PwaSkeleton style={{ width: "48%", height: 15, marginBottom: 8 }} />
              <PwaSkeleton style={{ width: "64%", height: 12 }} />
            </div>
          </div>
        </div>
      </div>

      <div className="pwa-settings-section">
        <div className="pwa-settings-card">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 0",
                borderBottom: index === 4 ? "none" : "1px solid var(--pwa-divider)",
              }}
            >
              <PwaSkeleton style={{ width: 24, height: 24, borderRadius: 9999 }} />
              <PwaSkeleton style={{ width: "56%", height: 14 }} />
              <PwaSkeleton style={{ width: 16, height: 16, marginLeft: "auto" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
