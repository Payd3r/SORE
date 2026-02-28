# SORE Mobile — Design System Combinato

> Sistema di design unificato per la PWA mobile, con supporto per tema chiaro e scuro.

---

## 1. Temi: Chiaro e Scuro

Il design system gestisce due temi. Il tema si attiva con la classe `dark` su `document.documentElement`. Usare variabili CSS per tutti i valori che cambiano per tema.

### Variabili CSS (consigliate)

```css
:root {
  /* Sfondi */
  --bg-page: #F8FAFC;
  --bg-card: #FFFFFF;
  --bg-elevated: #FFFFFF;
  --bg-input: #F5F5F5;
  --bg-secondary: #EEEEEE;
  --bg-page-accent: #E0F2F7;
  
  /* Testo */
  --text-primary: #000000;
  --text-secondary: #424242;
  --text-tertiary: #9E9E9E;
  --text-inverse: #FFFFFF;
  
  /* Bordi */
  --border-default: #EEEEEE;
  --border-focus: #FF6B35;
  
  /* Primari e Accent */
  --color-primary: #FF6B35;
  --color-primary-hover: #E85A2A;
  --color-primary-active: #D94E1F;
  --color-accent-pink: #E91E63;
  --color-accent-blue: #0A84FF;
  
  /* Ombre */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.08);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.1);
  
  /* Glassmorphism */
  --glass-overlay: rgba(0,0,0,0.4);
  --glass-border: rgba(255,255,255,0.2);
}

.dark {
  --bg-page: #0D1117;
  --bg-card: #161B22;
  --bg-elevated: #21262D;
  --bg-input: #21262D;
  --bg-secondary: #30363D;
  --bg-page-accent: #0D2D3A;
  
  --text-primary: #F0F6FC;
  --text-secondary: #B1BAC4;
  --text-tertiary: #8B949E;
  --text-inverse: #0D1117;
  
  --border-default: #30363D;
  --border-focus: #FF8A65;
  
  --color-primary: #FF8A65;
  --color-primary-hover: #FFAB91;
  --color-primary-active: #FFCCBC;
  --color-accent-pink: #F48FB1;
  --color-accent-blue: #82B1FF;
  
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.35);
  --shadow-lg: 0 4px 16px rgba(0,0,0,0.4);
  
  --glass-overlay: rgba(0,0,0,0.6);
  --glass-border: rgba(255,255,255,0.08);
}
```

### Tema Chiaro (Light)

| Token | Valore | Uso |
|-------|--------|-----|
| `--bg-page` | `#F8FAFC` | Sfondo principale pagina |
| `--bg-card` | `#FFFFFF` | Card, modali, BottomNav |
| `--bg-input` | `#F5F5F5` | SearchBar, input |
| `--bg-page-accent` | `#E0F2F7` | Home/Dashboard (azzurro pastello) |
| `--text-primary` | `#000000` | Titoli, testo principale |
| `--text-secondary` | `#424242` | Testo corpo |
| `--text-tertiary` | `#9E9E9E` | Placeholder, caption |
| `--color-primary` | `#FF6B35` | CTA, link, stati attivi |

### Tema Scuro (Dark)

| Token | Valore | Uso |
|-------|--------|-----|
| `--bg-page` | `#0D1117` | Sfondo principale pagina |
| `--bg-card` | `#161B22` | Card, modali, BottomNav |
| `--bg-input` | `#21262D` | SearchBar, input |
| `--bg-page-accent` | `#0D2D3A` | Home/Dashboard (blu scuro) |
| `--text-primary` | `#F0F6FC` | Titoli, testo principale |
| `--text-secondary` | `#B1BAC4` | Testo corpo |
| `--text-tertiary` | `#8B949E` | Placeholder, caption |
| `--color-primary` | `#FF8A65` | CTA, link, stati attivi (arancione più chiaro) |

---

## 2. Palette Colori (base semantica)

