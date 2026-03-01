import PwaSkeleton from "./PwaSkeleton";

export default function DetailMemorySkeleton() {
  return (
    <section className="pwa-page pwa-page-detail-memory" aria-hidden="true">
      <header className="pwa-detail-memory-header">
        <PwaSkeleton style={{ width: 36, height: 36, borderRadius: 9999 }} />
        <div className="pwa-detail-memory-header-center">
          <PwaSkeleton style={{ width: 88, height: 22, borderRadius: 9999, margin: "0 auto 8px" }} />
          <PwaSkeleton style={{ width: 180, height: 24 }} />
        </div>
        <div className="pwa-detail-memory-actions">
          <PwaSkeleton style={{ width: 34, height: 34, borderRadius: 9999 }} />
          <PwaSkeleton style={{ width: 34, height: 34, borderRadius: 9999 }} />
        </div>
      </header>

      <div className="pwa-page-card" style={{ marginBottom: 16 }}>
        <PwaSkeleton style={{ width: "100%", aspectRatio: "3 / 4", borderRadius: 16, marginBottom: 14 }} />
        <PwaSkeleton style={{ width: "75%", height: 18, marginBottom: 8 }} />
        <PwaSkeleton style={{ width: "55%", height: 14 }} />
      </div>

      <div className="pwa-page-card" style={{ marginBottom: 16 }}>
        <PwaSkeleton style={{ width: 90, height: 20, marginBottom: 12 }} />
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <PwaSkeleton style={{ width: 18, height: 18, borderRadius: 9999 }} />
            <PwaSkeleton style={{ width: "70%", height: 14 }} />
          </div>
        ))}
      </div>

      <div className="pwa-page-card">
        <PwaSkeleton style={{ width: 90, height: 20, marginBottom: 12 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {Array.from({ length: 4 }, (_, index) => (
            <PwaSkeleton key={index} style={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 12 }} />
          ))}
        </div>
      </div>
    </section>
  );
}
