# Pagina Home Mobile

## Route
`/`

## Ruolo
Home principale della PWA: mostra ricordi recenti e idee in evidenza, con ricerca e filtri.

---

## Struttura Layout

```
┌─────────────────────────────────────┐
│ Header (logo + notifiche)           │
├─────────────────────────────────────┤
│ SearchBar: "Cerca destinazione"     │  ← placeholder "Cerca ricordi..."
├─────────────────────────────────────┤
│ SegmentedControl: Ricordi | Idee    │
├─────────────────────────────────────┤
│                                     │
│ Sezione: Ricordi in evidenza        │
│ [Card] [Card] [Card] (scroll H)     │  ← card glassmorphism
│                                     │
│ Sezione: Pianifica la prossima      │
│ [Card] [Card] [Card] (scroll H)     │
│                                     │
│ (oppure tab Idee)                   │
│ [Lista idee con card]               │
│                                     │
├─────────────────────────────────────┤
│ Bottom Navigation Bar               │
└─────────────────────────────────────┘
```

---

## Componenti da Usare

### Header
- Logo SORE (icona + testo) a sinistra
- Icona notifiche a destra, con badge se non lette
- Sfondo trasparente/blur su scroll

### SearchBar
- Placeholder: "Cerca ricordi..." (tab Ricordi) / "Cerca idee..." (tab Idee)
- Icona lente sinistra, icona filtro destra
- Angoli arrotondati, sfondo bianco

### SegmentedControl
- Tab: **Ricordi** | **Idee**
- Pillola attiva: sfondo primario/blu, testo bianco
- Inattiva: grigio chiaro

### Card Ricordo (stile Trevio/destinazioni)
- Immagine di sfondo (cover photo ricordo)
- Overlay glassmorphism inferiore (~35% altezza)
- Titolo ricordo (es. "Roma", "Weekend al mare")
- Sottotitolo: tipo (Viaggio, Evento, Semplice, Futuro)
- Icona luogo (se presente)
- Icona preferiti (cuore) in alto a destra
- Pulsante "Visualizza" o tap su tutta la card → `/ricordo/:id`

### Card Idea
- Card rettangolare bianca, angoli arrotondati
- Titolo idea
- Tipo (Ristoranti, Viaggi, Sfide, Semplici)
- Stato: completata / da completare
- Tap → modale dettaglio idea

### Filtri (menu bottom sheet o popover)
- Ordinamento: più recente, meno recente, casuale
- Tipo ricordo: Viaggio, Evento, Semplice, Futuro
- Tipo idea: Ristoranti, Viaggi, Sfide, Semplici
- Stato idee: Tutte, Completate, Da completare

---

## Dati e API

- `getMemories()` → lista ricordi
- `getIdeas()` → lista idee
- Filtri/ordinamento lato client
- Pull-to-refresh per aggiornare

---

## Comportamenti

- Pull-to-refresh sulla tab Ricordi
- Scroll orizzontale per le sezioni di card
- Tap su card ricordo → navigate `/ricordo/:id`
- Tap su card idea → modale `DetailIdeaModal`
- Ricerca in tempo reale sui dati filtrati
- Menu filtri: bottom sheet o popover sotto icona filtro

---

## Impostazioni di Stile

- Sfondo pagina: azzurro pastello leggero o bianco
- Padding orizzontale: 16px
- Spacing tra sezioni: 24px
- Card: border-radius 16–20px, ombra leggera