### Colori Primari (invariati per tema)
| Nome | Light | Dark | Uso |
|------|-------|------|-----|
| Primary | `#FF6B35` | `#FF8A65` | CTA, stati attivi |
| Primary Hover | `#E85A2A` | `#FFAB91` | Hover su CTA |
| Primary Active | `#D94E1F` | `#FFCCBC` | Active/pressed su CTA |
| Accent Pink | `#E91E63` | `#F48FB1` | Badge, preferiti |
| Accent Blue | `#0A84FF` | `#82B1FF` | SegmentedControl, info |

### Colori Neutri (Light)
| Nome | Hex | Uso |
|------|-----|-----|
| White | `#FFFFFF` | Sfondi card |
| Gray 50 | `#FAFAFA` | Sfondi alternativi |
| Gray 100 | `#F5F5F5` | Input, sezioni |
| Gray 200 | `#EEEEEE` | Bordi |
| Gray 400 | `#9E9E9E` | Testo secondario |
| Gray 700 | `#424242` | Testo corpo |
| Black | `#000000` | Titoli |

### Colori Neutri (Dark)
| Nome | Hex | Uso |
|------|-----|-----|
| Gray 950 | `#0D1117` | Sfondo pagina |
| Gray 900 | `#161B22` | Sfondo card |
| Gray 800 | `#21262D` | Sfondo input |
| Gray 700 | `#30363D` | Bordi |
| Gray 400 | `#8B949E` | Placeholder |
| Gray 300 | `#B1BAC4` | Testo secondario |
| Gray 100 | `#F0F6FC` | Titoli, testo principale |

### Glassmorphism
- Overlay: `--glass-overlay` (light: `rgba(0,0,0,0.4)` / dark: `rgba(0,0,0,0.6)`)
- Backdrop blur: `backdrop-filter: blur(12px)` — `blur(20px)`
- Bordo: `--glass-border` (light: `rgba(255,255,255,0.2)` / dark: `rgba(255,255,255,0.08)`)

---

## 3. Tipografia

