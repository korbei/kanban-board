# ---- Stage 1: Build frontend ----
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Build backend ----
FROM gradle:8.14-jdk21 AS backend-build

WORKDIR /app/backend
COPY backend/ ./
RUN gradle installDist --no-daemon

# ---- Stage 3: Runtime ----
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S kanban && adduser -S kanban -G kanban

WORKDIR /app

# Copy backend distribution
COPY --from=backend-build /app/backend/build/install/kanban-backend/ ./

# Copy frontend build into a static directory served by Ktor
COPY --from=frontend-build /app/frontend/dist/ ./static/

# Create directories for data and uploads
RUN mkdir -p data uploads && chown -R kanban:kanban /app

USER kanban

EXPOSE 8080

VOLUME ["/app/data", "/app/uploads"]

CMD ["./bin/kanban-backend"]
