# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client
RUN npx prisma generate
# Build Vite frontend
RUN npm run build
# Compile server (if we use tsx in production, we can skip typescript compile, but it's better to compile)
RUN npm install -g typescript
RUN tsc server.ts --outDir dist-server --esModuleInterop --skipLibCheck || true

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/prisma ./prisma
# Use tsx to run server.ts in production for simplicity in this boilerplate
RUN npm install -g tsx

EXPOSE 3000
CMD ["tsx", "server.ts"]
