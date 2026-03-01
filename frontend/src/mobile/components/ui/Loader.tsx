type MobileLoaderProps = {
  text?: string;
  subText?: string;
};

export default function MobileLoader({ text = "Caricamento in corso...", subText }: MobileLoaderProps) {
  return (
    <div className="pwa-page" role="status" aria-live="polite">
      <div className="pwa-page-card">
        <p className="pwa-page-title" style={{ fontSize: "1rem", marginBottom: "6px" }}>
          {text}
        </p>
        {subText ? <p>{subText}</p> : <p>Stiamo preparando l'app mobile.</p>}
      </div>
    </div>
  );
}
