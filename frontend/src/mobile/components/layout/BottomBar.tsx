import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usePwaPrefetch } from "../../hooks";

type BottomBarItem = {
  key: string;
  label: string;
  icon: string;
  to: string;
  matchPrefix?: boolean;
};

const items: BottomBarItem[] = [
  { key: "home", label: "Home", icon: "home", to: "/", matchPrefix: false },
  { key: "galleria", label: "Galleria", icon: "photo_library", to: "/galleria", matchPrefix: true },
  { key: "idee", label: "Idee", icon: "lightbulb", to: "/idee", matchPrefix: true },
  { key: "mappa", label: "Mappa", icon: "map", to: "/mappa", matchPrefix: true },
];

function isItemActive(pathname: string, item: BottomBarItem) {
  if (!item.matchPrefix) {
    return pathname === item.to;
  }

  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}

const addLabel = "Aggiungi";
const IDLE_PREFETCH_DELAY = 2000;
const CHUNK_PREFETCH_DEBOUNCE = 300;

const routeImporters = {
  "/": () => import("../../pages/HomeMobile"),
  "/galleria": () => import("../../pages/GalleryMobile"),
  "/idee": () => import("../../pages/IdeasMobile"),
  "/mappa": () => import("../../pages/MappaMobile"),
  "/profilo": () => import("../../pages/ProfileMobile"),
} as const;

type PrefetchRoute = keyof typeof routeImporters;

export default function BottomBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const preloadedChunksRef = useRef<Set<PrefetchRoute>>(new Set());
  const chunkTimeoutsRef = useRef<Map<PrefetchRoute, number>>(new Map());
  const {
    prefetchRoute,
    scheduleRoutePrefetch,
    cancelRoutePrefetch,
  } = usePwaPrefetch();
  const isAddActive =
    location.pathname === "/add" || location.pathname.startsWith("/add/");

  const prefetchRouteChunk = (route: PrefetchRoute) => {
    if (preloadedChunksRef.current.has(route)) {
      return;
    }
    const existingTimeout = chunkTimeoutsRef.current.get(route);
    if (existingTimeout != null) {
      window.clearTimeout(existingTimeout);
    }

    const timeoutId = window.setTimeout(() => {
      void routeImporters[route]();
      preloadedChunksRef.current.add(route);
      chunkTimeoutsRef.current.delete(route);
    }, CHUNK_PREFETCH_DEBOUNCE);
    chunkTimeoutsRef.current.set(route, timeoutId);
  };

  useEffect(() => {
    const idleTimer = window.setTimeout(() => {
      void prefetchRoute("/mappa");
      void prefetchRoute("/profilo");
    }, IDLE_PREFETCH_DELAY);
    return () => window.clearTimeout(idleTimer);
  }, [prefetchRoute]);

  useEffect(() => {
    const root = navRef.current;
    if (!root || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const route = entry.target.getAttribute("data-prefetch-route") as PrefetchRoute | null;
          if (!route || !(route in routeImporters)) return;
          prefetchRouteChunk(route);
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    root.querySelectorAll<HTMLElement>("[data-prefetch-route]").forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      chunkTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      chunkTimeoutsRef.current.clear();
    };
  }, []);

  return (
    <nav ref={navRef} className="pwa-bottom-shell" aria-label="Navigazione mobile">
      <div className="pwa-bottom-row">
        <div className="pwa-bottom-bar">
          <ul className="pwa-bottom-list">
            {items.map((item) => {
              const active = isItemActive(location.pathname, item);

              return (
                <li
                  key={item.key}
                  className={`pwa-bottom-item ${active ? "pwa-bottom-item-active" : ""}`}
                >
                  <button
                    type="button"
                    className={`pwa-nav-button ${active ? "pwa-nav-button-active" : ""}`}
                    style={active ? { paddingLeft: 28, paddingRight: 28 } : undefined}
                    onClick={() => navigate(item.to, { viewTransition: true })}
                    onMouseEnter={() => scheduleRoutePrefetch(item.to as PrefetchRoute)}
                    onTouchStart={() => scheduleRoutePrefetch(item.to as PrefetchRoute)}
                    onMouseLeave={() => cancelRoutePrefetch(item.to as PrefetchRoute)}
                    onTouchEnd={() => cancelRoutePrefetch(item.to as PrefetchRoute)}
                    aria-current={active ? "page" : undefined}
                    aria-label={active ? undefined : item.label}
                    data-prefetch-route={item.to}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      {item.icon}
                    </span>
                    {active && <span className="pwa-nav-label">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
        <button
          type="button"
          className={`pwa-fab ${isAddActive ? "pwa-fab-active" : ""}`}
          style={isAddActive ? { paddingLeft: 28, paddingRight: 28 } : undefined}
          onClick={() => navigate("/add", { viewTransition: true })}
          aria-current={isAddActive ? "page" : undefined}
          aria-label={isAddActive ? undefined : "Aggiungi ricordo o idea"}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            add
          </span>
          {isAddActive && <span className="pwa-nav-label">{addLabel}</span>}
        </button>
      </div>
    </nav>
  );
}
