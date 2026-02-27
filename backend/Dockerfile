FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    && rm -rf /var/cache/apk/*

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm prune --production

FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/media /app/config /app/queue

RUN chown -R node:node /app

USER node

EXPOSE 3002

CMD ["npm", "start"]