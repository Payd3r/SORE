import PwaSkeleton from "./PwaSkeleton";

export default function IdeasSkeleton() {
  return (
    <section className="pwa-page" aria-hidden="true">
      <header className="pwa-home-header">
        <div className="pwa-home-intro">
          <PwaSkeleton style={{ width: 84, height: 30 }} />
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
          <PwaSkeleton key={item} style={{ width: 92, height: 34, borderRadius: 9999 }} />
        ))}
      </div>

      <div className="pwa-home-section" style={{ marginTop: 10 }}>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="pwa-idea-row">
            <PwaSkeleton style={{ width: 40, height: 40, borderRadius: "9999px" }} />
            <div className="pwa-idea-row-content">
              <PwaSkeleton style={{ width: "65%", height: 16, marginBottom: 8 }} />
              <PwaSkeleton style={{ width: "90%", height: 12 }} />
            </div>
            <PwaSkeleton style={{ width: 16, height: 16 }} />
          </div>
        ))}
      </div>
    </section>
  );
}
