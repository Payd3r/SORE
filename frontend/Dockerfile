# Build stage
FROM node:18-alpine AS builder

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file di configurazione delle dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm ci

# Copia il codice sorgente
COPY . .

# Build dell'applicazione
RUN npm run build

# Production stage
FROM nginx:alpine

# Copia i file buildati dal builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia la configurazione nginx personalizzata
COPY nginx.conf /etc/nginx/nginx.conf

# Crea la directory per i file statici
RUN mkdir -p /usr/share/nginx/html/static

# Esponi la porta 80
EXPOSE 80

# Comando di avvio
CMD ["nginx", "-g", "daemon off;"] 