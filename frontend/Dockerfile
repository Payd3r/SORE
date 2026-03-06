# Build stage
FROM node:18-alpine AS builder

# Installa curl per il download dei font
RUN apk add --no-cache curl

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file di configurazione delle dipendenze
COPY package*.json ./

# Installa le dipendenze
RUN npm ci

# Copia il codice sorgente
COPY . .

# Scarica i font localmente durante il build
# Inter Variable Font (woff2) - dal pacchetto npm @fontsource-variable/inter via unpkg
RUN mkdir -p /app/public/fonts && \
    curl -fsSL \
    "https://unpkg.com/@fontsource-variable/inter@5.1.1/files/inter-latin-wght-normal.woff2" \
    -o /app/public/fonts/Inter-VariableFont.woff2 && \
    echo "Inter downloaded: $(du -k /app/public/fonts/Inter-VariableFont.woff2 | cut -f1) KB"

# Material Symbols Outlined - dal pacchetto npm già installato
RUN cp /app/node_modules/material-symbols/outlined.woff2 /app/public/fonts/material-symbols-outlined.woff2 2>/dev/null || \
    find /app/node_modules/material-symbols -name "*.woff2" | head -1 | xargs -I{} cp {} /app/public/fonts/material-symbols-outlined.woff2 && \
    echo "Material Symbols copied: $(du -k /app/public/fonts/material-symbols-outlined.woff2 | cut -f1) KB"

# Imposta le variabili d'ambiente per il build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

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