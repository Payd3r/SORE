## Piano di Rework Totale SORE

Questo documento descrive il piano di rework completo dell’applicazione SORE, con focus su:
- **Stabilità e performance**
- **Esperienza utente (UX/UI) moderna, soprattutto da mobile/PWA**
- **Scalabilità del codice e facilità di manutenzione**

Le sezioni sono organizzate per area, con attività suggerite e note di priorità.

---

## 1. Obiettivi principali

- **Notifiche PWA funzionanti su iOS (iOS 17+ / Safari 17+)**
- **Upload più robusto**, con:
  - supporto a **upload in background** (nei limiti di iOS/Android)
  - feedback chiaro e continuo all’utente
- **Redesign completo mobile/PWA** con grafiche moderne e coerenti
- **Migliore usabilità touch/scroll** su mobile
- **Recap personalizzati**, link di condivisione e contenuti multimediali (video/filmati)
- **Caricamenti fluidi**, skeleton loader e transizioni
- **Integrazioni migliorate** con servizi esterni (Spotify, mappe, eventuali altre app)
- **Architettura più pulita** (frontend e backend), test e CI/CD

---

## 2. PWA & Notifiche (incluso iOS)

### 2.1 Stato attuale

- Manifest PWA completo (`frontend/public/manifest.json`) con icone, splash e shortcuts.
- Service worker avanzato (`frontend/src/service-worker.ts`) con:
  - caching statici (STATIC/DYNAMIC)
  - strategie `network-first` e `stale-while-revalidate` per molte API
  - pagina offline dedicata (`frontend/public/offline.html`)
- Rilevamento modalità PWA (`utils/isPwa.ts`, `useIsPwa`) e layout PWA mobile (`mobile/pwa/PwaLayout.tsx`).
- Notifiche **solo in-app** (API `/api/notifications`, `notificationService.ts`, cron giornaliera).
- Dipendenza `web-push` presente nel backend ma **non ancora integrata**.

### 2.2 Cosa fare

- **Web Push Notification end‑to‑end**
  - [ ] Aggiungere una tabella `push_subscriptions` nel DB con campi (`user_id`, `endpoint`, `keys`, `created_at`, `device_info`).
  - [ ] Creare endpoint backend per:
    - [ ] **registrare** una subscription (`POST /api/push/subscribe`)
    - [ ] **cancellare** una subscription (`DELETE /api/push/unsubscribe`)
  - [ ] Integrare `web-push` in `notificationService.ts` per inviare push:
    - [ ] conversione delle notifiche DB in payload push compatti
    - [ ] gestione errori (subscription scadute → cleanup DB)
  - [ ] Estendere il `service-worker.ts` con:
    - [ ] `self.addEventListener('push', ...)` per mostrare `self.registration.showNotification(...)`
    - [ ] `self.addEventListener('notificationclick', ...)` per gestire deep-link verso ricordi, galleria, idee, profilo
  - [ ] Implementare lato frontend:
    - [ ] UI per **abilitare/disabilitare** notifiche push nelle impostazioni profilo
    - [ ] richiesta permessi `Notification.requestPermission()`
    - [ ] gestione `pushManager.subscribe` con salvataggio della subscription verso il backend

- **Compatibilità iOS 17+ (Safari)**
  - [ ] Verificare corretta registrazione SW e manifest su iOS:
    - [ ] test con PWA “Add to Home Screen” su iOS reale
    - [ ] verifica icone, splash screen, orientamento e `display: fullscreen`
  - [ ] Documentare i limiti noti per iOS (permessi, throttling, background).

- **Migliorie generali PWA**
  - [ ] Separare in modo netto le strategie di caching in `service-worker.ts`:
    - [ ] API JSON (ok con `timestamp`)
    - [ ] risorse binarie (no parsing JSON)
  - [ ] Definire una configurazione centrale per path/strategie (es. mappa di route → strategy).

---

## 3. Upload in background & UX upload

### 3.1 Stato attuale

- Backend:
  - Upload immagini in `backend/src/routes/images.ts` con `upload.array('images', 300)` verso `media/temp`.
  - Elaborazione asincrona con Bull (`config/bull.ts`, `services/imageWorker.ts`, `services/imageProcessor.ts`).
  - Endpoint di stato coda (`/api/images/status/:jobId`, `/api/images/queue/status`).
- Frontend:
  - API `imageService.ts` con `uploadImages`, `pollImageStatus`.
  - Modali desktop (`ImageUploadModal`, `MemoryUploadModal`) e componenti mobile (`UploadMobile`, `MobileUploadStatus`) che:
    - mostrano progresso e stato
    - fanno polling ripetuto per ogni `jobId`
  - Ottimizzazione immagini lato client (`utils/imageOptimization.ts`).

