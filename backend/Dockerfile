# Multi-stage Dockerfile for Cloud Build.
# Builds the frontend using Vite, copies the static assets into backend/public,
# then installs backend dependencies and runs the Express server.

FROM node:20-bullseye-slim AS frontend-build
WORKDIR /workspace/frontend

# Build-time args for Vite environment variables
ARG VITE_AI_API_KEY
ARG VITE_AUTHORIZED_EMAILS
ENV VITE_AI_API_KEY=${VITE_AI_API_KEY}
ENV VITE_AUTHORIZED_EMAILS=${VITE_AUTHORIZED_EMAILS}

COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-bullseye-slim AS backend-build
WORKDIR /workspace/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./

# Copy built frontend output from previous stage to backend/public
RUN mkdir -p public
COPY --from=frontend-build /workspace/frontend/dist/ ./public/

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "server.js"]
