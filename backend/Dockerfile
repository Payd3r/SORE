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
RUN echo '#!/bin/sh' > /app/create-google-credentials.sh && \
    echo 'if [ -n "$GOOGLE_CLOUD_PRIVATE_KEY" ]; then' >> /app/create-google-credentials.sh && \
    echo '  cat > /app/config/google-vision-credentials.json << EOF' >> /app/create-google-credentials.sh && \
    echo '  {' >> /app/create-google-credentials.sh && \
    echo '    "type": "service_account",' >> /app/create-google-credentials.sh && \
    echo '    "project_id": "${GOOGLE_CLOUD_PROJECT_ID:-carbon-airlock-358411}",' >> /app/create-google-credentials.sh && \
    echo '    "private_key_id": "${GOOGLE_CLOUD_PRIVATE_KEY_ID:-1e2b77625aed67d73e53b35088bf4285b55352d5}",' >> /app/create-google-credentials.sh && \
    echo '    "private_key": "$GOOGLE_CLOUD_PRIVATE_KEY",' >> /app/create-google-credentials.sh && \
    echo '    "client_email": "${GOOGLE_CLOUD_CLIENT_EMAIL:-sore-672@carbon-airlock-358411.iam.gserviceaccount.com}",' >> /app/create-google-credentials.sh && \
    echo '    "client_id": "${GOOGLE_CLOUD_CLIENT_ID:-106474750802467922383}",' >> /app/create-google-credentials.sh && \
    echo '    "auth_uri": "https://accounts.google.com/o/oauth2/auth",' >> /app/create-google-credentials.sh && \
    echo '    "token_uri": "https://oauth2.googleapis.com/token",' >> /app/create-google-credentials.sh && \
    echo '    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",' >> /app/create-google-credentials.sh && \
    echo '    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/sore-672%40carbon-airlock-358411.iam.gserviceaccount.com",' >> /app/create-google-credentials.sh && \
    echo '    "universe_domain": "googleapis.com"' >> /app/create-google-credentials.sh && \
    echo '  }' >> /app/create-google-credentials.sh && \
    echo '  EOF' >> /app/create-google-credentials.sh && \
    echo 'fi' >> /app/create-google-credentials.sh && \
    chmod +x /app/create-google-credentials.sh

# Imposta i permessi corretti
RUN chown -R node:node /app

# Cambia all'utente node per sicurezza
USER node

# Esponi la porta
EXPOSE 3002

# Comando di avvio che prima crea le credenziali Google se necessario
CMD ["/bin/sh", "-c", "/app/create-google-credentials.sh && npm start"] 