### 3.2 Problemi / limiti

- Mancanza di una vera **coda globale** lato frontend:
  - ogni componente fa polling per conto suo.
  - rischio di richieste duplicate e stati disallineati.
- Nessun supporto reale a:
  - **retry automatici**, gestione errori per singolo file
  - **persistenza** dello stato upload (se l’app si chiude durante un upload, lo stato si perde).
- Configurazione Multer duplicata:
  - `config/multer.ts` e storage inline in `routes/images.ts` con logiche diverse di limiti/tipi file.

### 3.3 Cosa fare

- **Unificare la configurazione Multer**
  - [ ] Spostare logica di upload in `config/multer.ts` con:
    - [ ] cartella target unica (`media/temp` o simile)
    - [ ] limiti dimensione per file e totali
    - [ ] filtro MIME coerente (solo immagini supportate dalla pipeline)
  - [ ] Fare in modo che `routes/images.ts` usi solo il middleware centralizzato.

- **Gestione upload centralizzata lato frontend**
  - [ ] Creare un hook/contesto `useImageUploadManager` che:
    - [ ] mantenga una **coda globale** di upload (file, stato, jobId, errore, retryCount)
    - [ ] gestisca il polling centralizzato verso `/status/:jobId`
    - [ ] esponga eventi/selector per desktop e mobile (progress globale, lista job, stato per memoria).
  - [ ] Collegare `UploadContext` e componenti esistenti a questo manager unico.

- **Upload in background (nei limiti dei browser)**
  - [ ] Sfruttare:
    - [ ] `navigator.sendBeacon` per notificare il backend in chiusura tab, dove possibile.
    - [ ] `background sync` se supportato (Android/Chrome) per queue di retry su errori di rete.
  - [ ] Introdurre una **outbox** in IndexedDB:
    - [ ] salvataggio di job di upload ancora “pending” quando la PWA viene chiusa
    - [ ] ripresa automatica all’apertura successiva

- **Feedback UX più chiaro**
  - [ ] UI dedicata per:
    - [ ] stato globale degli upload (banner o sezione nel layout PWA)
    - [ ] errori specifici (file troppo grandi / tipo non supportato / job fallito)
    - [ ] azioni rapide: “Riprova solo falliti”, “Annulla tutti”, “Dettagli job”
  - [ ] Testo e icone coerenti tra desktop e mobile (design system condiviso).

---

## 4. Redesign mobile & miglior uso di tocchi/scroll

### 4.1 Stato attuale

- Sezioni separate per desktop (`desktop/*`) e mobile (`mobile/*`), con molte duplicazioni di componenti.
- Layout PWA mobile (`PwaLayout`) con:
  - barra in basso (`DownBar`)
  - gradienti di sfondo
  - gestione manuale di alcuni gesti touch (es. blocco swipe da bordo).
- Modale notifiche mobile (`NotificationsMobile`) implementata come bottom sheet drag‑and‑drop con gestione manuale di `touchstart/move/end`.
- `index.html` con `viewport-fit=cover` e `user-scalable=no`.

### 4.2 Cosa fare

- **Design system condiviso**
  - [ ] Introdurre una libreria interna di componenti base:
    - [ ] `Button`, `IconButton`, `Card`, `ListItem`, `Modal`, `BottomSheet`, `Badge`, `Tag`, `Skeleton`, `Toast`.
  - [ ] Utilizzare componenti responsive che cambiano layout tra desktop/mobile mantenendo la stessa logica di dominio.

- **Riduzione duplicazioni desktop/mobile**
  - [ ] Estrarre componenti di dominio comuni (es. card ricordo, lista memorie, lista idee, card immagine) in una cartella condivisa (`/components/shared` o simile).
  - [ ] Lasciare nelle cartelle `desktop` e `mobile` solo i layout‑shell specifici (sidebar vs bottom bar, header, ecc.).

- **Gesture & scroll**
  - [ ] Creare un layer di gestione gesture unificato:
    - [ ] hook `useGestures` o contesto che gestisca:
      - swipe da bordo
      - drag delle bottom sheet
      - scroll locking
  - [ ] Verificare:
    - [ ] uso di `100dvh` vs `100vh` per evitare glitch su iOS
    - [ ] scroll fluido e prevedibile nelle liste lunghe (React Query + virtualizzazione dove serve).
  - [ ] Rivalutare `user-scalable=no` per non penalizzare l’accessibilità:
    - [ ] eventualmente abilitarlo solo in scenari specifici, oppure rimuoverlo in favore di zoom controllato.

