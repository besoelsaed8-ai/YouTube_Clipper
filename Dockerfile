# Build stage - Frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install --no-audit --no-fund
COPY client/ ./
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Install Python + yt-dlp + FFmpeg
RUN apk add --no-cache python3 py3-pip ffmpeg redis
RUN pip3 install --break-system-packages yt-dlp

# Server
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/ ./

# Copy built frontend into output directory for static serving
COPY --from=frontend-build /app/client/dist ./public/client

# Create required dirs
RUN mkdir -p temp output

ENV NODE_ENV=production
ENV PORT=3000
ENV REDIS_URL=redis://localhost:6379

EXPOSE 3000

# Start Redis + Server
CMD ["sh", "-c", "redis-server --daemonize yes && node index.js"]
