# FitForm Mobile App - Expo Development Server
# This Dockerfile runs the Expo dev server for mobile development

FROM node:18-alpine

# Install required system dependencies
RUN apk add --no-cache \
    git \
    openssh-client

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Expose Expo ports
# 8081 - Metro bundler
# 19000 - Expo DevTools
# 19001 - Expo DevTools (packager)
# 19002 - Expo DevTools (web interface)
EXPOSE 8081 19000 19001 19002

# Set environment variables for Expo
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Start Expo development server
CMD ["npx", "expo", "start", "--tunnel"]
