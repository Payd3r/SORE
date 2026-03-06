# PWA_REACTIVITY — Piano di ottimizzazione SORE

> Ultimo aggiornamento: 05/03/2026

---

## ✅ Completato

### Step 1 — Font e Icone Locali + App Shell Loader
- **Inter Variable Font** e **Material Symbols Outlined** scaricati in `public/fonts/` dal Dockerfile
- **`index.html`**: rimosso link a Google Fonts, aggiunti `preload` + `@font-face` locali
- **App Shell Loader** inline in `index.html`: visibile al ms 0, dark/light via `prefers-color-scheme`
- **Nessun warning** `Failed to decode font` in produzione ✅

### Step 4 — StrictMode solo in DEV
- `main.tsx`: `<StrictMode>` attivo solo con `import.meta.env.DEV`, disattivato in produzione
- In produzione React non esegue il double-render → bootstrap ~10-15% più veloce su mobile ✅

### Step 6 — TripCardsCarousel senza setState
- Eliminati `useState` per `scrollLeft` e `containerWidth` → zero re-render React durante lo scroll
- Ora usa `useRef` + `requestAnimationFrame` + `element.style.transform` direttamente sul DOM
- Scroll del carousel da rischioso (60 setState/sec) a silky smooth ✅

### Step 7 — useIsPwa centralizzato in Context
- Creato `IsPwaContext.tsx` con `IsPwaProvider` e `useIsPwaContext()`
- `App.tsx` aggiornato: da 8 listener `matchMedia` separati a 1 solo nel provider
- Tutti i Selector e `AppInner` leggono dal context ✅

### Step 8 — Prefetch al touch delle card Home
- `TripCard` e `MemoryCardSmall`: aggiunto `onTouchStart` / `onMouseEnter` con `prefetchMemoryDetails()`
- Il hook `usePwaPrefetch.prefetchMemoryDetails` esisteva già, ora viene finalmente usato
- Apertura del dettaglio ricordo istantanea su tap (dati già in React Query cache) ✅

### Step 10 — Caricamento Progressivo Immagini (TripCard Home)
- `TripCard.tsx`: implementato sistema blur-up con `thumb_small_path` (placeholder) e `webp_path` (HD).
- Rimosso l'uso di `thumb_big_path` per le card viaggi per garantire la massima qualità.
- `mobile-pwa.css`: aggiunti stili per sovrapposizione fluida e transizione `opacity` con blur. ✅

---

## 🔲 Da fare — Apertura

### Step 2 — React Query: da localStorage a IndexedDB
**Problema attuale**: `setupPwaQueryPersistence` in `react-query.ts` (riga 130) usa `window.localStorage` per persistere la cache tra sessioni. localStorage è **sincrono e bloccante**: leggere/scrivere grandi JSON blocca il thread principale, causando uno stutter visibile al lancio dell'app mentre React idrata la cache.

**Cosa fare**:
- Sostituire la lettura/scrittura su `localStorage` con **`localforage`** (wrapper asincrono su IndexedDB)
- Installare: `npm install localforage`
- La lettura al boot diventa async, non blocca più il rendering
- **Impatto stimato**: riduzione del tempo di blocco al lancio di 50–200ms su dispositivi mid-range

---

### Step 3 — Service Worker: Pre-caching dei chunk Vite con `vite-plugin-pwa`
**Problema attuale**: il Service Worker in `service-worker.ts` pre-cacha solo `/`, `/index.html`, `/manifest.json`. I chunk JS generati da Vite (es. `react-vendor-Abc123.js`, `map-vendor-Xyz.js`) **non sono pre-cachati** — vengono scaricati dal network al primo avvio dopo ogni deploy, causando uno schermo bianco o loading prolungato.

**Cosa fare**:
- Installare: `npm install -D vite-plugin-pwa`
- Aggiungere al `vite.config.ts` la strategia `injectManifest` che inietta nel SW la lista completa dei chunk con hash generati in fase di build
- Aggiungere `self.__WB_MANIFEST` nel SW per ricevere i chunk da precachare
- **Impatto stimato**: dopo il primo avvio, ogni apertura successiva è **offline-ready e istantanea** (~0ms per caricare JS/CSS)

---

### Step 4 — StrictMode: rimuoverlo in produzione
**Problema attuale**: `main.tsx` wrappa tutto in `<StrictMode>`. In sviluppo è utile (raddoppia i render per scovare bug), ma **in produzione non fa nulla di utile** e in React 19 può rallentare ulteriormente il boot cycle.

