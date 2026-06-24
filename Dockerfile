# ── Stage 1: build the React client ──────────────────────────────────────────
FROM node:20-alpine AS client-build

WORKDIR /build/client

COPY client/package*.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# ── Stage 2: production server ────────────────────────────────────────────────
FROM node:20-alpine

RUN addgroup -S sgtm && adduser -S sgtm -G sgtm

WORKDIR /app

# Install server production dependencies only (no nodemon)
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source
COPY server/ ./server/

# Copy Vite build output so ../client/dist resolves from server/__dirname
COPY --from=client-build /build/client/dist ./client/dist

# Uploads directory — replace with a MinIO/PVC mount in Kubernetes
RUN mkdir -p ./server/uploads && chown -R sgtm:sgtm /app

USER sgtm

EXPOSE 8800

ENV NODE_ENV=production \
    PORT=8800

CMD ["node", "server/index.js"]
