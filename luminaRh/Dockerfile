# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────
# LuminaRH Backend (NestJS + Fastify + Prisma) — image de production
# ─────────────────────────────────────────────────────────────

# ── Base commune ──────────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app
# openssl requis par les moteurs Prisma sur Alpine
RUN apk add --no-cache openssl

# ── Dépendances (cache Docker tant que le lockfile ne change pas)
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --legacy-peer-deps

# ── Build ─────────────────────────────────────────────────────
FROM deps AS build
COPY . .
RUN npx prisma generate \
 && npm run build \
 && npm prune --omit=dev --legacy-peer-deps

# ── Runtime ───────────────────────────────────────────────────
FROM base AS runtime
ENV NODE_ENV=production \
    PORT=3000
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION

COPY --chown=node:node package.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
# Schéma + migrations : nécessaires pour `prisma migrate deploy`
COPY --from=build --chown=node:node /app/prisma ./prisma

USER node
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/api/health > /dev/null || exit 1

CMD ["node", "dist/src/main"]
