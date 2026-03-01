import PwaSkeleton from "./PwaSkeleton";

export default function GallerySkeleton() {
  return (
    <section className="pwa-page" aria-hidden="true">
      <header className="pwa-home-header">
        <div className="pwa-home-intro">
          <PwaSkeleton style={{ width: 132, height: 30 }} />
        </div>
        <PwaSkeleton style={{ width: 44, height: 44, borderRadius: "9999px" }} />
      </header>

      <div className="pwa-gallery-toolbar">
        <div className="pwa-gallery-search-wrap">
          <PwaSkeleton style={{ width: "100%", height: 46, borderRadius: 14 }} />
        </div>
        <PwaSkeleton style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0 }} />
      </div>

      <div className="pwa-gallery-categories at-start at-end" style={{ gap: 8 }}>
        {[0, 1, 2, 3, 4].map((item) => (
          <PwaSkeleton key={item} style={{ width: 82, height: 34, borderRadius: 9999 }} />
        ))}
      </div>

      {[2025, 2024].map((year) => (
        <div key={year} className="pwa-gallery-year-section">
          <div style={{ marginBottom: 10 }}>
            <PwaSkeleton style={{ width: 90, height: 22 }} />
          </div>
          <div className="pwa-gallery-grid">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="pwa-skeleton-card" style={{ padding: 10 }}>
                <PwaSkeleton style={{ width: "100%", aspectRatio: "3 / 4", borderRadius: 12, marginBottom: 8 }} />
                <PwaSkeleton style={{ width: "80%", height: 14, marginBottom: 6 }} />
                <PwaSkeleton style={{ width: "55%", height: 12 }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
