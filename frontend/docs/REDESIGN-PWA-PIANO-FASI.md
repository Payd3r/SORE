# Piano fasi – Redesign PWA SORE

Piano per il redesign dell’estetica della PWA mobile.

**Stato attuale:** Fasi 0–4 completate. Fase 5 (Integrazione e QA) da eseguire.

---

## Riferimenti

| Risorsa | Contenuto |
|--------|------------|
| **`frontend/docs/REGOLE-DESIGN-PWA.md`** | Regole di design, token (colori, tipografia, spazi), layout/wrapper e componenti principali |
| `frontend/docs/REDESIGN-PWA-PIANO-FASI.md` | Questo piano per fasi |
| `stitch_prompt_redesign_pwa.md/` (se presente) | Codice HTML e screenshot di riferimento per Home, Galleria, Dettaglio, Mappa |

---

## Fase 0: Pulizia opzionale (consigliata)

Per evitare che i file attuali ostacolino il redesign, si può partire da una base pulita.

### Cosa valutare di rimuovere/sostituire

- **Componenti mobile esistenti** in `frontend/src/mobile/` da rifare secondo i mockup (si possono tenere solo layout/wrapper e hook se ancora validi).
- **Stili** in `frontend/src/styles/` (design-system-pwa, mobile-pwa) da allineare al nuovo design (palette in REGOLE-DESIGN-PWA: Inter, Material Symbols, `#F9FAFB`, card bianche, bottom nav pill).
- **Pagine PWA** (`HomeMobile`, `GalleryMobile`, `UploadMobile`, `ProfileMobile`, `DetailMemoryMobile`, ecc.): o le si riscrive in blocco seguendo i reference, o si fa refactor incrementale (in quel caso la pulizia è minima).

### Opzione A – Pulizia “aggressiva” (partenza da zero sulla UI PWA)

Prima di iniziare le fasi 1–2:

1. **Backup** del branch corrente (tag o branch `pre-redesign`).
2. **Eliminare** (o spostare in `_legacy/`):
   - `frontend/src/mobile/components/home/*`
   - `frontend/src/mobile/components/gallery/*`
   - `frontend/src/mobile/components/upload/*`
   - `frontend/src/mobile/components/profile/*`
   - `frontend/src/mobile/pages/HomeMobile.tsx`, `GalleryMobile.tsx`, `UploadMobile.tsx`, `ProfileMobile.tsx`, `DetailMemoryMobile.tsx`, `ImageDetailMobile.tsx`, `MappaMobile.tsx`
   - Eventuali componenti UI mobile non più in linea con i mockup (Card, Button, BottomSheet, ecc. si possono tenere come base e adattare).
3. **Mantenere** (e adattare in seguito):
   - `PwaLayout.tsx`, `DownBar.tsx` (struttura e tab)
   - `MobilePageWrapper.tsx`, `MobileHeader.tsx`, `FixedBottomBar.tsx`
   - Hook: `useIsPwa`, `usePullToRefresh`, gesture, upload, React Query
   - Route in `App.tsx` e contesti (Auth, Upload)
4. **Aggiornare** `App.tsx`: le route PWA puntano a placeholder o alle nuove pagine man mano che si implementano (Fase 3).

Risultato: nessun componente vecchio “dà fastidio”; si costruisce solo su design system e wrapper definiti in Fase 1–2.

### Opzione B – Refactor incrementale (senza cancellare tutto)

- Si mantengono i file attuali.
- Si introducono design system e wrapper (Fase 1–2), poi si sostituiscono una pagina/componente alla volta con le nuove implementazioni, dismettendo i vecchi quando pronti.

Scelta consigliata se l’obiettivo è **allineamento totale ai mockup**: **Opzione A**, così layout e componenti non portano stili/comportamenti contrastanti.

---

## Fase 1: Design system e regole principali

**Obiettivo:** Definire un’unica fonte di verità per colori, tipografia, spazi, componenti base.

