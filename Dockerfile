# Multi-stage Dockerfile for EARTHSIM: City Futures Lab
# Stage 1: Build frontend assets
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json tsconfig*.json vite.config.ts index.html ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

# Stage 2: Production Full-Stack Runner
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production
COPY --from=frontend-builder /app/dist ./dist
COPY server.ts ./
COPY src/ ./src/
RUN npm install -g tsx

EXPOSE 3000
CMD ["tsx", "server.ts"]
