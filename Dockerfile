# ========== Builder Stage ==========
FROM node:20-slim AS builder

WORKDIR /app

# Dependencies voor fonts en tooling
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy en install
COPY package*.json ./
RUN npm ci

# Copy alle sources
COPY . .

# Prebuild & build (tsoa spec, tsc, gulp, enz)
RUN npm run prebuild && npm run build

# ========== Runtime Stage ==========
FROM node:20-slim

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV CHROME_BIN=/usr/bin/google-chrome

# Puppeteer dependencies + Google Chrome + fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    fonts-noto \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    fonts-dejavu \
    libxss1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google.gpg \
    && echo "deb [arch=amd64 signed-by=/etc/apt/trusted.gpg.d/google.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Google Fonts
RUN mkdir -p /usr/share/fonts/truetype/google-fonts \
  && wget https://github.com/google/fonts/archive/main.tar.gz -O /tmp/fonts.tar.gz \
  && tar -xf /tmp/fonts.tar.gz -C /tmp \
  && find /tmp/fonts-main/ -name "*.ttf" -exec install -m644 {} /usr/share/fonts/truetype/google-fonts/ \; \
  && fc-cache -f \
  && rm -rf /tmp/* /var/cache/*

# App code
WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 8000

CMD ["node", "dist/index.js"]
