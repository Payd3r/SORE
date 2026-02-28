# Pagina Profilo Mobile

## Route
`/profilo`

## Ruolo
Profilo utente, informazioni coppia, statistiche, impostazioni, logout, notifiche push.

---

## Struttura Layout

```
┌─────────────────────────────────────┐
│ Header: Profilo + [Menu]            │
├─────────────────────────────────────┤
│ Sezione utente                      │
│ [Avatar] Nome utente                │
│          $453.00 (o info saldo)     │  ← stile dashboard
│                                     │
├─────────────────────────────────────┤
│ SegmentedControl: Profilo | Coppia | Stats │
├─────────────────────────────────────┤
│                                     │
│ (Tab Profilo)                       │
│ - Modifica profilo                  │
│ - Cambia password                   │
│ - Notifiche push (toggle)           │
│ - Tema chiaro/scuro (toggle)        │
│ - Elimina account                   │
│                                     │
│ (Tab Coppia)                        │
│ - Avatar partner, nome              │
│ - Link invito                       │
│                                     │
│ (Tab Statistiche)                   │
│ - Grafico attività (opzionale)      │
│ - Ricordi totali, foto totali       │
│                                     │
├─────────────────────────────────────┤
│ [Logout]                            │
├─────────────────────────────────────┤
│ Bottom Navigation Bar               │
└─────────────────────────────────────┘
```

---

## Componenti da Usare

### Header
- Titolo "Profilo"
- Menu (tre puntini) per azioni extra

### Sezione Utente (stile dashboard)
- Avatar circolare grande
- Nome utente in grassetto
- Info aggiuntiva (es. "Partner: Nome") o statistiche rapide

### SegmentedControl
- Profilo | Coppia | Statistiche
- Contenuto sotto cambia in base alla tab

### Lista Impostazioni
- Riga: icona + label + valore/toggle/freccia
- Card bianca, angoli arrotondati
- Modifica profilo → modale `EditProfileModal`
- Cambia password → modale `ChangePassModal`
- Notifiche push → toggle
- Tema → toggle chiaro/scuro
- Elimina account → modale `DeleteAccountModal`

### Statistiche (opzionale)
- Card con numeri: ricordi totali, foto totali
- Grafico semplice (barre o linee) per attività mensile

### Logout
- Pulsante secondario o link, colore rosso/grigio

---

## Dati e API

- `getUserInfo()`, `getCoupleInfo()`
- `getRecapData()`, `getRecapConfronto()` per statistiche
- `usePushNotifications()`
- Modali esistenti per edit, password, delete

---

## Comportamenti

- Toggle notifiche push → enable/disable
- Toggle tema → `document.documentElement.classList.toggle('dark')`
- Logout → `logout()` + navigate `/welcome`
- Modali esistenti riutilizzabili

---

## Impostazioni di Stile

- Avatar: 64–80px, border-radius 50%
- Lista: padding 16px, separatori leggeri
- Sfondo: bianco o azzurro pastello per header
