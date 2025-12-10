# Web App Dockerfile
# Multi-stage build for React application

# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Build-time env variables for CRA
ARG REACT_APP_API_URL
ARG REACT_APP_CV_SERVICE_URL
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_AUTH_DOMAIN
ARG REACT_APP_FIREBASE_PROJECT_ID
ARG REACT_APP_FIREBASE_STORAGE_BUCKET
ARG REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ARG REACT_APP_FIREBASE_APP_ID

# Expose build args as environment variables so CRA picks them up
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_CV_SERVICE_URL=${REACT_APP_CV_SERVICE_URL}
ENV REACT_APP_FIREBASE_API_KEY=${REACT_APP_FIREBASE_API_KEY}
ENV REACT_APP_FIREBASE_AUTH_DOMAIN=${REACT_APP_FIREBASE_AUTH_DOMAIN}
ENV REACT_APP_FIREBASE_PROJECT_ID=${REACT_APP_FIREBASE_PROJECT_ID}
ENV REACT_APP_FIREBASE_STORAGE_BUCKET=${REACT_APP_FIREBASE_STORAGE_BUCKET}
ENV REACT_APP_FIREBASE_MESSAGING_SENDER_ID=${REACT_APP_FIREBASE_MESSAGING_SENDER_ID}
ENV REACT_APP_FIREBASE_APP_ID=${REACT_APP_FIREBASE_APP_ID}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy startup script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port (will be overridden by Render)
EXPOSE 80

# Set default PORT
ENV PORT=80

# Health check - use environment variable PORT
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/ || exit 1

# Use custom entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
