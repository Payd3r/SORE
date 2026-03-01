# Regole di design e componenti principali – PWA SORE

Documento di riferimento per il redesign della PWA mobile. Vedi anche **REDESIGN-PWA-PIANO-FASI.md**.

---

## 1. Principi generali

- **Solo PWA mobile:** le regole si applicano quando `useIsPwa()` è true; layout e componenti sono ottimizzati per touch e viewport mobile.
- **Design system unico:** colori, tipografia e spazi sono definiti tramite variabili CSS (`design-system-pwa.css`); i componenti non usano colori/token hardcoded.
- **Touch-first:** target minimi ~44px, niente hover-only; gesti (pull-to-refresh, swipe, drag bottom sheet) dove previsti.
- **Safe area:** rispettare `env(safe-area-inset-*)` per notch e barra di sistema.

---

## 2. Token di design (riferimento mockup Home/Galleria)

### 2.1 Colori – Tema chiaro

| Token | Uso | Valore riferimento (mockup) |
|-------|-----|------------------------------|
| Background pagina | Body, scroll | `#F9FAFB` |
| Background card | Card, bottom sheet | `#FFFFFF` |
| Testo primario | Titoli, label | `#111827` |
| Testo secondario | Sottotitoli, caption | `#6B7280` / `#9CA3AF` |
| Bordi | Card, input | `#E5E7EB` / `#F3F4F6` |
| Primary (CTA, link) | Bottoni principali, “Vedi tutto” | `#3B82F6` (blue) o coerente con brand |
| Bottom nav pill | Barra tab | `#111111` (pill), item attivo `#FFFFFF` su pill |
| Overlay | Bottom sheet, modal | `rgba(0,0,0,0.4)` + optional backdrop-blur |

Badge per tipo:
- **Ricordo:** Viaggio (es. viola), Evento (es. fucsia), Semplice (neutro), Futuro (es. blu).
- **Idea:** Ristoranti (blue-50/500), Sfide (purple), Viaggi (emerald), Semplici (neutro).

### 2.2 Tipografia

- **Font:** Inter (300, 400, 500, 600, 700). Caricamento: `index.html` con preconnect + link Google Fonts.
- **Scale:** titolo pagina 1.5–2rem; titolo sezione 1.25rem; body 0.875–1rem; caption 0.75rem; badge/uppercase 0.625rem.
- **Pesi:** bold per titoli e CTA; medium per sottotitoli; regular per body.

### 2.3 Spaziatura e radius

- **Padding pagina:** orizzontale 1.5rem (24px); verticale coerente tra sezioni (es. 2rem tra blocchi).
- **Radius:** card `1rem`–`1.5rem` (rounded-2xl); bottom sheet top `2.5rem` (rounded-t-[2.5rem]); pill/button `9999px` (rounded-full).
- **Safe area:** padding bottom per area sotto la tab bar: `max(env(safe-area-inset-bottom), 20px)`.

### 2.4 Icone

- **Set:** Material Symbols Outlined. Link in `index.html`:  
  `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap`
- Uso: `font-variation-settings` per peso e fill; dimensione tipica 24px per tab/azioni.

### 2.5 Animazioni e transizioni

- Durata: 200–300 ms per micro-interazioni; 300 ms per bottom sheet open/close.
- Curve: `ease-out` per enter; optional `ease-in-out` per toggle.
- Bottom sheet: slide-up; handle drag; chiusura su overlay tap o pulsante chiudi.

### 2.6 Variabili aggiuntive per componenti

Definite in `design-system-pwa.css` (`:root` e `.dark` dove indicato):

| Variabile | Uso | Tema scuro |
|-----------|-----|------------|
| `--card-overlay-gradient` | Overlay su card hero/trip (gradient 50%→100% nero) | come light |
| `--bottom-nav-bg` | Sfondo pill tab bar | come light |
| `--bottom-nav-item-active-bg` | Sfondo item attivo tab bar | come light |
| `--bottom-nav-shadow` | Ombra pill tab bar | come light |
| `--bottom-sheet-radius` | Radius bordo superiore bottom sheet (2.5rem) | come light |
| `--bottom-sheet-handle-bg` | Colore handle (barra di drag) | `.dark`: `#4B5563` |
| `--bottom-sheet-shadow` | Ombra pannello bottom sheet | come light |
| `--color-link` / `--color-link-hover` | CTA testuali (es. "Vedi tutto") | tonalità link dedicate |
| `--color-danger` / `--color-danger-hover` / `--color-danger-active` | Azioni distruttive (elimina) | tonalità danger dedicate |
| `--skeleton-bg` | Colore base shimmer/skeleton | più scuro in `.dark` |
| `--skeleton-card-bg` | Sfondo contenitori skeleton | più scuro in `.dark` |
| `--idea-badge-*` | Badge tipo idea (blue/purple/emerald/neutral) | varianti dedicate |
| `--monthly-highlight-*` | Gradient, badge, titolo e bottone blocco Monthly Highlight | varianti dedicate |

**Classe utility:** `.pwa-card-gradient-overlay` — applica `background: var(--card-overlay-gradient)`; da usare su overlay sopra immagini hero (FeaturedTripCard, dettaglio ricordo).

---

## 3. Layout e wrapper principali

Da usare in tutte le pagine PWA.

### 3.1 PwaLayout

- **Ruolo:** layout radice PWA; contiene `Outlet` per le route, barra inferiore (DownBar), eventuale stato upload e notifiche.
- **Struttura:**  
  `[ header / notifiche ]` + `[ Outlet (contenuto pagina) ]` + `[ DownBar ]` + `[ upload status ]`