1. **Documento regole e token**  
   Usare **`frontend/docs/REGOLE-DESIGN-PWA.md`** (già creato) come riferimento per:
   - Palette (light/dark): background pagina, card, testi, primary, accent, badge per tipo ricordo/idea.
   - Tipografia: font (es. Inter), scale (titoli, body, caption), pesi.
   - Spaziatura e radius (es. 12/16/20/24 px, safe area).
   - Durate e curve per animazioni (es. 200–300 ms, ease-out).

2. **CSS variables**  
   Allineare **`frontend/src/styles/design-system-pwa.css`** ai token in REGOLE-DESIGN-PWA. Mantenere `:root` e `.dark`; aggiungere variabili per:
   - Card overlay gradient (es. `card-gradient-overlay`)
   - Bottom nav (pill, shadow)
   - Bottom sheet (radius top, handle)

3. **Font e icone**  
   - Font: Inter (o altro definito nel design system); preconnect + import in `index.html` o in CSS.  
   - Icone: Material Symbols Outlined (come nei reference); link in `index.html`.

4. **File da toccare in Fase 1**
   - `frontend/docs/REGOLE-DESIGN-PWA.md` (nuovo/aggiornato)
   - `frontend/src/styles/design-system-pwa.css`
   - `frontend/index.html` (font + Material Symbols)

**Output:** Design system documentato e variabili CSS coerenti con i mockup; nessuna pagina ancora rifatta.

---

## Fase 2: Layout e wrapper principali

**Obiettivo:** Avere layout PWA e wrapper di pagina stabili e riutilizzabili, senza dipendenze da componenti di pagina vecchi.

1. **PwaLayout**
   - Usa `Outlet` per le route; barra inferiore (DownBar); area per notifiche e stato upload.
   - Classi e variabili da `design-system-pwa.css` (es. `pwa-root`, safe area).
   - Riferimento struttura: mockup Home (header + contenuto + bottom nav).

2. **DownBar (tab bar)**
   - Tab: Home, Galleria, Upload (centrale), Mappa, Profilo.
   - Stile “pill” come nei reference (es. `bg-[#111111]` pill, item attivo bianco con label).
   - Prefetch dati al cambio tab (se previsto).

3. **MobilePageWrapper**
   - Padding orizzontale, scroll verticale, eventuale `pb` per la tab bar e safe area.
   - Utilizzo: ogni pagina PWA avvolta in questo wrapper.

4. **MobileHeader**
   - Back (opzionale), titolo, azioni (es. notifiche, chiudi).
   - Stile: possibilmente sticky, con backdrop blur come nei reference.

5. **BottomSheet (generico)**
   - Pannello da basso; handle per drag; overlay scuro; chiusura su tap overlay o pulsante.
   - Usato per: dettaglio idea, filtri galleria, azioni contestuali.

6. **FixedBottomBar**
   - Barra azioni fissa in basso (es. “Salva”, “Vedi tutto”). Safe area e spazio sopra la tab.

**File da toccare in Fase 2**
   - `frontend/src/mobile/pwa/PwaLayout.tsx`
   - `frontend/src/mobile/pwa/DownBar.tsx`
   - `frontend/src/mobile/components/layout/MobilePageWrapper.tsx`
   - `frontend/src/mobile/components/layout/MobileHeader.tsx`
   - `frontend/src/mobile/components/layout/FixedBottomBar.tsx`
   - `frontend/src/components/ui/BottomSheet.tsx` (condiviso)
   - `frontend/src/styles/mobile-pwa.css` (se servono classi globali per layout)

**Output:** Navigazione e contenitori pronti; pagine ancora placeholder o vecchie, ma già incapsulate nei wrapper.

---

## Fase 3: Pagine e componenti per pagina

Implementazione in ordine suggerito, seguendo REGOLE-DESIGN-PWA e i componenti per pagina ivi indicati.

