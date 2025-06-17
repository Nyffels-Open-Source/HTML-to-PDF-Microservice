# ---------- Build stage ----------
FROM node:18-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# ---------- Runtime stage ----------
FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

USER pptruser

COPY --chown=pptruser:pptruser package*.json ./
RUN npm install --omit=dev

COPY --from=builder --chown=pptruser:pptruser /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/index.js"]