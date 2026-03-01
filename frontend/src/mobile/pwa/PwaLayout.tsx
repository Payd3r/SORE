import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BottomBar from "../components/layout/BottomBar";
import "../styles/mobile-pwa.css";

const DETAIL_MEMORY_PATTERN = /^\/ricordo\/[^/]+$/;

export default function PwaLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);
  const isDetailMemory = DETAIL_MEMORY_PATTERN.test(location.pathname);
  const isMapPage = location.pathname === "/mappa";

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="pwa-layout">
      <main
        ref={mainRef}
        className={[
          "pwa-main",
          isDetailMemory ? "pwa-main-no-bar" : "",
          isMapPage ? "pwa-main-map" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Outlet />
      </main>
      {!isDetailMemory && <BottomBar />}
    </div>
  );
}
