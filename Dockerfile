# Stage 1: Install deps (including dev)
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci  # install dev + prod dependencies

# Stage 2: Build
FROM node:20-slim AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production runtime
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy only necessary build outputs
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Install **only production dependencies**
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npm", "run", "start"]
