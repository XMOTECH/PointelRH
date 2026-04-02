# ── Stage 1 : Build ──────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Copier les fichiers de dependances d'abord (cache Docker)
COPY package.json package-lock.json ./
RUN npm ci

# Copier le reste du code source
COPY . .

# Build arg pour l'URL de l'API (injectee au build)
ARG VITE_API_URL=/api
ARG VITE_GOOGLE_CLIENT_ID=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

# ── Stage 2 : Serve avec Nginx ──────────────────────────
FROM nginx:alpine

# Copier la config Nginx pour SPA
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copier le build depuis le stage precedent
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
