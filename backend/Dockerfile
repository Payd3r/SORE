# Usa l'immagine Node.js ufficiale con Alpine per dimensioni ridotte
FROM node:18-alpine

# Imposta la directory di lavoro
WORKDIR /app

# Installa le dipendenze di sistema necessarie
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Copia i file di configurazione delle dipendenze
COPY package*.json ./

# Installa tutte le dipendenze (inclusi devDependencies per il build)
RUN npm ci

# Copia il codice sorgente
COPY . .

# Compila TypeScript
RUN npm run build

# Rimuovi le devDependencies per ridurre la dimensione dell'immagine
RUN npm prune --production

# Crea le directory necessarie per i volumi
RUN mkdir -p /app/media /app/config /app/queue

# Crea uno script per generare il file delle credenziali Google Vision
COPY <<EOF /app/create-google-credentials.sh
#!/bin/sh
if [ -n "\$GOOGLE_CLOUD_PRIVATE_KEY" ]; then
  cat > /app/config/google-vision-credentials.json << 'CREDENTIALS_EOF'
{
  "type": "service_account",
  "project_id": "\${GOOGLE_CLOUD_PROJECT_ID:-carbon-airlock-358411}",
  "private_key_id": "\${GOOGLE_CLOUD_PRIVATE_KEY_ID:-1e2b77625aed67d73e53b35088bf4285b55352d5}",
  "private_key": "\$GOOGLE_CLOUD_PRIVATE_KEY",
  "client_email": "\${GOOGLE_CLOUD_CLIENT_EMAIL:-sore-672@carbon-airlock-358411.iam.gserviceaccount.com}",
  "client_id": "\${GOOGLE_CLOUD_CLIENT_ID:-106474750802467922383}",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/sore-672%40carbon-airlock-358411.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}
CREDENTIALS_EOF
fi
EOF
RUN chmod +x /app/create-google-credentials.sh

# Imposta i permessi corretti
RUN chown -R node:node /app

# Cambia all'utente node per sicurezza
USER node

# Esponi la porta
EXPOSE 3002

# Comando di avvio che prima crea le credenziali Google se necessario
CMD ["/bin/sh", "-c", "/app/create-google-credentials.sh && npm start"] 