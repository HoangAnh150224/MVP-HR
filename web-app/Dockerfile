# ---- Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (NEXT_PUBLIC_* are inlined at build time)
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ARG NEXT_PUBLIC_WS_URL=ws://localhost:8080
ARG NEXT_PUBLIC_VOICE_AGENT_WS_URL=ws://localhost:8081
ARG NEXT_PUBLIC_VISION_WS_URL=ws://localhost:8083

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_VOICE_AGENT_WS_URL=$NEXT_PUBLIC_VOICE_AGENT_WS_URL
ENV NEXT_PUBLIC_VISION_WS_URL=$NEXT_PUBLIC_VISION_WS_URL

RUN npm run build

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

# Copy standalone output
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public 2>/dev/null || true

RUN chown -R app:app /app
USER app
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
