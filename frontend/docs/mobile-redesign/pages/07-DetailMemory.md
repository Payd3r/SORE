# Pagina Dettaglio Ricordo Mobile

## Route
`/ricordo/:id`

## Ruolo
Dettaglio completo di un ricordo: hero image, galleria, info, cronologia, musica Spotify, azioni (edit, delete, share).

---

## Struttura Layout (stile Pattaya/Product detail)

```
┌─────────────────────────────────────┐
│ Header: [←] Titolo [Share] [Heart]  │  ← sovrapposto all'immagine
├─────────────────────────────────────┤
│                                     │
│ Hero Image / Carousel               │
│ (immagine principale o swipe)       │
│                                     │
├─────────────────────────────────────┤
│ Content Card (bianca, arrotondata)  │
│ ┌─────────────────────────────────┐ │
│ │ Titolo ricordo                  │ │
│ │ Luogo, data                     │ │
│ │ ★ 4.8 (7K reviews) — opzionale  │ │
│ │                                 │ │
│ │ Descrizione... [Leggi tutto]    │ │
│ │                                 │ │
│ │ Tab: Overview | Galleria | Info │ │
│ │                                 │ │
│ │ (contenuto tab)                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ CTA Bar fissa (opzionale)           │
│ [Modifica] [Elimina] o [Condividi]  │
└─────────────────────────────────────┘
```

---

## Componenti da Usare

### Header (sovrapposto all'hero)
- Pulsante indietro (circolare, sfondo bianco semi-trasparente)
- Titolo ricordo centrato (bianco se su immagine scura)
- Icona Condividi, Icona Preferiti (cuore)
- Sfondo blur o trasparente

### Hero Image
- Immagine a schermo intero (o carousel se multiple)
- Swipe per cambiare immagine
- Indicatore pagina (dots) se carousel
- Badge tipo ricordo (Viaggio, Evento, ecc.) angolo superiore sinistro

### Content Card
- Scheda bianca con bordi superiori arrotondati (16–20px)
- Sovrappone leggermente l'immagine
- Nome ricordo (H1)
- Luogo + data sotto
- Rating (se applicabile) — opzionale
- Descrizione con "Leggi tutto" per espandere

### Tab Navigation
- Overview | Galleria | Info
- Sottolineatura arancione sotto tab attiva
- Contenuto:
  - **Overview**: descrizione, date, luogo, musica
  - **Galleria**: griglia immagini del ricordo
  - **Info**: cronologia, creato da, data creazione

### CTA Bar (opzionale, fissa in basso)
- Pulsante Modifica (secondario)
- Pulsante Elimina (rosso/secondario)
- Oppure Condividi (primario)

---

## Dati e API

- `getMemory(id)`, `getMemoryCarousel(id)`
- `getTrackDetails()` per Spotify
- `updateMemory()`, `deleteMemory()`
- `format()` date-fns per date

---

## Comportamenti

- Swipe tra immagini nel hero
- Tap "Leggi tutto" → espande descrizione
- Tab switch → cambio contenuto
- Modifica → `MemoryEditModal`
- Elimina → `DeleteModal` + conferma + navigate indietro
- Indietro → rimuove `detail-memory-active`, torna a Home/Galleria
- Nascondere BottomNav durante visualizzazione (già gestito con `detail-memory-active`)

---

## Impostazioni di Stile

- Hero: aspect ratio 4:3 o 16:9, object-fit cover
- Content card: margin-top negativo (~-20px), padding 20px
- Tab: font 14px, padding 12px
- CTA bar: sfondo bianco, ombra superiore, safe-area-bottom
