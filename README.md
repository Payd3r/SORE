# SORE - Album Tecnologico per Coppie

<div align="center">
  <img src="frontend/public/icons/icon-152x152.png" alt="SORE Logo" width="120" height="120">
  <h3>L'app per condividere e organizzare i vostri momenti speciali</h3>
</div>

## 📱 Cos'è SORE?

SORE è un'applicazione web moderna che trasforma il modo in cui le coppie gestiscono e condividono i loro ricordi fotografici. È un **album digitale intelligente** che organizza automaticamente le vostre foto, le associa a luoghi specifici e permette di collegarle alla musica che ha accompagnato quei momenti speciali.

### ✨ Caratteristiche Principali

- 📸 **Upload Intelligente**: Carica le tue foto e l'AI le organizza automaticamente
- 🗺️ **Mappe Interattive**: Visualizza tutti i tuoi ricordi su una mappa
- 🎵 **Integrazione Spotify**: Collega le canzoni ai tuoi momenti speciali
- 📱 **PWA Nativa**: Funziona come un'app nativa su mobile
- 🔄 **Sincronizzazione**: Condividi tutto con il tuo partner in tempo reale
- 🌙 **Modalità Offline**: Accedi ai tuoi ricordi anche senza connessione

## 🚀 Come Funziona

### 1. **Carica le Foto**
- Seleziona le tue foto preferite
- L'AI le classifica automaticamente (paesaggio, coppia, singolo, cibo)
- Vengono ottimizzate per il web senza perdere qualità

### 2. **Crea Ricordi**
- Raggruppa le foto in "ricordi" con titolo e descrizione
- Aggiungi date, luoghi e dettagli
- Collega una canzone di Spotify per rivivere le emozioni

### 3. **Esplora e Condividi**
- Naviga per categoria o cronologia
- Visualizza tutto su una mappa interattiva
- Condividi automaticamente con il tuo partner

## 🛠️ Tecnologie Utilizzate

### Frontend
- **React 19** con TypeScript
- **Tailwind CSS** per il design
- **PWA** per esperienza nativa mobile
- **React Leaflet** per le mappe

### Backend
- **Node.js** con Express
- **MySQL** per il database
- **Google Vision API** per l'AI
- **Spotify API** per la musica

### DevOps
- **Docker** per la containerizzazione
- **Nginx** come reverse proxy
- **Service Worker** per funzionalità offline

## 📋 Requisiti di Sistema

### Per lo Sviluppo
- Node.js 18+
- Docker e Docker Compose
- MySQL 8.0+
- Git

### Per l'Utilizzo
- Browser moderno (Chrome, Safari, Firefox, Edge)
- Connessione internet per l'upload
- Account Spotify (opzionale)

## 🚀 Installazione e Setup

### Metodo Rapido con Docker

1. **Clona il repository**
   ```bash
   git clone https://github.com/tuousername/sore.git
   cd sore
   ```

2. **Configura le variabili d'ambiente**
   ```bash
   cp .env.example .env
   # Modifica il file .env con le tue configurazioni
   ```

3. **Avvia l'applicazione**
   ```bash
   docker-compose up -d
   ```

4. **Apri nel browser**
   ```
   http://localhost:3000
   ```

### Metodo Manuale

1. **Backend**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Database**
   - Installa MySQL 8.0+
   - Crea un database chiamato `sore`
   - Importa il file `backend/db.sql`

## 📱 Come Usare SORE

### Primi Passi

1. **Registrazione**: Crea un account con email e password
2. **Invita il Partner**: Condividi il link di invito con il tuo partner
3. **Carica le Prime Foto**: Inizia con qualche foto per testare l'AI

### Funzionalità Principali

#### 📸 Galleria
- Visualizza tutte le tue foto organizzate per data
- Filtra per tipo (paesaggio, coppia, singolo, cibo)
- Cerca per luogo o periodo

#### 🗺️ Mappa
- Vedi tutti i tuoi ricordi geograficamente
- Zoom e pan per esplorare i luoghi
- Clicca sui marker per vedere le foto

#### 🎵 Musica
- Cerca brani su Spotify
- Collega canzoni ai tuoi viaggi
- Ascolta preview direttamente nell'app

#### 💡 Idee
- Salva idee per future attività
- Organizza progetti e sogni
- Condividi con il partner

## 🔧 Configurazione Avanzata

### Variabili d'Ambiente

```env
# Database
MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=sore
MYSQL_USER=sore_user
MYSQL_PASSWORD=sore_password

# JWT
JWT_SECRET=your_super_secret_key

# Google Vision API (opzionale)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_CLOUD_PRIVATE_KEY=your_private_key
GOOGLE_CLOUD_CLIENT_EMAIL=your_client_email

# Spotify API (opzionale)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=your_redirect_uri
```

### Personalizzazione

- **Tema**: Modifica i colori in `frontend/tailwind.config.js`
- **Icone**: Sostituisci le icone in `frontend/public/icons/`
- **Splash Screen**: Personalizza le schermate di avvio

## 🤝 Contribuire

1. Fork il progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Commit le tue modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Questo progetto è sotto licenza MIT. Vedi il file `LICENSE` per i dettagli.

## 🆘 Supporto

- **Documentazione**: Controlla la cartella `docs/`
- **Issues**: Apri un issue su GitHub per bug o richieste
- **Email**: Contattaci per supporto diretto

## 🙏 Ringraziamenti

- **Google Cloud Vision API** per la classificazione delle immagini
- **Spotify API** per l'integrazione musicale
- **OpenStreetMap** per le mappe
- **React Community** per gli strumenti di sviluppo

---

<div align="center">
  <p>Creato con ❤️ per le coppie che vogliono conservare i loro momenti speciali</p>
  <p>Made with ❤️ for couples who want to preserve their special moments</p>
</div> 