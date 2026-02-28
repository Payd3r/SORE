# Pagina / Modale Dettaglio Immagine Mobile

## Route / Contesto
- Modale fullscreen o route `/galleria/:imageId`
- Apertura da Galleria o da Dettaglio Ricordo

## Ruolo
Visualizzazione fullscreen di una singola immagine con possibilità di swipe per navigare tra altre immagini, info minimali, azioni (condividi, elimina).

---

## Struttura Layout

```
┌─────────────────────────────────────┐
│ Header: [←] [Share] [More]          │  ← trasparente, scompare su scroll
├─────────────────────────────────────┤
│                                     │
│                                     │
│         Immagine fullscreen         │
│         (pinch zoom opzionale)      │
│         Swipe sinistra/destra       │
│         per immagini precedente/    │
│         successiva                  │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ (opzionale) Info bar inferiore      │
│ Luogo, data, ricordo associato      │
│ Tap per espandere dettagli          │
└─────────────────────────────────────┘
```

---

## Componenti da Usare

### Header
- Pulsante indietro (chiude modale o torna)
- Titolo: nome ricordo o "Immagine"
- Icona Condividi
- Menu (tre puntini): Elimina, Aggiungi a ricordo, ecc.

### Immagine
- Fullscreen, object-fit contain
- Swipe orizzontale per navigare (se in galleria)
- Indicatore "3/12" se in contesto galleria
- Pinch-to-zoom opzionale

### Info Bar (opzionale)
- Barra semi-trasparente in basso
- Luogo, data
- Link a ricordo associato
- Tap per espandere pannello dettagli

---

## Dati e API

- Immagine passata come prop o da context
- Lista immagini per swipe (da galleria o ricordo)
- API per eliminare, aggiornare associazione

---

## Comportamenti

- Swipe orizzontale → immagine precedente/successiva
- Tap su sfondo → toggle header/info bar
- Indietro → chiude modale o navigate back
- Condividi → Web Share API o fallback

---

## Impostazioni di Stile

- Sfondo: nero per fullscreen
- Header: trasparente, diventa visibile su scroll/tap
- Immagine: max-width/height 100%, centrata