- **Classe container:** `max-w-md mx-auto` per centrare su schermi grandi; `min-h-screen` / `min-height: 100dvh`; `pb-32` o equivalente per spazio sotto alla tab.

### 3.2 DownBar (tab bar)

- **Tab:** Home, Galleria, Upload (centrale, icona “send” ruotata), Mappa, Profilo.
- **Stile:** pill scura (`#111111`), item attivo bianco con label (es. “Home”); icona + testo per attivo, solo icona per inattivi (opzionale).
- **Posizione:** fixed bottom; safe area; prefetch al cambio tab se previsto.

### 3.3 MobilePageWrapper

- **Ruolo:** wrapper di contenuto per ogni pagina (padding, scroll, spazio per tab).
- **Props tipici:** `children`, eventuale `className`; padding orizzontale (es. `px-6`), `pb` per tab + safe area.
- **Scroll:** overflow-y auto; nascondere scrollbar in PWA (classe globale da `mobile-pwa.css`).

### 3.4 MobileHeader

- **Ruolo:** header pagina (back, titolo, azioni).
- **Stile:** sticky opzionale; background `white/50` o `bg-white`; backdrop-blur per trasparenza; altezza e padding coerenti.
- **Elementi:** pulsante indietro (icona), titolo (h1 o equivalente), slot per azioni (notifiche, chiudi, filtro).

### 3.5 BottomSheet (generico)

- **Ruolo:** pannello da basso per dettaglio idea, filtri galleria, azioni contestuali.
- **Struttura:** overlay scuro + pannello bianco `rounded-t-[2.5rem]`; handle (barra grigia centrata); titolo; contenuto scrollabile; eventuale barra azioni in basso.
- **Comportamento:** apertura/chiusura con transizione; chiusura su tap overlay o pulsante; drag per chiudere (opzionale).
- **Altezza:** max ~90vh; contenuto con `overflow-y-auto`.

### 3.6 FixedBottomBar

- **Ruolo:** barra azioni fissa in basso (es. “Salva”, “Vedi tutto”) quando serve; non sostituisce la tab bar.
- **Stile:** safe area; padding; bottoni allineati al design system.

---

## 4. Componenti UI condivisi

- **Button:** primario (filled), secondario (outline), pericolo (elimina con `--color-danger*`), icon; radius e padding coerenti; stato attivo (es. scale 0.98).
- **Card:** background da variabile `--bg-card`; border sottile; radius `rounded-2xl`; shadow opzionale.
- **SegmentedControl:** due (o più) segmenti (es. Ricordo / Idea); segmento attivo evidenziato (bg + colore testo).
- **SearchBar:** icona + input; border/radius coerente; placeholder e stato focus.
- **ToggleSwitch:** track e thumb; variabili `--toggle-track-on/off`, `--toggle-thumb`, `--toggle-thumb-shadow`; dimensioni target 51x31 con thumb 27.
- **Badge tipo ricordo/idea:** pill con colore per tipo (VIAGGIO, EVENTO, RISTORANTI, ecc.); testo piccolo uppercase.

---

## 5. Componenti per pagina (riferimento)

Solo elenco; implementazione nelle pagine in `frontend/src/mobile/pages/` e relativi componenti.

### Home
- HomeHeader, OurIdeas (+ IdeaCardNew), FeaturedTrips (FeaturedTripCard), LatestMemories (LatestMemoryCard), MonthlyHighlightCard, HomeUploadBar, NotificationsDropdown, ProfileDropdown, IdeaDetailBottomSheet.

### Galleria
- GalleryMemoryCard, CategoryFilters, FilterDropdown, bottom sheet filtri (tipo, date, numero foto, ordinamento).

### Dettaglio ricordo
- Hero image; content card con tab (Overview, Galleria, Info); Spotify tag; azioni (Condividi, Modifica, Elimina).

### Dettaglio idea (bottom sheet)
- IdeaDetailBottomSheet: tipo, titolo, note; azioni Completa, Modifica, Elimina.

### Upload
- AddMobileHeader, MemoryTypeSelector, IdeaTypeSelector, DateLocationRow, SpotifySoundtrackInput, MediaUploadButton.

### Profilo
- ProfileHeader, JourneyCards, TogetherForCard, SettingsMenuRow, toggle tema.

---

## 6. Pattern ricorrenti dai mockup

- **Card con gradient overlay:** immagine full; overlay `linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.8) 100%)`; testo e CTA in basso.
- **Liste orizzontali:** `flex overflow-x-auto no-scrollbar snap-x snap-mandatory`; card con `snap-center` e `flex-shrink-0`.
- **Sezione con “Vedi tutto”:** titolo a sinistra, link “Vedi tutto” a destra (colore primary); sotto, lista o griglia.
- **No scrollbar:** classe utility che nasconde scrollbar (webkit + standard) per contenitori scrollabili.

---

## 7. File da mantenere allineati

- `frontend/src/styles/design-system-pwa.css` – variabili :root e .dark.
- `frontend/src/styles/mobile-pwa.css` – regole body.pwa-mode, scrollbar, safe area, .pwa-root.
- `frontend/index.html` – font Inter, Material Symbols.
- Componenti in `frontend/src/mobile/components/ui/` e `layout/` – uso esclusivo dei token (var(--*) o classi che mappano ai token).

Questo documento va aggiornato quando si adottano nuove decisioni di design (es. cambio palette o font) in modo che resti l’unica fonte di verità per il redesign PWA.
