# WORK IN PROGRESS

# -----------------------------
# Stage 1: Build Go API binary
# -----------------------------
    FROM golang:1.21 AS go-builder

    WORKDIR /app/backend/api
    
    # 1. Download dependencies
    COPY ./api/go.mod ./api/go.sum ./
    RUN go mod download
    
    # 2. Copy source & build
    COPY ./api .
    RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o api
    
    # At the end of this stage, /app/backend/api/api is a static Linux binary
    
    
    # ---------------------------------
    # Stage 2: Build Node.js WebSocket
    # ---------------------------------
    FROM node:18 AS node-builder
    
    WORKDIR /app/backend/ws
    
    COPY ./ws/package.json ./ws/package-lock.json ./
    RUN npm install --only=prod
    
    COPY ./ws .
    
    # At the end of this stage, /app/backend/ws has node_modules + source
    
    
    # ------------------------------
    # Stage 3: Final (Debian‐slim)
    # ------------------------------
    FROM debian:bullseye-slim
    
    # ----------------------
    # 1) Install prerequisites
    # ----------------------
    RUN apt-get update && \
        apt-get install -y --no-install-recommends \
          ca-certificates \
          nginx \
          supervisor \
          curl \
          # Install Node.js runtime (v18.x)
          && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
          && apt-get install -y nodejs \
        && apt-get clean && rm -rf /var/lib/apt/lists/*
    
    # ----------------------
    # 2) Copy built artifacts
    # ----------------------
    WORKDIR /app
    
    # Copy Go binary (from go-builder)
    COPY --from=go-builder /app/backend/api/api ./api
    
    # Copy Node.js app (from node-builder)
    COPY --from=node-builder /app/backend/ws ./ws
    
    # ----------------------
    # 3) Copy Supervisor and Nginx configs
    # ----------------------
    # (Assume your repo has nginx/default.conf and supervisord.conf at project root)
    COPY ./nginx/default.conf /etc/nginx/sites-available/default
    COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf
    
    # ----------------------
    # 4) Expose port 80 (http + ws will be proxied through Nginx)
    # ----------------------
    EXPOSE 80
    
    # ----------------------
    # 5) Entrypoint: run Supervisor
    # ----------------------
    CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
    