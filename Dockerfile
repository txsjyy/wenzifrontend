# Install dependencies only when needed
FROM node:20-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install


# Build the app
FROM node:20-slim AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image
FROM node:20-slim AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]