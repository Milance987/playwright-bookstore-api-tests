# Multi-stage Dockerfile for Playwright API Tests
# Stage 1: Build dependencies
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Install necessary tools for Playwright
RUN apk add --no-cache \
    chromium \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Copy node modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY package.json package-lock.json ./
COPY tsconfig.json ./
COPY playwright.config.ts ./
COPY src/ ./src/
COPY tests/ ./tests/

# Create test-results directory
RUN mkdir -p test-results playwright-report

# Set default environment variables
ENV API_BASE_URL=${API_BASE_URL:-https://fakerestapi.azurewebsites.net}
ENV CI=true

# Expose port for report server (optional)
EXPOSE 9323

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "console.log('ok')" || exit 1

# Default command: run all tests
CMD ["npm", "test"]
