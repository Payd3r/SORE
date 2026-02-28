# Pagina Galleria Mobile

## Route
`/galleria`

## Ruolo
Visualizzazione a griglia di tutte le immagini, con filtri per tipo e ricerca.

---

## Struttura Layout

```
┌─────────────────────────────────────┐
│ Header: Galleria + [Azioni]         │
├─────────────────────────────────────┤
│ SearchBar: "Cerca foto..."          │
│ Filtri: [Tutte] [Paesaggio] ...     │  ← pillole orizzontali
├─────────────────────────────────────┤
│                                     │
│ Grid 2 o 3 colonne                  │
│ [img] [img] [img]                   │
│ [img] [img] [img]                   │
│ [img] [img] [img]                   │
│ ...                                 │
│                                     │
│ (infinite scroll)                   │
├─────────────────────────────────────┤
│ Bottom Navigation Bar               │
└─────────────────────────────────────┘
```

---

## Componenti da Usare

### Header
- Pulsante indietro (se necessario) o titolo "Galleria"
- Azioni: filtro, ordine (opzionale)

### SearchBar
- Placeholder: "Cerca foto..."
- Icona lente, icona filtro

### Filtri (SegmentedControl orizzontale)
- Pillole: Tutte | Paesaggio | Coppia | Singolo | Cibo
- Scroll orizzontale se molte opzioni
- Pillola attiva: sfondo primario, testo bianco

### Grid Immagini
- 2 o 3 colonne, aspect ratio quadrato (1:1)
- Immagini lazy-loaded
- Tap → modale o pagina `ImageDetailMobile` con navigazione fullscreen
- Indicatore caricamento (skeleton) durante fetch

---

## Dati e API

- `getGalleryImages()` → lista immagini (o infinite scroll)
- Filtro per tipo (classificazione AI)
- Ricerca per luogo, data, ricordo associato

---

## Comportamenti

- Infinite scroll per caricare altre immagini
- Tap su immagine → dettaglio fullscreen
- Swipe tra immagini nel dettaglio
- Pull-to-refresh per aggiornare galleria

---

## Impostazioni di Stile

- Gap griglia: 4–8px
- Card immagine: border-radius 8px (opzionale)
- Sfondo: bianco o grigio chiaro
