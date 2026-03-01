import PwaSkeleton from "./PwaSkeleton";

export default function HomeSkeleton() {
  return (
    <section className="pwa-page" aria-hidden="true">
      <header className="pwa-home-header">
        <div className="pwa-home-intro">
          <PwaSkeleton style={{ width: 112, height: 14, marginBottom: 8 }} />
          <PwaSkeleton style={{ width: 160, height: 28 }} />
        </div>
        <PwaSkeleton style={{ width: 44, height: 44, borderRadius: "9999px" }} />
      </header>

      <div className="pwa-home-section">
        <div style={{ display: "flex", gap: "12px", overflow: "hidden" }}>
          {[0, 1, 2].map((item) => (
            <div key={item} className="pwa-skeleton-card" style={{ minWidth: 220, flexShrink: 0 }}>
              <PwaSkeleton style={{ width: "100%", height: 220, borderRadius: 16, marginBottom: 12 }} />
              <PwaSkeleton style={{ width: "66%", height: 16, marginBottom: 8 }} />
              <PwaSkeleton style={{ width: "50%", height: 12 }} />
            </div>
          ))}
        </div>
      </div>

      <div className="pwa-home-section">
        <div className="pwa-section-title">
          <PwaSkeleton style={{ width: 128, height: 24 }} />
          <PwaSkeleton style={{ width: 64, height: 14 }} />
        </div>
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="pwa-idea-row">
            <PwaSkeleton style={{ width: 40, height: 40, borderRadius: "9999px" }} />
            <div className="pwa-idea-row-content">
              <PwaSkeleton style={{ width: 160, height: 16, marginBottom: 8 }} />
              <PwaSkeleton style={{ width: 200, height: 12 }} />
            </div>
            <PwaSkeleton style={{ width: 18, height: 18 }} />
          </div>
        ))}
      </div>

      <div className="pwa-home-section">
        <div className="pwa-section-title">
          <PwaSkeleton style={{ width: 144, height: 24 }} />
          <PwaSkeleton style={{ width: 72, height: 14 }} />
        </div>
        <div className="pwa-scroll-horizontal" style={{ gap: "12px" }}>
          {[0, 1, 2, 3].map((item) => (
            <div
              key={item}
              className="pwa-skeleton-card"
              style={{ minWidth: 176, height: 228, flexShrink: 0 }}
            >
              <PwaSkeleton style={{ width: "100%", height: 144, borderRadius: 14, marginBottom: 12 }} />
              <PwaSkeleton style={{ width: "66%", height: 16, marginBottom: 8 }} />
              <PwaSkeleton style={{ width: "50%", height: 12 }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
