# Deployment Guide

Simple guide for deploying the Spotify Dashboard.

## Development

**1. Setup**

```bash
git clone <repository-url>
cd spotify-dashboard
cp env.example .env
# Edit .env with your Spotify credentials
```

**2. Run**

```bash
make dev
```

**3. Access**

- Frontend: http://localhost:3000
- Backend: http://localhost:8040/docs
- Grafana: http://localhost:3001

That's it! Code changes are reflected immediately.

---

## Production

### Prerequisites

- VPS with Docker installed
- Domain name (optional)
- Valid Spotify API credentials

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### Step 2: Deploy Application

```bash
# Clone repo
git clone <repository-url>
cd spotify-dashboard

# Copy env template (optional - ports only)
cp env.example .env

# Create secrets
make secrets

# Deploy
make prod
```

### Step 3: Setup Reverse Proxy

Use Caddy, Nginx or a web server of your choice.

### Step 4: Verify

```bash
# Check status
docker compose -f docker-compose.prod.yml ps

# Check logs
make logs

# Test backend
curl http://localhost:8040/healthz
```

---

## Common Tasks

### View Logs

```bash
make logs                    # All services
make logs service=backend    # Specific service
```

### Update Application

```bash
git pull
make stop
make prod
```

### Restart Services

```bash
docker compose -f docker-compose.prod.yml restart
```

### Backup Database

```bash
docker compose -f docker-compose.prod.yml exec db pg_dump -U postgres spotify_data > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker compose -f docker-compose.prod.yml exec -T db psql -U postgres spotify_data
```

### Rotate Secrets

```bash
rm secrets/<secret_name>.txt
make secrets
docker compose -f docker-compose.prod.yml restart
```

---