### Famiglia
- **Sans-serif**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif`

### Scala
| Elemento | Size | Weight | Line-height |
|----------|------|--------|-------------|
| H1 | 24px | 700 | 1.2 |
| H2 | 20px | 600 | 1.3 |
| H3 | 17px | 600 | 1.35 |
| Body | 15px | 400 | 1.5 |
| Body small | 13px | 400 | 1.4 |
| Caption | 12px | 400 | 1.3 |
| Label | 11px | 500 | 1.2 (uppercase) |

### Convenzioni per tema
- Titoli sezioni: maiuscolo, bold, `var(--text-primary)`
- Testo corpo: `var(--text-secondary)`
- Placeholder: `var(--text-tertiary)`
- Testo su overlay scuro (glassmorphism): sempre bianco

---

## 4. Spacing e Layout

### Unità Base
- **4px** = unità minima
- **8px, 12px, 16px, 20px, 24px** = spacing comuni
- **32px** = padding pagina
- **48px** = altezza BottomNav + safe-area

### Safe Area
- `env(safe-area-inset-top)` per header
- `env(safe-area-inset-bottom)` per BottomNav
- `env(safe-area-inset-left)`, `env(safe-area-inset-right)` per margini laterali

### Border Radius
| Elemento | Radius |
|----------|--------|
| Card | 16px — 20px |
| Button | 12px — 16px (pillola: 9999px) |
| Input/SearchBar | 12px — 16px |
| Badge | 8px |
| Avatar | 50% |

---

## 5. Componenti Base

### 5.1 Card (Glassmorphism)
- Contenitore con immagine di sfondo
- Overlay inferiore ~30–35% altezza: `var(--glass-overlay)`, backdrop blur
- Testo bianco: titolo grande, sottotitolo piccolo (sempre bianco su overlay)
- Icone outline bianche (heart, tag, airplane)
- Pulsante azione: `var(--bg-input)` o `var(--bg-secondary)`, angoli molto arrotondati

### 5.2 SearchBar
- Rettangolo con angoli arrotondati
- Sfondo: `var(--bg-card)`, bordo: `var(--border-default)`
- Icona lente a sinistra, icona filtro a destra
- Placeholder: `var(--text-tertiary)`
- Hover: `border-color: var(--border-focus)` | Focus: outline `var(--color-primary)`

### 5.3 SegmentedControl
- Contenitore: sfondo `var(--bg-input)`, padding ridotto
- Pills attiva: sfondo `var(--color-primary)` o `var(--color-accent-blue)`, testo bianco, bold
- Pills inattiva: testo `var(--text-secondary)`
- Hover su inattiva: sfondo `var(--bg-secondary)` (opzionale)

### 5.4 Bottom Navigation Bar
- Sfondo: `var(--bg-card)`, angoli superiori arrotondati
- 5 icone con etichette: Home, Explore/Galleria, Upload, Mappa, Profilo
- Icona attiva: `var(--color-primary)` + sottile linea sotto il testo
- Icona inattiva: `var(--text-secondary)` o `var(--text-tertiary)`
- Badge su Profilo: `var(--color-accent-pink)` o rosso
- Active: `opacity: 0.9` o `transform: scale(0.95)`

### 5.5 Header (Top Navigation Bar)
- Pulsante indietro: circolare, sfondo `var(--bg-input)`, icona `var(--text-primary)`
- Titolo centrato: grassetto, `var(--text-primary)`
- Azioni destra: share, heart, menu (icone outline, `var(--text-primary)`)

### 5.6 Hero + Content Card
- Immagine grande in alto (carousel se multipla)
- Scheda sovrapposta: sfondo `var(--bg-card)`, bordi superiori arrotondati
- Badge sovrapposto (es. sconto, tipo): angoli arrotondati, sfondo primario/accent
- Dati: rating (stella + numero), luogo, descrizione (`var(--text-primary)` / `--text-secondary`)
- CTA bar fissa: sfondo `var(--bg-card)`, pulsante `var(--color-primary)` con testo bianco
- Hover CTA: `var(--color-primary-hover)` | Active: `var(--color-primary-active)`

### 5.7 Card Contenuto (Lista)
- Sfondo: `var(--bg-card)`, angoli arrotondati
- Avatar circolare a sinistra
- Titolo: `var(--text-primary)`, descrizione: `var(--text-secondary)`
- Timestamp: `var(--text-tertiary)`
- Hover: `var(--shadow-md)` o `background: var(--bg-elevated)` | Active: `opacity: 0.95`

### 5.8 Pulsanti
- **Primario**: sfondo `var(--color-primary)`, testo bianco, angoli arrotondati
  - Hover: `var(--color-primary-hover)`, `transform: scale(1.02)`
  - Active: `var(--color-primary-active)`, `transform: scale(0.98)`
- **Secondario**: sfondo `var(--bg-card)`, bordo `var(--border-default)`, testo `var(--text-primary)`
  - Hover: `var(--bg-input)` | Active: `var(--bg-secondary)`
- **Icona**: circolare, sfondo `var(--bg-input)`, icona `var(--text-primary)`
  - Hover: `var(--bg-secondary)` | Active: `opacity: 0.8`

---

## 6. Iconografia

- **Stile**: outline, monocromatico
- **Set**: react-icons/io5 o set coerente (Lucide, Heroicons)
- **Dimensione**: 20–24px per azioni, 16–18px per inline
- Colore: ereditato dal contesto (grigio/nero/bianco/primario)

---

## 7. Ombre

Usare variabili `--shadow-sm`, `--shadow-md`, `--shadow-lg` che cambiano per tema.

- Card: `var(--shadow-md)`
- Button: `var(--shadow-sm)`
- BottomNav: `0 -2px 10px rgba(0,0,0,0.05)` (light) / `0 -2px 10px rgba(0,0,0,0.3)` (dark)

---

## 8. Stati Interattivi: Hover, Active, Focus

### Hover (dispositivi con cursore, es. tablet)

| Elemento | Light | Dark |
|----------|-------|------|
| Pulsante primario | `background: var(--color-primary-hover)`, `transform: scale(1.02)` | idem |
| Pulsante secondario | `background: var(--bg-secondary)` | idem |
| Card cliccabile | `box-shadow: var(--shadow-lg)`, opacità leggermente aumentata | idem |
| Icona/azione | Opacità 0.8 → 1 | idem |
| Link | `text-decoration: underline`, `color: var(--color-primary-hover)` | idem |

### Active / Pressed (touch e click)

| Elemento | Comportamento |
|----------|---------------|
| Pulsante primario | `background: var(--color-primary-active)`, `transform: scale(0.98)` |
| Pulsante secondario | `background: var(--bg-input)` |
| Card | `opacity: 0.95` |
| Icona | `opacity: 0.7` |
| Tab / SegmentedControl item | Già gestito con stato attivo visivo |

### Focus (accessibilità, navigazione tastiera)

| Elemento | Comportamento |
|----------|---------------|
| Pulsante, Link, Input | `outline: 2px solid var(--color-primary)` o `var(--border-focus)`, `outline-offset: 2px` |
| Evitare | `outline: none` senza alternativa (usare `:focus-visible`) |
| Focus ring | Visibile solo su `:focus-visible` per non disturbare touch |

### Transizioni per stati interattivi

```css
/* Consigliato per pulsanti e card */
transition: background-color 150ms ease-out,
            color 150ms ease-out,
            transform 150ms ease-out,
            box-shadow 200ms ease-out,
            opacity 150ms ease-out;
