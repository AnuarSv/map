#!/bin/bash
set -e

echo "=== WaterMap First Install ==="

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose is not installed"
    exit 1
fi

# Create .env if not exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
JWT_SECRET=$(openssl rand -hex 32)
EOF
    echo ".env created"
fi

# Stop existing containers
echo "Stopping existing containers..."
docker compose down 2>/dev/null || true

# Build all images
echo "Building images..."
docker compose build --no-cache

# Start services
echo "Starting services..."
docker compose up -d

# Wait for postgres
echo "Waiting for PostgreSQL..."
sleep 5

# Initialize database
echo "Initializing database..."
docker compose exec -T backend ./init || echo "Init may have already run"

echo ""
echo "=== Installation Complete ==="
echo ""
echo "Services:"
echo "  Frontend: http://localhost:8080"
echo "  Backend:  http://localhost:5000"
echo "  Postgres: localhost:5432"
echo "  Redis:    localhost:6379"
echo ""
echo "Default login:"
echo "  Email: admin1@watermap.kz"
echo "  Password: 123456"
echo ""
echo "Run './rebuild.sh' to rebuild after code changes"