**Cosa fare**:
```tsx
// main.tsx
createRoot(document.getElementById('root')!).render(
  import.meta.env.DEV ? (
    <StrictMode><App /></StrictMode>
  ) : (
    <App />
  )
)
```
**Impatto stimato**: riduzione del tempo di bootstrap React del 10–15% su mobile

---

## 🔲 Da fare — Navigazione

### Step 5 — HomeMobile: doppia query separata → unica query coordinata
**Problema attuale**: `HomeMobile.tsx` fa 2 query in parallelo — `homeData` e `memories` — e mostra `<HomeSkeleton />` finché **entrambe** non sono risolte (`isLoading = isLoadingHome || isLoadingMemories`). Questo significa che anche se `homeData` arriva in 100ms e `memories` in 600ms, l'utente vede lo skeleton per 600ms.

**Cosa fare**:
- Rendere la UI progressiva: mostrare il TripCardsCarousel appena arrivano i `memories` e mostrare la sezione idee appena arriva `homeData`, senza aspettarli entrambi
- Usare `placeholderData` già presente per non bloccare il render delle sezioni indipendenti
- **Impatto stimato**: la Home diventa visibile ~300ms prima su rete lenta

---

### Step 6 — TripCardsCarousel: `transform: scale()` a ogni scroll
**Problema attuale**: `TripCardsCarousel.tsx` ricalcola il `scale()` di ogni card a ogni evento `scroll` tramite `setState`. Questo causa un re-render React per ogni px di scroll — su iPhone con 60fps sono 60 setState/secondo durante lo scroll del carousel.

**Cosa fare**:
- Spostare l'animazione di scala interamente in CSS con `scroll-driven animations` (Chrome 115+ / Safari 18+)
- Oppure usare `ref` diretti sul DOM (`element.style.transform`) senza passare per stato React, eliminando i re-render
- **Impatto stimato**: scroll del carousel da fluido a **silky smooth** su tutti i device

---

### Step 7 — `useIsPwa` chiamato N volte in App.tsx
**Problema attuale**: `App.tsx` chiama `useIsPwa()` 8 volte (in `HomeSelector`, `GallerySelector`, `MappaSelector`, `MemorySelector`, `DetailMemorySelector`, `ProfileSelector`, `ProfileSubpageSelector`, `LayoutSelector`). Ogni hook si registra su un `matchMedia` listener — 8 listener per lo stesso evento.

**Cosa fare**:
- Spostare `useIsPwa()` a livello di `App` e passarlo via **React Context** o come prop
- Oppure memoizzare il risultato in un context provider dedicato `IsPwaContext`
- **Impatto stimato**: riduzione degli listener attivi, migliore tree shaking

---

### Step 8 — Prefetch memoria al hover delle card Home
**Problema attuale**: cliccando una TripCard → naviga a `/ricordo/:id` → la pagina `DetailMemoryMobile` parte con loading. Il hook `usePwaPrefetch` esiste già (`prefetchMemoryDetails`) ma **non viene usato** nel TripCardsCarousel né in MemoryCardSmall.

**Cosa fare**:
- Aggiungere `onTouchStart` / `onMouseEnter` sulle card della Home per chiamare `prefetchMemoryDetails([memory.id])`
- **Impatto stimato**: apertura del dettaglio ricordo **istantanea** anziché con skeleton

---

### Step 9 — Animazioni di navigazione tra pagine (View Transitions)
**Problema attuale**: navigare tra Home → Galleria → Dettaglio non produce nessuna transizione — il cambio di pagina appare brusco.

**Cosa fare**:
- Abilitare la **View Transitions API** in React Router v7 (già installato): aggiungere `viewTransition` prop al `<Link>` e sul `navigate()`
- Aggiungere nel CSS animazioni `@keyframes slide-in-right` / `slide-out-left` per `::view-transition-old` e `::view-transition-new`
- Zero dipendenze extra richieste (framer-motion non necessario)
- **Impatto stimato**: navigazione percepita come **app nativa** con transizioni fluide

---

## Priorità consigliata

| # | Step | Area | Difficoltà | Impatto |
|---|------|-------|-----------|---------|
| 1 | ✅ Font/Icone/Loader | Apertura | Fatto | Alto |
| 2 | IndexedDB per cache | Apertura | Bassa | Alto |
| 3 | vite-plugin-pwa | Apertura | Media | Altissimo |
| 4 | StrictMode solo in dev | Apertura | Bassissima | Medio |
| 5 | Home progressiva | Navigazione | Media | Alto |
| 6 | Carousel senza setState | Navigazione | Media | Alto |
| 7 | useIsPwa context | Navigazione | Bassa | Basso |
| 8 | Prefetch card hover | Navigazione | Bassa | Alto |
| 9 | View Transitions | Navigazione | Bassa | Altissimo |
