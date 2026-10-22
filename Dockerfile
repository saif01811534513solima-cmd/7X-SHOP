# Stage 1: Build the Vite frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy full application code and build static assets
COPY . .
RUN npm run build

# Stage 2: Production execution environment
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Non-root user for container security
USER node

# Copy package manifests and install runtime dependencies
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets from builder stage
COPY --chown=node:node --from=builder /app/dist ./dist

# Copy server code and runtime assets
COPY --chown=node:node server.ts ./
COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node src/ ./src/

# Google Cloud Run default port
EXPOSE 8080

# Start the full-stack server
CMD ["npm", "start"]
