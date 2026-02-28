# SORE Mobile PWA — Piano Master di Redesign

> Documento guida per il redesign completo dell'estetica mobile della PWA SORE.
> **Obiettivo**: cancellare tutto il frontend mobile esistente e ricreare componenti e pagine da zero con un design system unificato.

---

## 1. Strategia Generale

### 1.1 Approccio
- **Scope**: solo la parte mobile/PWA (`frontend/src/mobile/`)
- **Strategia**: rimozione completa dei componenti attuali e ricostruzione da zero
- **Design System**: combinare elementi estetici dalle immagini di riferimento in un sistema coerente
- **Priorità**: UX mobile-first, touch-friendly, safe-area, gesti nativi

### 1.2 Cartelle da Eliminare/Riscrivere
```
frontend/src/mobile/
├── pages/          → sostituire con nuove pagine
├── components/     → sostituire con nuovi componenti
├── pwa/            → PwaLayout e DownBar da ridisegnare
├── gestures/       → mantenere logica, eventuale refactor
└── hooks/          → mantenere logica esistente
```

### 1.3 Struttura Nuova Proposta
```
frontend/src/mobile/
├── pages/                    # Nuove pagine (vedi docs per singola pagina)
│   ├── HomeMobile.tsx
│   ├── GalleryMobile.tsx
│   ├── UploadMobile.tsx
│   ├── MappaMobile.tsx
│   ├── ProfileMobile.tsx
│   ├── DetailMemoryMobile.tsx
│   └── ImageDetailMobile.tsx
├── components/               # Nuovi componenti design system
│   ├── ui/                   # Design system primitivi
│   │   ├── Card.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SegmentedControl.tsx
│   │   ├── TabBar.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Button.tsx
│   │   └── ...
│   ├── layout/               # Layout mobile
│   │   ├── MobileHeader.tsx
│   │   ├── MobilePageWrapper.tsx
│   │   └── FixedBottomBar.tsx
│   ├── memory/               # Componenti specifici ricordi
│   ├── gallery/              # Componenti specifici galleria
│   └── notifications/        # Componenti notifiche
├── pwa/
│   ├── PwaLayout.tsx
│   └── DownBar.tsx
├── gestures/                 # (mantieni)
└── hooks/                    # (mantieni)
```

---

## 2. Design System Combinato (Sintesi)

> Per dettagli completi vedi `01-DESIGN-SYSTEM.md`

### Palette Colori
- **Primario**: arancione (#FF6B35 / ~#FF5722) per CTA, link, stati attivi
- **Accent alternativo**: rosa acceso (#E91E63 / hot pink) per elementi speciali
- **Sfondi**: bianco, grigio chiaro (#F5F5F5), azzurro pastello (#E0F2F7) per aree
- **Testo**: nero (#000), grigio scuro (#333), grigio (#666) per secondario

### Componenti Chiave (dalle immagini)
- **Card con glassmorphism**: overlay scuro/traslucido su immagine, testo bianco
- **SearchBar**: angoli arrotondati, icona lente, placeholder, icona filtro
- **SegmentedControl**: pillole con stato attivo evidenziato
- **Bottom Navigation**: 5 icone, stato attivo con colore accent e underline
- **Hero + Content Card**: immagine grande in alto, scheda bianca arrotondata sovrapposta
- **CTA Bar**: barra fissa in basso con prezzo/info + pulsante primario

---

## 3. Mappa delle Pagine

| Route      | Pagina           | File MD              | Note                         |
|-----------|-------------------|----------------------|------------------------------|
| `/`       | Home              | `pages/02-Home.md`   | Ricordi + Idee, sezioni      |
| `/galleria` | Galleria        | `pages/03-Gallery.md`| Griglia immagini, filtri     |
| `/upload` | Upload            | `pages/04-Upload.md` | Flow caricamento foto        |
| `/mappa`  | Mappa             | `pages/05-Map.md`    | Mappa interattiva            |
| `/profilo`| Profilo           | `pages/06-Profile.md`| Utente, coppia, impostazioni |
| `/ricordo/:id` | Dettaglio Ricordo | `pages/07-DetailMemory.md` | Hero, galleria, info |
| (modale)  | Dettaglio Immagine | `pages/08-ImageDetail.md` | Fullscreen immagine   |
| (modale)  | Notifiche         | `pages/09-Notifications.md` | Lista notifiche      |

---

## 4. Ordine di Implementazione Consigliato

1. **Fase 0 — Setup**
   - Creare variabili CSS e tema in `index.css`
   - Definire token design system (colori, radii, spacing)

2. **Fase 1 — Componenti Base**
   - `MobileHeader`, `SearchBar`, `SegmentedControl`
   - `Card` (varianti: base, glassmorphism, contenuto)
   - `BottomNavigation` (DownBar ridisegnato)
   - `PwaLayout` con nuovo layout

3. **Fase 2 — Pagine Principali**
   - HomeMobile
   - GalleryMobile
   - DetailMemoryMobile

4. **Fase 3 — Pagine Secondarie**
   - UploadMobile
   - MappaMobile
   - ProfileMobile
   - ImageDetailMobile
   - NotificationsMobile (modale)

5. **Fase 4 — Rifiniture**
   - Animazioni, transizioni
   - Gesture, pull-to-refresh
   - Accessibilità, safe-area
   - QA su dispositivi reali

---

## 5. Convenzioni di Codice

- **Componenti**: funzionali con TypeScript
- **Stile**: Tailwind CSS con classi custom dove serve
- **Icons**: react-icons/io5 o set coerente
- **Animazioni**: Framer Motion (già in uso)
- **Stato**: React Query per dati, useState/useReducer per UI
- **Routing**: React Router v6 (invariato)

---

## 6. File da Consultare

| File | Contenuto |
|------|-----------|
| `01-DESIGN-SYSTEM.md` | Design system completo, token, componenti |
| `pages/02-Home.md` | Struttura e contenuto pagina Home |
| `pages/03-Gallery.md` | Struttura pagina Galleria |
| `pages/04-Upload.md` | Struttura pagina Upload |
| `pages/05-Map.md` | Struttura pagina Mappa |
| `pages/06-Profile.md` | Struttura pagina Profilo |
| `pages/07-DetailMemory.md` | Struttura pagina Dettaglio Ricordo |
| `pages/08-ImageDetail.md` | Struttura pagina Dettaglio Immagine |
| `pages/09-Notifications.md` | Struttura modale Notifiche |

---

## 7. Note su Compatibilità

- **iOS**: safe-area-inset, -webkit, Dynamic Island
- **Android**: gesture navigation, barra di sistema
- **PWA**: `display-mode: standalone`, `env(safe-area-inset-*)`
- **Offline**: comportamento invariato (Service Worker)
