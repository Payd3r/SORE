# SORE Mobile Redesign — Stato Implementazione

> Documento che traccia cosa è stato implementato. Refactor mobile completato (Fasi 0–4). Restano solo attività QA manuali su dispositivi reali.

---

## Completato

### Fase 0 — Setup Design System

#### 0.1 Variabili CSS e token

- **File**: `frontend/src/index.css`
- **Token aggiunti**:
  - Sfondi: `--bg-page`, `--bg-card`, `--bg-elevated`, `--bg-input`, `--bg-secondary`, `--bg-page-accent`
  - Testo: `--text-primary`, `--text-secondary`, `--text-tertiary`, `--text-inverse`
  - Bordi: `--border-default`, `--border-focus`
  - Primari/Accent: `--color-primary`, `--color-primary-hover`, `--color-primary-active`, `--color-accent-pink`, `--color-accent-blue`
  - Ombre: `--shadow-sm`, `--shadow-md`, `--shadow-lg`
  - Glassmorphism: `--glass-overlay`, `--glass-border`
  - Durate: `--duration-instant`, `--duration-fast`, `--duration-normal`, `--duration-slow`, `--duration-slower`
  - Easing: `--ease-out`, `--ease-in`, `--ease-in-out`, `--ease-bounce`, `--ease-spring`
- **Tema scuro**: override `.dark` per tutte le variabili
- **Accessibilità**: `@media (prefers-reduced-motion: reduce)`

#### 0.2 Estensione Tailwind

- **File**: `frontend/tailwind.config.js`
- **Aggiunto**: palette `sore` (primary, primary-hover, primary-active, accent, accent-blue)
- **Aggiunto**: radii `card`, `card-lg`, `input`, `input-lg`

---

### Fase 1 — Componenti Base UI

#### Layout (`frontend/src/mobile/components/layout/`)

| Componente | File | Descrizione |
|------------|------|-------------|
| **MobilePageWrapper** | `MobilePageWrapper.tsx` | Wrapper pagina con padding, safe-area e sfondo `--bg-page` / `--bg-page-accent` |
| **MobileHeader** | `MobileHeader.tsx` | Header con back button, titolo centrato, azioni destra; `variant="overlay"` per header su hero; helper `HeaderActions` |
| **FixedBottomBar** | `FixedBottomBar.tsx` | Bottom nav con 5 icone, primario arancione, badge accent-pink |

#### UI primitivi (`frontend/src/mobile/components/ui/`)

| Componente | File | Descrizione |
|------------|------|-------------|
| **SearchBar** | `SearchBar.tsx` | Input con icona lente, placeholder, icona filtro opzionale |
| **SegmentedControl** | `SegmentedControl.tsx` | Pills generiche (es. Ricordi \| Idee) con stato attivo primario |
| **Card** | `Card.tsx` | Varianti: `base`, `glassmorphism`, `content` |
| **Button** | `Button.tsx` | Varianti: `primary`, `secondary`, `icon` |

#### PWA refactor

| File | Modifiche |
|------|-----------|
| **DownBar.tsx** | Usa `FixedBottomBar` invece di `TabBar`; colori da variabili CSS |
| **PwaLayout.tsx** | Sfondo `--bg-page` invece di gradiente custom; pulsante notifiche con `--color-primary` e `--color-accent-pink` |

---

### Fase 2 — Pagine Principali (completata)

#### Componenti di dominio creati

| Componente | File | Descrizione |
|------------|------|-------------|
| **MemoryCard** | `MemoryCard.tsx` | Card glassmorphism con cover, titolo, tipo, luogo, cuore; tap → `/ricordo/:id` |
| **IdeaCard** | `IdeaCard.tsx` | Card content con titolo, tipo, stato (completata/da fare); checkbox e tap → DetailIdeaModal |

#### Pagine riscritte da zero

