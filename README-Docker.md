# SORE - Deployment Docker

Questo documento descrive come deployare l'applicazione SORE utilizzando Docker e Docker Compose.

## Prerequisiti

- Docker
- Docker Compose
- Portainer (opzionale, per la gestione grafica)

## Configurazione

### 1. Variabili d'Ambiente

Copia il file `.env.example` in `.env` e configura le variabili:

```bash
cp .env.example .env
```

Modifica il file `.env` con i tuoi valori:

```env
# Database Configuration
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=sore
MYSQL_USER=sore_user
MYSQL_PASSWORD=sore_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Frontend Configuration
VITE_API_BASE_URL=http://backend:3002
```

### 2. Credenziali Google Vision (Opzionale)

Se utilizzi il riconoscimento immagini con Google Vision API:

1. Copia il file `google-vision-credentials.json` nella cartella `backend/config/`
2. Il file verrà automaticamente montato nel container

## Deployment

### Metodo 1: Docker Compose CLI

```bash
# Build e avvio di tutti i servizi
docker-compose up -d

# Visualizza i log
docker-compose logs -f

# Ferma i servizi
docker-compose down
```

### Metodo 2: Portainer

1. Apri Portainer nel browser
2. Vai su "Stacks"
3. Clicca "Add stack"
4. Carica il file `docker-compose.yml`
5. Configura le variabili d'ambiente
6. Clicca "Deploy the stack"

## Struttura dei Volumi

I seguenti volumi vengono creati automaticamente per la persistenza dei dati:

- `mysql_data`: Database MySQL
- `backend_media`: File media (immagini, video)
- `backend_config`: File di configurazione
- `backend_queue`: Code di elaborazione
- `frontend_build`: Build del frontend

## Reti

- `web_proxy`: Rete esterna per il reverse proxy
- `internal`: Rete interna per la comunicazione tra servizi

## Servizi

### Database (MySQL)
- **Porta**: 3306
- **Container**: `sore_db`
- **Volume**: `mysql_data`

### Backend (Node.js)
- **Porta**: 3002 (interna)
- **Container**: `sore_backend`
- **Volumi**: `backend_media`, `backend_config`, `backend_queue`

### Frontend (React + Nginx)
- **Porta**: 80 (interna)
- **Container**: `sore_frontend`
- **Volume**: `frontend_build`

## Reverse Proxy

Il frontend è configurato per funzionare con un reverse proxy. Configura il tuo reverse proxy (Nginx, Traefik, etc.) per:

- Servire il frontend sulla porta desiderata
- Inoltrare le richieste `/api/*` al backend
- Inoltrare le richieste `/media/*` al backend

### Esempio Nginx (esterno)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://backend:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /media/ {
        proxy_pass http://backend:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Monitoraggio

### Health Check

- Frontend: `http://your-domain.com/health`
- Backend: `http://your-domain.com/api/health`

### Logs

```bash
# Log del frontend
docker-compose logs frontend

# Log del backend
docker-compose logs backend

# Log del database
docker-compose logs db
```

## Backup

### Database

```bash
# Backup del database
docker exec sore_db mysqldump -u root -p sore > backup.sql

# Restore del database
docker exec -i sore_db mysql -u root -p sore < backup.sql
```

### Media Files

```bash
# Backup dei file media
docker run --rm -v sore_backend_media:/data -v $(pwd):/backup alpine tar czf /backup/media-backup.tar.gz -C /data .

# Restore dei file media
docker run --rm -v sore_backend_media:/data -v $(pwd):/backup alpine tar xzf /backup/media-backup.tar.gz -C /data
```

## Troubleshooting

### Problemi Comuni

1. **Database non si connette**: Verifica che il container `db` sia avviato e che le credenziali siano corrette
2. **Immagini non si caricano**: Verifica che il volume `backend_media` sia montato correttamente
3. **Frontend non si connette al backend**: Verifica che la variabile `VITE_API_BASE_URL` sia configurata correttamente

### Comandi Utili

```bash
# Riavvia un servizio specifico
docker-compose restart backend

# Ricostruisci un'immagine
docker-compose build --no-cache frontend

# Entra in un container
docker-compose exec backend sh
docker-compose exec db mysql -u root -p

# Visualizza l'uso dei volumi
docker volume ls
docker volume inspect sore_backend_media
```

## Aggiornamenti

Per aggiornare l'applicazione:

```bash
# Ferma i servizi
docker-compose down

# Ricostruisci le immagini
docker-compose build --no-cache

# Riavvia i servizi
docker-compose up -d
```

## Sicurezza

- Cambia sempre le password di default
- Usa un JWT_SECRET forte e unico
- Configura HTTPS nel reverse proxy
- Limita l'accesso ai volumi
- Aggiorna regolarmente le immagini Docker 