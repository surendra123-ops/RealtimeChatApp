# ----------------------------
# Stage 1: Build frontend (React + Vite)
# ----------------------------
    FROM node:20-alpine AS frontend-builder

    WORKDIR /app/frontend
    
    # Copy frontend package files
    COPY frontend/chatapp/package.json frontend/chatapp/package-lock.json* ./
    RUN npm ci || npm install
    
    # Copy frontend source and build
    COPY frontend/chatapp/ .
    RUN npm run build
    
    # ----------------------------
    # Stage 2: Production image (backend + built frontend)
    # ----------------------------
    FROM node:20-alpine
    
    WORKDIR /app
    
    # Copy backend package files
    COPY backend/package.json backend/package-lock.json* ./
    # Install production deps only (no realtimechatapp needed at runtime)
    RUN npm ci --omit=dev || npm install --omit=dev
    
    # Copy backend source
    COPY backend/ .
    
    # Copy built frontend into path backend will serve (see index.js)
    COPY --from=frontend-builder /app/frontend/dist ./client
    
    # Render sets PORT; default for local runs
    ENV NODE_ENV=production
    EXPOSE 3000
    
    CMD ["node", "index.js"]