# syntax=docker/dockerfile:1
# ── Stage 1 : Build ──────────────────────────────────────
FROM node:22-alpine AS build

WORKDIR /app

# Copier les fichiers de dependances d'abord (cache Docker)
COPY package.json package-lock.json ./
RUN npm ci --no-audit

# Copier le reste du code source
COPY . .

# Build args (injectes au build, figes dans le bundle JS)
# VITE_API_URL vide = appels relatifs "/api/..." servis par le proxy Nginx ci-dessous.
# (Ne pas mettre "/api" : le code prefixe deja ses routes par /api → /api/api/...)
ARG VITE_API_URL=""
ARG VITE_GOOGLE_CLIENT_ID=""
ARG VITE_KEYCLOAK_URL=""
ARG VITE_KEYCLOAK_REALM="luminarh"
ARG VITE_KEYCLOAK_CLIENT_ID="luminarh-backend"
ENV VITE_API_URL=$VITE_API_URL \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL \
    VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM \
    VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID

RUN npm run build

# ── Stage 2 : Serve avec Nginx ──────────────────────────
FROM nginx:1.27-alpine

# Copier la config Nginx pour SPA
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build depuis le stage precedent
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz > /dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
