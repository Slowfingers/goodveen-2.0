# Multi-stage build for production

# Stage 1: Build frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build backend
FROM node:20-slim AS backend-builder
WORKDIR /app
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
RUN npx prisma generate

# Stage 3: Production image
FROM node:20-slim
WORKDIR /app

# Install nginx and required libraries
RUN apt-get update && apt-get install -y \
    nginx \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy backend
COPY --from=backend-builder /app /app/server
WORKDIR /app/server

# Copy frontend build
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

# Copy nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/api/health || exit 1

# Start script
COPY docker/start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
