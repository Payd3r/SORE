# SORE Mobile PWA — Documentazione Redesign

> Riferimento rapido per il redesign completo della parte mobile della PWA SORE.

---

## File disponibili

| File | Contenuto |
|------|-----------|
| **[00-MASTER-PLAN.md](./00-MASTER-PLAN.md)** | Piano master, strategia, ordine di implementazione |
| **[IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)** | Stato implementazione (Fase 0 e 1 completate) |
| **[01-DESIGN-SYSTEM.md](./01-DESIGN-SYSTEM.md)** | Design system: colori, tipografia, componenti, token |
| **[pages/02-Home.md](./pages/02-Home.md)** | Home: ricordi, idee, search, filtri |
| **[pages/03-Gallery.md](./pages/03-Gallery.md)** | Galleria: griglia immagini, filtri |
| **[pages/04-Upload.md](./pages/04-Upload.md)** | Upload: selezione, anteprima, CTA |
| **[pages/05-Map.md](./pages/05-Map.md)** | Mappa: Leaflet, marker, popup |
| **[pages/06-Profile.md](./pages/06-Profile.md)** | Profilo: utente, coppia, impostazioni |
| **[pages/07-DetailMemory.md](./pages/07-DetailMemory.md)** | Dettaglio Ricordo: hero, galleria, tab |
| **[pages/08-ImageDetail.md](./pages/08-ImageDetail.md)** | Dettaglio Immagine: fullscreen, swipe |
| **[pages/09-Notifications.md](./pages/09-Notifications.md)** | Notifiche: modale, filtri, card lista |

---

## Info principali (cumulativo)

### Obiettivo
Cancellare tutto il frontend mobile esistente (`frontend/src/mobile/`) e ricreare componenti e pagine da zero con un design system unificato.

### Design system sintesi
- **Primario**: arancione (#FF6B35) per CTA e stati attivi
- **Accent**: rosa (#E91E63), blu (#0A84FF)
- **UI**: glassmorphism, card arrotondate (16–20px), SearchBar, SegmentedControl, BottomNav
- **Tipografia**: sans-serif system, H1 24px bold, body 15px

### Pagine da implementare
1. Home (`/`) — Ricordi + Idee, search, filtri
2. Galleria (`/galleria`) — Griglia immagini
3. Upload (`/upload`) — Caricamento foto
4. Mappa (`/mappa`) — Mappa interattiva
5. Profilo (`/profilo`) — Utente, coppia, impostazioni
6. Dettaglio Ricordo (`/ricordo/:id`) — Hero, galleria, tab
7. Dettaglio Immagine (modale/route) — Fullscreen
8. Notifiche (modale) — Lista con filtri

### Componenti base (Fase 0–1 completata)
- Token CSS in `index.css`, palette `sore` in `tailwind.config.js`
- `MobileHeader`, `SearchBar`, `SegmentedControl`, `Card`, `Button`, `FixedBottomBar`
- `PwaLayout`, `DownBar` ridisegnati — vedi [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)

### Ordine implementazione
1. Setup token CSS, variabili
2. Componenti base UI
3. PwaLayout + DownBar
4. Pagine: Home → Galleria → DetailMemory → Upload → Mappa → Profile
5. Modali: ImageDetail, Notifications
6. Rifiniture: animazioni, gesture, safe-area