```

---

## 9. Animazioni e Transizioni

### Durate standard

| Nome | Valore | Uso |
|------|--------|-----|
| `--duration-instant` | 100ms | Micro-feedback (tap, toggle) |
| `--duration-fast` | 150ms | Hover, active |
| `--duration-normal` | 200ms | Transizioni UI standard |
| `--duration-slow` | 300ms | Modali, drawer, page transition |
| `--duration-slower` | 400ms | Animazioni decorative |

### Curve di easing

| Nome | Valore | Uso |
|------|--------|-----|
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Elementi in entrata |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elementi in uscita |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Transizioni bidirezionali |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Micro-animazioni (es. badge) |
| `--ease-spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Elementi “pop” |

### Animazioni per contesto

| Contesto | Animazione | Parametri |
|----------|------------|-----------|
| Cambio pagina | Fade + slide verticale | `opacity 0→1`, `y 16→0`, 200ms ease-out |
| Modale apertura | Fade + scale | `opacity 0→1`, `scale 0.95→1`, 250ms ease-out |
| Modale chiusura | Fade | `opacity 1→0`, 150ms ease-in |
| Bottom sheet | Slide up | `y 100%→0`, 300ms ease-out |
| Pull-to-refresh | Rotate icona | `rotate 0→360deg` durante refresh |
| Skeleton loading | Pulse | `opacity 0.5→1`, 1.5s ease-in-out infinite |
| Badge / notifica | Scale pop | `scale 0→1`, 200ms ease-bounce |
| Tab switch | Sotto-underline slide | `transform: translateX()`, 200ms ease-out |
| Lista item aggiunta | Fade + slide | `opacity 0→1`, `y -8→0`, 250ms ease-out |

### Framer Motion (esempi)

```tsx
// Transizione pagina
<motion.div
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
>

// Modale
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
>

// Lista stagger
<motion.ul>
  {items.map((item, i) => (
    <motion.li
      key={item.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05, duration: 0.2 }}
    >
```

### Riduzione movimento

- Rispettare `prefers-reduced-motion: reduce`
- Se attivo: disabilitare animazioni decorative, ridurre durate a 0 o quasi
- Mantenere transizioni essenziali (es. opacity) a durata minima (50–100ms)

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
