# Docker Setup Guide - Running the Frontend Service

This guide provides instructions on how to rebuild and run all necessary containers for the new frontend visualization.

## Quick Start (Recommended)

To rebuild and start all services needed for the frontend:

```bash
# 1. Stop any running containers
docker-compose down

# 2. Rebuild all containers (including new-frontend)
docker-compose build --no-cache

# 3. Start the services in the correct order
docker-compose up -d radar_db
docker-compose up db-init  # Wait for this to complete
docker-compose up -d api indexer newfrontend

# 4. Check service status
docker-compose ps
```

Access the application at: **http://localhost:3000**

---

## Step-by-Step Detailed Instructions

### Prerequisites

- Docker and Docker Compose installed
- At least 4GB of free disk space
- Ports 3000, 8000, and 5433 available

### 1. Clean Existing Containers (Optional but Recommended)

```bash
# Stop and remove all containers
docker-compose down

# Remove all volumes (WARNING: This deletes database data)
docker-compose down -v

# Remove images to force rebuild
docker rmi $(docker images 'webmet25*' -q) 2>/dev/null || true
```

### 2. Rebuild Specific Services

If you only want to rebuild certain services:

```bash
# Rebuild only the new frontend
docker-compose build --no-cache newfrontend

# Rebuild API service
docker-compose build --no-cache api

# Rebuild database init service
docker-compose build --no-cache db-init

# Rebuild all services
docker-compose build --no-cache
```

### 3. Start Services in Order

**Option A: Start all services at once**
```bash
docker-compose up -d
```

**Option B: Start services step by step (recommended for first time)**

```bash
# Step 1: Start database
docker-compose up -d radar_db

# Wait for database to be healthy (check with: docker-compose ps)
# Look for "healthy" status

# Step 2: Initialize database (runs once and exits)
docker-compose up db-init

# Wait for "exited with code 0" message

# Step 3: Start API and indexer
docker-compose up -d api indexer

# Wait for API to be healthy
# Check: curl http://localhost:8000/health

# Step 4: Start new frontend
docker-compose up -d newfrontend

# Access at http://localhost:3000
```

### 4. Verify Services are Running

```bash
# Check all services status
docker-compose ps

# Expected output should show:
# - radar_db: Up (healthy)
# - radar_db_init: Exited (0)
# - radar_api: Up (healthy)
# - radar_indexer: Up
# - radar_new_frontend: Up (healthy)
```

### 5. View Logs

```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f newfrontend
docker-compose logs -f api
docker-compose logs -f indexer
```

---

## Service Details

### Required Services for Frontend

1. **radar_db** (Database)
   - Port: 5433:5432
   - Image: postgis/postgis:15-3.5
   - Status: Must be healthy before other services

2. **db-init** (Database Initialization)
   - Runs once to seed database
   - Must complete successfully before API starts

3. **api** (Backend API)
   - Port: 8000:8000
   - Health check: http://localhost:8000/health
   - Serves radar data and tiles

4. **indexer** (COG File Indexer)
   - Scans and registers COG files in database
   - Watches: ./product_output directory

5. **newfrontend** (React Frontend)
   - Port: 3000:80
   - Accesses API at: http://localhost:8000
   - Built with Vite + React

### Optional Services

- **frontend** (Old frontend) - Port 80
- **genpro25** (Radar processing) - Generates COG files

---

## Troubleshooting

### Frontend doesn't load

```bash
# Check if container is running
docker-compose ps newfrontend

# Check logs
docker-compose logs newfrontend

# Verify API is accessible
curl http://localhost:8000/health
```

### Database connection errors

```bash
# Check database health
docker-compose ps radar_db

# Restart database
docker-compose restart radar_db

# Re-run database init
docker-compose up db-init
```

### Port already in use

```bash
# Find process using port 3000
lsof -i :3000  # On macOS/Linux
netstat -ano | findstr :3000  # On Windows

# Either kill the process or change port in docker-compose.yml
# Change "3000:80" to "3001:80" for frontend service
```

### Rebuild specific service after code changes

```bash
# After changing frontend code
docker-compose build --no-cache newfrontend
docker-compose up -d newfrontend

# After changing API code
docker-compose build --no-cache api
docker-compose restart api
```

### Clear Docker cache completely

```bash
# Remove all stopped containers
docker container prune -f

# Remove all unused images
docker image prune -a -f

# Remove all unused volumes
docker volume prune -f

# Remove build cache
docker builder prune -a -f

# Then rebuild everything
docker-compose build --no-cache
docker-compose up -d
```

---

## Environment Variables

The frontend uses environment variables configured in docker-compose.yml:

```yaml
environment:
  - VITE_API_URL=http://localhost:8000
```

To change the API URL:
1. Edit `docker-compose.yml` and update `VITE_API_URL`
2. Rebuild the frontend: `docker-compose build --no-cache newfrontend`
3. Restart: `docker-compose up -d newfrontend`

---

## Development vs Production

### Development (Local)

```bash
cd new-frontend
npm install
npm run dev
# Access at http://localhost:5173
# Hot-reload enabled
```

### Production (Docker)

```bash
docker-compose up -d newfrontend
# Access at http://localhost:3000
# Optimized build served by nginx
```

---

## Complete Rebuild Workflow

For a complete clean rebuild (recommended if having issues):

```bash
# 1. Stop everything
docker-compose down -v

# 2. Clean Docker cache
docker system prune -a --volumes -f

# 3. Remove local node_modules (optional)
rm -rf new-frontend/node_modules

# 4. Rebuild from scratch
docker-compose build --no-cache

# 5. Start services
docker-compose up -d radar_db
sleep 10  # Wait for database
docker-compose up db-init
docker-compose up -d api indexer newfrontend

# 6. Verify
docker-compose ps
curl http://localhost:8000/health
curl http://localhost:3000
```

---

## Useful Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart specific service
docker-compose restart newfrontend

# View logs (follow mode)
docker-compose logs -f newfrontend

# Execute command in container
docker-compose exec newfrontend sh

# Check service health
docker-compose ps

# Rebuild and restart
docker-compose up -d --build newfrontend

# Force rebuild (no cache)
docker-compose build --no-cache newfrontend
```

---

## Service Dependencies

```
newfrontend
  └─ depends on: api
       └─ depends on: radar_db (healthy), db-init (completed)
            └─ radar_db must be healthy
```

Always start in order:
1. radar_db
2. db-init (wait for completion)
3. api, indexer
4. newfrontend

---

## Checking Service Health

```bash
# Database health
docker-compose exec radar_db pg_isready -U radar

# API health
curl http://localhost:8000/health
# Should return: {"status":"ok","database":true,"timestamp":"..."}

# Frontend health
curl http://localhost:3000/health
# Should return: healthy

# Check all at once
docker-compose ps
```

---

## Next Steps

After services are running:

1. Open browser to **http://localhost:3000**
2. Select a radar from the dropdown
3. Select a product (e.g., DBZH)
4. View radar visualization on map

For testing details, see: `new-frontend/TESTING.md`

For architecture details, see: `ARCHITECTURE.md`