| Pagina | File | Modifiche |
|--------|------|-----------|
| **HomeMobile** | `pages/HomeMobile.tsx` | Nuovo file: MobilePageWrapper (accentBg), MobileHeader (logo SORE, notifiche badge), SearchBar, SegmentedControl Ricordi \| Idee, sezioni scroll orizzontale (Ricordi in evidenza, Pianifica la prossima), lista Idee con IdeaCard, pull-to-refresh, menu filtri |
| **GalleryMobile** | `pages/GalleryMobile.tsx` | Nuovo file: MobilePageWrapper, MobileHeader ("Galleria"), SearchBar ("Cerca foto..."), SegmentedControl filtri tipo (Tutte \| Paesaggio \| Coppia \| Singolo \| Cibo), griglia 3 colonne, infinite scroll, tap → ImageDetailMobile |
| **DetailMemoryMobile** | `pages/DetailMemoryMobile.tsx` | Nuovo file: MobileHeader variant="overlay" su hero, carousel con swipe e dots, content card con SegmentedControl Overview \| Galleria \| Info, CTA bar (Modifica, Elimina, Condividi), MemoryEditModal, DeleteModal |

#### Componenti legacy rimossi

- `CardRicordoMobile.tsx` — sostituito da MemoryCard
- `IdeaCardMobile.tsx` — sostituito da IdeaCard

---

### Fase 3 — Pagine Secondarie (completata)

#### UploadMobile

| File | Modifiche |
|------|-----------|
| **UploadMobile.tsx** | Ridisegnato: MobilePageWrapper (accentBg), MobileHeader ("Carica foto", Annulla), SegmentedControl Ricordo \| Immagini \| Idea, drop zone grande con icona e testo "Trascina le foto o tocca per selezionare", griglia anteprime 3 colonne con checkbox per deselezionare, contatore foto, CTA primaria "Carica foto" fissa in basso. Tab Ricordo: dettagli ricordo (titolo, tipo, data futura, posizione, canzone). Tab Idea: titolo, descrizione, categoria. Design system: token CSS, Button/Card/SegmentedControl. |

#### ProfileMobile

| File | Modifiche |
|------|-----------|
| **ProfileMobile.tsx** | Ridisegnato: MobilePageWrapper (accentBg), MobileHeader ("Profilo"), sezione utente con avatar (64px), nome, email, info partner. SegmentedControl Profilo \| Coppia \| Statistiche. Tab Profilo: lista impostazioni a righe (icona + label + toggle/freccia): Modifica profilo, Cambia password, Notifiche push (toggle), Tema scuro (toggle), Elimina account. Tab Coppia: profilo coppia, anniversario, partner. Tab Stats: card numeri (ricordi, foto, idee, luoghi), contributo utenti con pill per persona. Logout in basso. Design system: token CSS, Card, Button, SegmentedControl. |

#### NotificationsMobile

| File | Modifiche |
|------|-----------|
| **NotificationsMobile.tsx** | Ridisegnato: da BottomSheet a modale fullscreen. MobilePageWrapper + MobileHeader (indietro, "Notifiche"). SearchBar placeholder "Cerca notifiche...", SegmentedControl Tutte \| Lette \| Non lette. Card notifica con avatar, titolo, descrizione, timestamp; stato non letta con sfondo `--bg-page-accent`. Raggruppamento temporale: intestazioni "Oggi", "Ieri", "Questa settimana", "Precedenti". Pull-to-refresh attivo, azione "Segna tutte", ingressi animati con Framer Motion. Design system: SearchBar, SegmentedControl, Card variant="content". |

#### MappaMobile

| File | Modifiche |
|------|-----------|
| **MappaMobile.tsx** | Ridisegnato: header overlay (variant="overlay") con titolo "Mappa", pulsante layers/filtri. Mappa fullscreen sotto header (componente Map desktop). Controlli zoom e FAB "Centra su me" sovrapposti in basso con safe-area. Skeleton durante caricamento. Design system: MobileHeader overlay, token CSS. |

#### ImageDetailMobile

| File | Modifiche |
|------|-----------|
| **ImageDetailMobile.tsx** | Ridisegnato: header overlay con back, data centrata, Share, More. Tap su immagine per mostrare/nascondere chrome. Indicatore posizione "X/Y" se in galleria. Info bar inferiore: data, "Immagine associata alla galleria", pulsante Elimina. Carousel miniature con stato attivo evidenziato (bordo `--color-primary`). Navigazione prev/next con frecce. Mantenute gesture: pinch-zoom, swipe-to-close, doppio tap zoom. Design system: token per overlay (`--text-inverse`, `--color-primary`). |

### Fase 4 — Rifiniture (completata)

#### 4.1 UX e layout