| # | Pagina / area | Riferimento mockup | Componenti principali |
|---|----------------|--------------------|------------------------|
| 1 | **Home** | `home_page_sore_finale_1|2|3` | HomeHeader, Le nostre Idee (IdeaCardNew), FeaturedTrips, LatestMemories, MonthlyHighlightCard, HomeUploadBar, NotificationsDropdown, ProfileDropdown |
| 2 | **Galleria** | `galleria_con_divider_annuali_1|2` | GalleryMemoryCard, CategoryFilters, FilterDropdown, bottom sheet filtri |
| 3 | **Dettaglio ricordo** | `memory_detail_with_new_navigation_1|2|3` | Hero image, content card, tab Overview/Galleria/Info, Spotify tag, azioni (condividi, modifica, elimina) |
| 4 | **Dettaglio idea (bottom sheet)** | `dettaglio_ricordo_futuro_bottom_sheet` | IdeaDetailBottomSheet: tipo, titolo, note, azioni (Completa, Modifica, Elimina) |
| 5 | **Upload** | REGOLE-DESIGN-PWA | SegmentedControl Ricordo/Idea, MemoryTypeSelector, IdeaTypeSelector, DateLocationRow, SpotifySoundtrackInput, MediaUploadButton |
| 6 | **Profilo** | REGOLE-DESIGN-PWA | ProfileHeader, JourneyCards, TogetherForCard, SettingsMenuRow, toggle tema |
| 7 | **Mappa** | `mappa_ricordi_var_2` | Mappa + pin; integrazione con layout PWA |
| 8 | **Sottopagine profilo** | (esistenti) | CouplesConnectionMobile, PrivacySecurityMobile, ShareSpaceMobile, HelpCenterMobile – adattare a nuovo design system |

Per ogni pagina:
- Usare solo token e componenti del design system (Fase 1) e layout/wrapper (Fase 2).
- Layout e stili: REGOLE-DESIGN-PWA e design-system-pwa.css.

---

## Fase 4: UI condivisi e gesti

- **Button, Card, SegmentedControl, SearchBar, ToggleSwitch**: allineare a REGOLE-DESIGN-PWA e variabili CSS; uso coerente in tutte le pagine.
- **Skeletons**: per header profilo, liste, card (MobileSkeletons + variabili --skeleton-bg in design-system-pwa.css).
- **Gesti:** `usePullToRefresh`, `useBottomSheetDrag`, ecc. – verificare che funzionino con i nuovi layout e bottom sheet.

---

## Fase 5: Integrazione e QA

- Tema light/dark: variabili `.dark` già in design-system-pwa; verificare tutte le schermate.
- Prefetch e React Query: comportamento al cambio tab e dopo mutazioni.
- Upload in background: stato visibile in PwaLayout/DownBar.
- Safe area e touch target su dispositivi reali.
- Accessibilità (focus, label, contrasti).

---

## Riepilogo fasi

| Fase | Descrizione | Stato |
|------|-------------|--------|
| **0** | Pulizia opzionale (Opzione A o B) | Completata |
| **1** | Design system e regole (token, CSS, font, icone) | Completata |
| **2** | Layout e wrapper (PwaLayout, DownBar, MobilePageWrapper, MobileHeader, BottomSheet, FixedBottomBar) | Completata |
| **3** | Pagine e componenti (Home → Galleria → Dettaglio → Idea sheet → Upload → Profilo → Mappa → Sottopagine) | Completata |
| **4** | UI condivisi e gesti (Button, Card, SearchBar, ToggleSwitch, Skeletons, useBottomSheetDrag, usePullToRefresh) | Completata |
| **5** | Integrazione e QA (tema, prefetch, upload, safe area, a11y) | Da fare |

---

## Ordine consigliato di esecuzione

1. Decidere **Fase 0**: Opzione A (pulizia) o B (incrementale).  
2. Eseguire **Fase 1** (design system).  
3. Eseguire **Fase 2** (layout e wrapper).  
4. Eseguire **Fase 3** nell’ordine tabella (Home prima, poi Galleria, ecc.).  
5. **Fase 4** in parallelo o subito dopo ogni pagina.  
6. **Fase 5** a fine implementazione.

Se si sceglie **Opzione A (Fase 0)**, dopo la pulizia le route PWA possono temporaneamente mostrare placeholder (es. “Home – in costruzione”) fino al completamento di Fase 3.1.
