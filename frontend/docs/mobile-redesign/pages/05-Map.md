# Pagina Mappa Mobile

## Route
`/mappa`

## Ruolo
Visualizzazione dei ricordi su mappa interattiva (Leaflet/OpenStreetMap). Zoom, pan, marker cliccabili.

---

## Struttura Layout

```
┌─────────────────────────────────────┐
│ Header: Mappa + [Filtri/Layers]     │
├─────────────────────────────────────┤
│                                     │
│                                     │
│         Mappa fullscreen            │
│         (Leaflet)                  │
│         Marker sui luoghi           │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ Controlli zoom (+ / -)              │  ← in basso o overlay
│ (opzionale: FAB per centrare)       │
├─────────────────────────────────────┤
│ Bottom Navigation Bar               │
└─────────────────────────────────────┘
```

---

## Componenti da Usare

### Header
- Titolo "Mappa"
- Pulsante filtri o layer (mostra/nascondi tipi)
- Sfondo trasparente o blur su mappa

### Mappa
- React Leaflet, tile OpenStreetMap
- Marker cluster per punti vicini
- Marker singoli con popup al tap: titolo ricordo, anteprima immagine, link a `/ricordo/:id`

### Controlli
- Zoom +/- in angolo
- Pulsante "Centra su di me" (geolocalizzazione) opzionale

---

## Dati e API

- `getMapImages()` o `getMemories()` con coordinate
- Coordinate da `location` nei ricordi

---

## Comportamenti

- Tap su marker → popup con info ricordo
- Tap su "Visualizza" nel popup → `/ricordo/:id`
- Zoom e pan touch-friendly
- Safe area per controlli sovrapposti

---

## Impostazioni di Stile

- Mappa: full viewport (sotto header)
- Popup: card bianca, angoli arrotondati, ombra
- Marker: icona custom o default Leaflet
