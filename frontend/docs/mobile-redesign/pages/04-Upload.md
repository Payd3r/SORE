# Pagina Upload Mobile

## Route
`/upload`

## Ruolo
Flusso di caricamento foto: selezione, anteprima, classificazione AI, associazione a ricordo o nuovo ricordo.

---

## Struttura Layout

```
┌─────────────────────────────────────┐
│ Header: Upload + [Annulla]          │
├─────────────────────────────────────┤
│                                     │
│ Area selezione / drop zone          │
│ [Icona upload]                      │
│ "Trascina le foto o tocca per       │
│  selezionare"                       │
│                                     │
├─────────────────────────────────────┤
│ (dopo selezione)                    │
│ Anteprima griglia immagini          │
│ [✓] [✓] [✓] ...                     │
│ Checkbox per deselezionare          │
├─────────────────────────────────────┤
│ [Carica foto] (CTA primario)        │
├─────────────────────────────────────┤
│ (opzionale) Bottom Bar nascosta     │
└─────────────────────────────────────┘
```

---

## Componenti da Usare

### Header
- Titolo "Carica foto"
- Pulsante Annulla (chiude/se torna indietro)

### Drop Zone
- Area grande, bordi tratteggiati o sfondo grigio chiaro
- Icona upload centrale
- Testo: "Trascina le foto qui" / "oppure tocca per selezionare"
- Tap → apertura file picker

### Anteprima Griglia
- Griglia 3–4 colonne con anteprime
- Checkbox per escludere singole foto
- Contatore: "X foto selezionate"

### CTA
- Pulsante "Carica foto" arancione, full-width
- Disabilitato se nessuna foto selezionata

### MobileUploadStatus
- Banner o barra fissa in alto durante upload
- Progress bar, stato (caricamento, elaborazione, completato)
- Già presente nel PwaLayout

---

## Dati e API

- `UploadContext` per gestione upload
- API backend per upload e classificazione
- Redirect o modale di successo a fine upload

---

## Comportamenti

- Gestione multi-selezione file
- Progress visivo durante upload
- Feedback successo/errore
- Possibilità di tornare indietro senza salvare

---

## Impostazioni di Stile

- Drop zone: border-radius 16px, padding 32px
- CTA: angoli arrotondati, padding 16px verticale
- Sfondo: bianco o azzurro pastello leggero