- **HomeMobile**: pulsante campanella in header ora apre il modale notifiche (`sore:open-notifications`) invece di navigare al profilo
- **DetailMemoryMobile**: aggiunto badge tipo ricordo sull'hero (overlay)
- **GalleryMobile**: supporto griglia adattiva 2/3 colonne tramite pinch (`usePinchGrid`)
- **MobilePageWrapper**: padding orizzontale portato a 32px + safe-area (`max(2rem, env(...))`)

#### 4.2 Gesture e robustezza hook

- **useBottomSheetDrag**: fix stale state in `onTouchEnd` con `translateYRef`
- **useTap**: guard su touch events + supporto `onClick`
- **useLongPress**: aggiunto supporto mouse (`onMouseDown`, `onMouseMove`, `onMouseUp`, `onMouseLeave`)
- **usePullToRefresh**: supporto `prefers-reduced-motion` + ref interni per evitare race su stato gesture
- **usePinchGrid**: migliorata gestione gesture con `preventDefault` su pinch rilevante

#### 4.3 Pull-to-refresh e animazioni

- **GalleryMobile**: pull-to-refresh integrato (refetch + reset paginazione)
- **NotificationsMobile**: pull-to-refresh integrato con indicatore visivo
- **NotificationsMobile**: apertura modale con fade/scale e stagger sugli item lista

#### 4.4 Cleanup componenti legacy

- Rimossi componenti non usati:
  - `InfoRicordoMobile.tsx`
  - `GalleriaRicordoMobile.tsx`
  - `CronologiaRicordoMobile.tsx`

#### 4.5 Attività post-implementazione (manuali)

- QA cross-device iOS/Android (gesture reali + safe-area su dispositivi fisici)
- Review finale coerenza motion su tutte le pagine mobile (verifica su dispositivo)

---

## Stato finale refactor mobile

**Il piano di refactor mobile è concluso.** Tutte le priorità implementabili (1–4) sono state completate:

| Priorità | Contenuto | Stato |
|----------|-----------|-------|
| 1 | Fix icona notifiche header, pull-to-refresh Gallery/Notifications | ✓ |
| 2 | Badge DetailMemory hero, safe-area/padding MobilePageWrapper | ✓ |
| 3 | Review e correzione gesture (useBottomSheetDrag, useTap, useLongPress, usePullToRefresh, usePinchGrid) | ✓ |
| 4 | Cleanup legacy (InfoRicordo, GalleriaRicordo, CronologiaRicordo), animazioni modali | ✓ |
| 5 | QA dispositivi reali, IMPLEMENTATION-STATUS | QA manuale; docs aggiornato ✓ |

---

## Struttura attuale componenti mobile

```
frontend/src/mobile/
├── components/
│   ├── layout/
│   │   ├── MobilePageWrapper.tsx   ✓
│   │   ├── MobileHeader.tsx       ✓ (con variant="overlay")
│   │   ├── FixedBottomBar.tsx     ✓
│   │   └── index.ts
│   ├── ui/
│   │   ├── SearchBar.tsx          ✓
│   │   ├── SegmentedControl.tsx   ✓
│   │   ├── Card.tsx               ✓
│   │   ├── Button.tsx             ✓
│   │   └── index.ts
│   ├── MemoryCard.tsx             ✓ (nuovo, Fase 2)
│   ├── IdeaCard.tsx               ✓ (nuovo, Fase 2)
│   ├── NotificationsMobile.tsx    ✓ (ridisegnato Fase 3, fullscreen)
│   └── ...
├── pwa/
│   ├── PwaLayout.tsx              ✓ (refactor)
│   └── DownBar.tsx                ✓ (refactor)
├── pages/
│   ├── HomeMobile.tsx             ✓ (riscritto Fase 2)
│   ├── GalleryMobile.tsx          ✓ (riscritto Fase 2)
│   ├── DetailMemoryMobile.tsx     ✓ (riscritto Fase 2)
│   ├── UploadMobile.tsx           ✓ (ridisegnato Fase 3)
│   ├── MappaMobile.tsx            ✓ (ridisegnato Fase 3)
│   ├── ProfileMobile.tsx          ✓ (ridisegnato Fase 3)
│   ├── ImageDetailMobile.tsx      ✓ (ridisegnato Fase 3)
│   └── ...
├── gestures/                      ✓ (hook aggiornati Fase 4)
└── hooks/
```
