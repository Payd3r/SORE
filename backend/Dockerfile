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

# Installa le dipendenze
RUN npm ci --only=production

# Copia il codice sorgente
COPY . .

# Compila TypeScript
RUN npm run build

# Crea le directory necessarie per i volumi
RUN mkdir -p /app/media /app/config /app/queue

# Imposta i permessi corretti
RUN chown -R node:node /app

# Cambia all'utente node per sicurezza
USER node

# Esponi la porta
EXPOSE 3002

# Comando di avvio
CMD ["npm", "start"] 