- **UI moderna e personalizzata**
  - [ ] Definire un nuovo design (palette colori, tipografia, spacing, radius) in `tailwind.config.js`.
  - [ ] Aggiornare componenti chiave:
    - [ ] home mobile (hero, CTA principali)
    - [ ] galleria (grid moderni, overlay puliti, transizioni)
    - [ ] dettaglio ricordo (layout “story” più immersive, integrazione musica)
    - [ ] profilo/impostazioni (switch chiari per PWA, notifiche, privacy).

---

## 5. Recap personalizzati, link di condivisione, video/filmati

### 5.1 Stato attuale

- Tabella `recap` e API dedicate in backend.
- Pagina recap desktop (`desktop/pages/Recap.tsx`) con grafici Recharts e statistiche.
- Notifiche generano URL interni (es. `/ricordo/:id`, `/galleria`, `/idee/:id`, `/profilo`).
- Nessun uso della Web Share API (`navigator.share`) o di link di condivisione “pubblici”.

### 5.2 Cosa fare

- **Recap personalizzati**
  - [ ] Estendere modello dati recap per:
    - [ ] template diversi (es. “anni insieme”, “viaggi”, “momenti speciali”)
    - [ ] parametri personalizzati (range date, tag, tipi di ricordo)
  - [ ] UI:
    - [ ] wizard di creazione recap con step (selezione periodo, filtri, stile)
    - [ ] pagina recap ottimizzata per mobile, con animazioni soft.

- **Link di condivisione**
  - [ ] Introdurre un sistema di **share link**:
    - [ ] tabella `shared_links` con ID random e permessi (sola lettura, scadenza, ecc.)
    - [ ] endpoint per creare link condivisibili (solo per contenuti autorizzati)
  - [ ] Frontend:
    - [ ] bottone “Condividi” su ricordi/recap:
      - [ ] uso di `navigator.share` dove disponibile
      - [ ] fallback con copia link negli appunti

- **Video/filmati**
  - [ ] Valutare supporto a:
    - [ ] upload video leggeri (breve durata) con pipeline dedicata (thumbnail, compressione)
    - [ ] oppure generazione di **video recap** lato server (FFmpeg) combinando foto e musica (feature avanzata).
  - [ ] UI per distinguere foto, video e “filmati generati”.

---

## 6. Caricamenti più fluidi, skeleton loader & transizioni

### 6.1 Stato attuale

- Loader generico (`Loader` component) usato in varie pagine e modali.
- Niente skeleton strutturali per liste/griglie lunghe.
- Framer Motion già presente come dipendenza ma usato poco/niente nelle parti principali.

### 6.2 Cosa fare

- **Skeleton loader**
  - [ ] Creare componenti skeleton:
    - [ ] `SkeletonCardMemory`, `SkeletonImageGrid`, `SkeletonNotificationItem`, `SkeletonIdeaItem`.
  - [ ] Collegarli a stati `isLoading`/`isFetching` di React Query in:
    - [ ] galleria
    - [ ] lista memorie
    - [ ] recap
    - [ ] notifiche

- **Transizioni fluide**
  - [ ] Introdurre animazioni leggere (Framer Motion):
    - [ ] fade/slide in sulle pagine
    - [ ] animazioni su apertura/chiusura modali e bottom sheet
    - [ ] micro-interazioni su pulsanti principali.

---

## 7. Integrazione con altre app / servizi

### 7.1 Stato attuale

- Integrazione **Spotify** già presente (backend `config/spotify.ts`, `routes/spotify.ts`, frontend `api/spotify.ts`).
- Mappe con React Leaflet e tile OpenStreetMap.
- Dipendenze AI (Vision, TensorFlow, Tesseract) per classificazione immagini.

### 7.2 Cosa fare

- **Approfondire Spotify**
  - [ ] Migliorare UX selezione brani (ricerca, suggerimenti, preferiti).
  - [ ] Aggiungere recap musicali (brani più usati, playlist “storia della coppia”).

- **Condivisione verso altre app**
  - [ ] Implementare Web Share API per:
    - [ ] condividere link a ricordi/recap
    - [ ] condividere screenshot o immagini ottimizzate.
  - [ ] Integrare deep‑link e meta tag se in futuro sarà esposta una versione “pubblica” dei ricordi.

- **Altro**
  - [ ] Valutare integrazione con calendari (es. ICS esportabile per ricordi futuri).
  - [ ] Esplorare eventuali integrazioni con app di messaggistica (precompilazione testi con link).

---

## 8. Architettura backend

### 8.1 Stato attuale

- Express + MySQL con:
  - route per dominio (`routes/auth.ts`, `routes/memories.ts`, `routes/images.ts`, `routes/notifications.ts`, ecc.)
  - servizi separati solo per alcuni domini (`notificationService`, `imageProcessor`, `memoryDateUpdater`).
