# Stage 1: Build the Vite frontend and compiled Node server
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./
RUN npm ci

# Copy full application code and build static assets + compiled server
COPY . .
RUN npm run build

# Stage 2: Production execution environment
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Non-root user for container security
USER node

# Copy package manifests and install runtime production dependencies
COPY --chown=node:node package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets and compiled server from builder stage
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/dist-server ./dist-server

# Google Cloud Run default port
EXPOSE 8080

# Start the full-stack server using compiled JS
CMD ["npm", "start"]
