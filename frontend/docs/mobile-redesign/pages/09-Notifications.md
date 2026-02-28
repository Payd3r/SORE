# Modale / Schermata Notifiche Mobile

## Route / Contesto
- Modale fullscreen aperta da icona campanella in PwaLayout o Header
- Non ha route dedicata, è un overlay

## Ruolo
Lista di notifiche con filtri (Tutte, Lette, Non lette), ricerca, raggruppamento temporale (Oggi, Ieri, ecc.).

---

## Struttura Layout (stile immagine riferimento)

```
┌─────────────────────────────────────┐
│ Header: [←] Notifiche               │
├─────────────────────────────────────┤
│ SearchBar: "Cerca stili..."         │  ← placeholder "Cerca notifiche..."
│ Filtro icona a destra               │
├─────────────────────────────────────┤
│ SegmentedControl: Tutte | Lette | Non lette │
├─────────────────────────────────────┤
│                                     │
│ Oggi                               │
│ ┌─────────────────────────────────┐ │
│ │ [Avatar] Messaggio notifica     │ │
│ │         1 min fa                │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [Avatar] Altra notifica         │ │
│ │         4 ore fa                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Ieri                               │
│ ┌─────────────────────────────────┐ │
│ │ [Avatar] Notifica di ieri       │ │
│ │         02:00                   │ │
│ └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

---

## Componenti da Usare

### Header
- Pulsante indietro (chiude modale)
- Titolo "Notifiche" centrato

### SearchBar
- Placeholder: "Cerca notifiche..."
- Icona lente, icona filtro

### SegmentedControl
- **Tutte** | **Lette** | **Non lette**
- Pillola attiva: blu scuro, testo bianco
- Inattiva: grigio chiaro

### Card Notifica
- Avatar circolare a sinistra (foto utente che ha generato la notifica)
- Testo notifica (titolo/descrizione)
- Timestamp in basso a destra (grigio chiaro): "1 min fa", "4 ore fa", "Ieri 02:00"
- Card bianca, angoli arrotondati
- Stato: non letta → sfondo leggermente diverso o pallino
- Tap → marca come letta, eventuale deep link (es. a ricordo)

### Intestazioni di Gruppo
- "Oggi", "Ieri", "Questa settimana"
- Font bold, leggermente più grande
- Margin top per separare gruppi

---

## Dati e API

- API notifiche (lista, filtri, marca come lette)
- `useNotificationsQuery`, `useNotificationsSummaryQuery` (già esistenti)
- Raggruppamento lato client per data

---

## Comportamenti

- Filtro tab: Tutte / Lette / Non lette
- Ricerca per testo nella notifica
- Tap su notifica → marca letta, chiude modale, naviga a destinazione (se applicabile)
- Pull-to-refresh per aggiornare
- Badge su icona campanella = conteggio non lette (gestito in PwaLayout)

---

## Impostazioni di Stile

- Card: padding 16px, border-radius 12–16px
- Avatar: 40–48px
- Timestamp: font 12px, grigio 400
- Sfondo modale: bianco
- Spacing tra card: 8px