- SQL scritto direttamente nelle route in molti casi.
- Configurazioni condivise in `config/*` ma usate in maniera non sempre coerente.

### 8.2 Cosa fare

- **Stratificazione per dominio**
  - [ ] Introdurre per ogni dominio:
    - [ ] `routes/` (HTTP + validazioni leggere)
    - [ ] `services/` (business logic)
    - [ ] `repositories/` o `db/` (accesso DB centralizzato)
  - [ ] Spostare query SQL dalle route ai repository.

- **Validazione input**
  - [ ] Aggiungere libreria di validazione (`zod` o simili).
  - [ ] Definire schemi per:
    - [ ] auth (login/registrazione)
    - [ ] creazione/modifica memoria
    - [ ] upload/aggiornamento immagini
    - [ ] idee, notifiche, recap.

- **Gestione errori**
  - [ ] Creare middleware di error handling centralizzato:
    - [ ] formattazione uniforme degli errori (`{ message, code }`)
    - [ ] logging strutturato.

---

## 9. Architettura frontend

### 9.1 Stato attuale

- React 19 + React Router DOM 7 + React Query.
- Struttura a cartelle desktop/mobile con componenti duplicati.
- Due approcci di HTTP client (`axiosInstance` in `api/config.ts` e `fetchWithAuth.ts`).

### 9.2 Cosa fare

- **Layer di API unificato**
  - [ ] Creare un modulo `httpClient` condiviso che:
    - [ ] gestisca token, 403/logout
    - [ ] gestisca errori standardizzati
  - [ ] Aggiornare tutti i file `api/*.ts` per usare questo client unico.

- **Componenti condivisi**
  - [ ] Spostare componenti di dominio comuni in una cartella `shared`.
  - [ ] Usare props per controllare variant desktop/mobile invece di duplicare il codice.

- **Routing e code splitting**
  - [ ] Introdurre `React.lazy` e `Suspense` sulle principali pagine (desktop e mobile).
  - [ ] Definire segmenti logici per il code splitting (es. blocco mappe, blocco recap).

---

## 10. Test & qualità

### 10.1 Stato attuale

- Backend: script Jest definito ma nessun test presente.
- Frontend: nessuna infrastruttura di test (unit/integrazione).

### 10.2 Cosa fare

- **Backend**
  - [ ] Introdurre test unitari per:
    - [ ] servizi puri (`notificationService`, `memoryDateUpdater`, helper vari)
  - [ ] Introdurre test API (Supertest) per route chiave:
    - [ ] auth, memories, images, notifications.

- **Frontend**
  - [ ] Aggiungere Vitest + React Testing Library:
    - [ ] smoke test per pagine principali
    - [ ] test per modali upload/notifiche (apertura/chiusura, stati base)
    - [ ] test per hook custom (`useIsPwa`, `UploadContext`, `AuthContext`).

---

## 11. DevOps, sicurezza & logging

### 11.1 DevOps / CI-CD

- [ ] Aggiungere pipeline CI (es. GitHub Actions) che esegua:
  - [ ] lint + build frontend
  - [ ] build + test backend
  - [ ] eventuale build/push immagini Docker.

### 11.2 Sicurezza

- [ ] Rimuovere secrets hard‑coded da `docker-compose.yml`:
  - [ ] usare `.env` e/o secret manager.
- [ ] Rendere obbligatoria la presenza di `JWT_SECRET` (niente fallback “your-secret-key”).
- [ ] Consolidare configurazione CORS:
  - [ ] usare un unico modulo coerente per ambiente dev/prod.

### 11.3 Logging & monitoring

- [ ] Introdurre logger strutturato lato backend (Pino/Winston).
- [ ] Aggiungere error boundary globale in React.
- [ ] Valutare integrazione Sentry (o simili) per errori frontend/backend.

---

## 12. Priorità suggerite (bozza)

1. **Sicurezza & stabilità**
   - Secrets, JWT, limiti upload, unificazione Multer.
2. **Architettura & qualità codice**
   - Refactor backend/frontend per domini, validazione, http client.
3. **Esperienza utente core**
   - Upload manager centralizzato, UX upload, skeleton loader, redesign mobile.
4. **PWA avanzata & notifiche**
   - Web Push, miglioramenti SW, compat iOS.
5. **Feature avanzate**
   - Recap personalizzati, condivisione link, integrazioni extra, video/filmati.
6. **Test & CI/CD**
   - Copertura test basilare + pipeline automatizzata.

Questo piano può essere raffinato ulteriormente con stime di effort, assegnazione a milestone e dipendenze tra task, ma rappresenta una mappa completa di tutto ciò che conviene fare per il rework dell’app.

