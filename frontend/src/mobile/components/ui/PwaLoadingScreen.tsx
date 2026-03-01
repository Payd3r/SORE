import { useEffect, useState } from "react";

type PwaLoadingScreenProps = {
  text?: string;
  subText?: string;
};

/**
 * Pagina di caricamento dedicata alla PWA: usa il design system PWA
 * e rispetta il tema attivo (chiaro/scuro da sistema o preferenza utente).
 */
export default function PwaLoadingScreen({
  text = "Caricamento...",
  subText = "Stiamo preparando la tua esperienza.",
}: PwaLoadingScreenProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      const hasDarkClass = document.documentElement.classList.contains("dark");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(hasDarkClass || prefersDark);
    };

    applyTheme();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", applyTheme);
    const observer = new MutationObserver(applyTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => {
      media.removeEventListener("change", applyTheme);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="pwa-loading-screen"
      data-theme={isDark ? "dark" : "light"}
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      <div className="pwa-loading-screen-inner">
        <div className="pwa-loading-screen-logo" aria-hidden>
          SORE
        </div>
        <div className="pwa-loading-screen-spinner" aria-hidden />
        <p className="pwa-loading-screen-text">{text}</p>
        {subText ? (
          <p className="pwa-loading-screen-subtext">{subText}</p>
        ) : null}
      </div>
    </div>
  );
}
